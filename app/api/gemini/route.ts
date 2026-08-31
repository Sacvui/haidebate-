import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { z } from 'zod';

// Redis-based Rate Limiting Config
const RATE_LIMIT_WINDOW = 60; // 1 minute
const MAX_REQUESTS = 10; // Max requests per window

// Input Validation Schema
const GeminiRequestSchema = z.object({
    model: z.string().min(1, "Model is required"),
    prompt: z.string().min(1, "Prompt is required"),
    inlineData: z.object({
        mimeType: z.string(),
        data: z.string()
    }).optional(),
    useCustomKey: z.boolean().optional().default(false),
    userId: z.string().optional() // Optional for tracking
});

export const runtime = 'edge'; // Disabled for Node.js compatibility (ioredis)
export const maxDuration = 60; // Allow longer execution for Gemini API

export async function POST(request: NextRequest) {
    try {
        const isDev = process.env.NODE_ENV === 'development';

        // 2. Parse and Validate Request Body
        const json = await request.json();
        const validation = GeminiRequestSchema.safeParse(json);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid Input', details: validation.error.format() },
                { status: 400 }
            );
        }

        let { model } = validation.data;
        const { prompt, inlineData, useCustomKey, userId: reqUserId } = validation.data;

        // 1. Check authentication
        const session = await auth();
        
        let isAuthorized = false;
        let authenticatedUserId = 'anonymous';

        if (session?.user?.email) {
            isAuthorized = true;
            authenticatedUserId = session.user.email;
        } else if (reqUserId) {
            const userInKV = await kv.get(`user:${reqUserId}`);
            if (userInKV) {
                isAuthorized = true;
                authenticatedUserId = reqUserId;
            }
        }

        if (!isAuthorized && !isDev) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login to use AI features.' },
                { status: 401 }
            );
        }

        // 3. Rate Limiting (Redis/KV based)
        const userId = authenticatedUserId;

        // Logic: specific limit for standard users, bypass for custom key
        if (!useCustomKey) {
            try {
                // Use UserID if available, fallback to IP
                const ip = request.headers.get('x-forwarded-for') || 'anonymous_ip';
                const identifier = userId || ip;
                const rateKey = `ratelimit:${identifier}`;

                const current = await kv.incr(rateKey);

                // Set expiration on first request
                if (current === 1) {
                    await kv.expire(rateKey, RATE_LIMIT_WINDOW);
                }

                if (current > MAX_REQUESTS) {
                    return NextResponse.json(
                        { error: 'System busy (Rate Limit). Please wait a moment or use your own API Key.' },
                        { status: 429 }
                    );
                }
            } catch (kvError) {
                console.error('Rate Limit Error (Redis KV failed, bypassing):', kvError);
                // Fail-open: allow request if Redis fails
            }
        }

        // 4. Get API key (custom or server default)
        let apiKey: string | undefined;

        if (useCustomKey) {
            // Check for custom key in header (for advanced users)
            apiKey = request.headers.get('x-gemini-api-key') || undefined;
        }

        if (!apiKey) {
            // Use server-side key
            apiKey = process.env.GEMINI_API_KEY;
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured. Please contact administrator or provide your own key in Settings.' },
                { status: 500 }
            );
        }

        // 5. Call Gemini API
        const keySource = useCustomKey && request.headers.get('x-gemini-api-key')
            ? 'CUSTOM (User)'
            : 'SERVER (ENV)';

        // Sanitize PII in logs
        const safeUserId = userId ? `${userId.substring(0, 3)}***@***` : 'anonymous';
        console.log(`📡 Gemini API Call: Model=${model}, KeySource=${keySource}, User=${safeUserId}`);

                const executeGemini = (targetModel: string): Response => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`;
            
            const parts: any[] = [{ text: prompt }];
            if (inlineData) {
                parts.push({
                    inlineData: {
                        mimeType: inlineData.mimeType,
                        data: inlineData.data
                    }
                });
            }

            // Create a ReadableStream that starts immediately
            const stream = new ReadableStream({
                async start(controller) {
                    // Send an immediate SSE comment to flush headers
                    controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
                    
                    // Pump keep-alives every 5 seconds to bypass Vercel timeout during long generations
                    const keepAliveInterval = setInterval(() => {
                        try {
                            controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
                        } catch (e) {
                            clearInterval(keepAliveInterval);
                        }
                    }, 5000);

                    try {
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts }],
                                generationConfig: {
                                    maxOutputTokens: 8192
                                }
                            })
                        });

                        clearInterval(keepAliveInterval);

                        if (!res.ok) {
                            const rawText = await res.text();
                            let errorObj;
                            try {
                                errorObj = JSON.parse(rawText);
                            } catch (e) {
                                errorObj = { error: { code: res.status || 502, message: "Invalid JSON response from Google API" } };
                            }
                            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorObj)}\n\n`));
                            controller.close();
                            return;
                        }

                        if (!res.body) {
                            controller.close();
                            return;
                        }

                        const reader = res.body.getReader();
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            controller.enqueue(value);
                        }
                        controller.close();
                    } catch (error: any) {
                        clearInterval(keepAliveInterval);
                        const errorObj = { error: { code: 500, message: error.message || "Fetch failed" } };
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorObj)}\n\n`));
                        controller.close();
                    }
                }
            });

            // Return stream immediately to prevent Vercel 504 timeout waiting for first byte from upstream
            return new NextResponse(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                }
            });
        };

        const result = await executeGemini(model);
        
        return result;

    } catch (error: any) {
        console.error('Gemini proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
