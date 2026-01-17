import { NextRequest, NextResponse } from 'next/server';
import { HAI_RONG_CHOI_PROMPT } from '@/lib/prompts/haiRongChoi';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic, apiKey } = body;

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400 }
            );
        }

        const key = apiKey || process.env.GEMINI_API_KEY;

        if (!key) {
            return NextResponse.json(
                { error: 'API Key is required' },
                { status: 401 }
            );
        }

        // Use native fetch like in AgentSession
        const model = "gemini-3-flash-preview"; // MUST match model in lib/agents.ts
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const fullPrompt = `
${HAI_RONG_CHOI_PROMPT}

---
INPUT CỦA ADMIN:
"${topic}"

HÃY VIẾT BÀI POST NGAY BÂY GIỜ.
`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Gemini API Error');
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Lỗi: Không có phản hồi từ AI.";

        return NextResponse.json({ content: text });

    } catch (error: any) {
        console.error('Generate Post Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
