import { NextRequest, NextResponse } from 'next/server';
import { HAI_RONG_CHOI_PROMPT, HAI_RONG_CHOI_CRITIC_PROMPT } from '@/lib/prompts/haiRongChoi';
import { getPostPrompts } from '@/lib/kv';

// Helper to call Gemini (native fetch)
async function callGemini(modelName: string, prompt: string, apiKey: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e: any) {
        throw new Error(`Gemini API Error: ${e.message}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic, writerKey, criticKey } = body;

        if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });

        // Keys: Require separate keys or fallback to env for both
        const safeWriterKey = writerKey || process.env.GEMINI_API_KEY;
        // Critic key can be same as writer if not provided, but user advised separate keys
        const safeCriticKey = criticKey || safeWriterKey;

        if (!safeWriterKey) return NextResponse.json({ error: 'Writer API Key is required' }, { status: 401 });

        // FETCH PROMPTS (Use KV if available, else Fallback)
        const storedPrompts = await getPostPrompts();
        const WRITER_PROMPT = storedPrompts?.writer || HAI_RONG_CHOI_PROMPT;
        const CRITIC_PROMPT = storedPrompts?.critic || HAI_RONG_CHOI_CRITIC_PROMPT;

        const model = "gemini-3-flash-preview";

        let history = [];
        let currentDraft = "";

        // --- ROUND 1: WRITER DRAFT ---
        const r1Prompt = `${WRITER_PROMPT}\n\nINPUT: "${topic}"\n\nVIẾT BÀI NHÁP ĐẦU TIÊN (DRAFT 1):`;
        currentDraft = await callGemini(model, r1Prompt, safeWriterKey);
        history.push({ role: 'Writer', content: currentDraft, round: 1 });

        // --- ROUND 2: CRITIC REVIEW & WRITER REVISE ---
        // Critic
        const r2CriticPrompt = `${CRITIC_PROMPT}\n\nBÀI NHÁP: "${currentDraft}"\n\nNHẬN XÉT (ROUND 1):`;
        const critique1 = await callGemini(model, r2CriticPrompt, safeCriticKey);
        history.push({ role: 'Critic', content: critique1, round: 2 });

        // Writer Revise
        const r2WriterPrompt = `${WRITER_PROMPT}\n\nINPUT: "${topic}"\n\nBÀI NHÁP CŨ:\n${currentDraft}\n\nLỜI CHÊ CỦA SẾP:\n"${critique1}"\n\nNHIỆM VỤ: VIẾT LẠI (DRAFT 2) KHẮC PHỤC CÁC LỖI TRÊN.`;
        currentDraft = await callGemini(model, r2WriterPrompt, safeWriterKey);
        history.push({ role: 'Writer', content: currentDraft, round: 2 });

        // --- ROUND 3: FINAL POLISH ---
        // Critic
        const r3CriticPrompt = `${CRITIC_PROMPT}\n\nBÀI NHÁP 2: "${currentDraft}"\n\nNHẬN XÉT (ROUND 2 - FINAL):`;
        const critique2 = await callGemini(model, r3CriticPrompt, safeCriticKey);
        history.push({ role: 'Critic', content: critique2, round: 3 });

        // Writer Final
        const r3WriterPrompt = `${WRITER_PROMPT}\n\nINPUT: "${topic}"\n\nBÀI NHÁP 2:\n${currentDraft}\n\nLỜI CHÊ CỦA SẾP:\n"${critique2}"\n\nNHIỆM VỤ: VIẾT BẢN HOÀN THIỆN CUỐI CÙNG (FINAL). ĐỪNG ĐỂ TAO THẤT VỌNG.`;
        currentDraft = await callGemini(model, r3WriterPrompt, safeWriterKey);
        history.push({ role: 'Writer', content: currentDraft, round: 3 });

        return NextResponse.json({ content: currentDraft, history });

    } catch (error: any) {
        console.error('Debate Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
