import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Simple in-memory rate limiter (fallback if KV not available)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (userLimit.count >= limit) {
        return false;
    }

    userLimit.count++;
    return true;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [userId, data] of rateLimitMap.entries()) {
        if (now > data.resetTime) {
            rateLimitMap.delete(userId);
        }
    }
}, 5 * 60 * 1000);

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

        // 2. Rate limiting
        const userId = session.user.email;
        if (!checkRateLimit(userId)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
                { status: 429 }
            );
        }

        // 3. Parse request body
        const body = await request.json();
        const { model, prompt, useCustomKey } = body;

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

        console.log(`📡 Gemini API Call: Model=${model}, KeySource=${keySource}, User=${userId}`);

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
