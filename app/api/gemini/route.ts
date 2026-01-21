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
    useCustomKey: z.boolean().optional().default(false),
    userId: z.string().optional() // Optional for tracking
});

// export const runtime = 'edge'; // Disabled for Node.js compatibility (ioredis)

export async function POST(request: NextRequest) {
    try {
        // 1. Check authentication
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login to use AI features.' },
                { status: 401 }
            );
        }

        // 2. Parse and Validate Request Body
        const json = await request.json();
        const validation = GeminiRequestSchema.safeParse(json);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid Input', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { model, prompt, useCustomKey } = validation.data;

        // 3. Rate Limiting (Redis/KV based)
        const userId = session.user.email || 'anonymous';

        // Logic: specific limit for standard users, bypass for custom key
        if (!useCustomKey) {
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
        }

        if (!model || !prompt) {
            return NextResponse.json(
                { error: 'Missing required fields: model and prompt' },
                { status: 400 }
            );
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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // 6. Handle Gemini API errors
        if (data.error) {
            const errorCode = data.error.code;
            const errorMsg = data.error.message;

            console.error('Gemini API Error:', { model, code: errorCode, message: errorMsg, userId });

            // Return user-friendly error messages
            if (errorCode === 429 || errorMsg.toLowerCase().includes('quota')) {
                console.error(`🚨 QUOTA EXCEEDED: Model=${model}, KeySource=${keySource}, User=${userId}`);
                return NextResponse.json(
                    { error: `API quota exceeded (Model: ${model}, Key: ${keySource}). Please wait or use your own API key in Settings.` },
                    { status: 429 }
                );
            }

            if (errorCode === 404) {
                return NextResponse.json(
                    { error: `Model "${model}" not found. Please check the model name.` },
                    { status: 404 }
                );
            }

            if (errorCode === 401 || errorCode === 403) {
                return NextResponse.json(
                    { error: 'Invalid API key. Please check configuration.' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: `Gemini API error (${errorCode}): ${errorMsg}` },
                { status: response.status }
            );
        }

        // 7. Extract and return response
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return NextResponse.json(
                { error: 'No response from AI' },
                { status: 500 }
            );
        }

        return NextResponse.json({ text });

    } catch (error: any) {
        console.error('Gemini proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
