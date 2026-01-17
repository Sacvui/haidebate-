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


        const { action, currentDraft, critique } = body;

        let prompt = "";
        let apiKey = safeWriterKey;
        let role = "Writer";

        switch (action) {
            case 'draft':
                prompt = `${WRITER_PROMPT}\n\nINPUT: "${topic}"\n\nVIẾT BÀI NHÁP ĐẦU TIÊN (DRAFT 1):`;
                role = "Writer";
                apiKey = safeWriterKey;
                break;
            case 'critique':
                prompt = `${CRITIC_PROMPT}\n\nBÀI NHÁP: "${currentDraft}"\n\nNHẬN XÉT (ROUND 1):`;
                role = "Critic";
                apiKey = safeCriticKey;
                break;
            case 'revise':
                prompt = `${WRITER_PROMPT}\n\nINPUT: "${topic}"\n\nBÀI NHÁP CŨ:\n${currentDraft}\n\nLỜI CHÊ CỦA SẾP:\n"${critique}"\n\nNHIỆM VỤ: VIẾT LẠI (DRAFT 2) KHẮC PHỤC CÁC LỖI TRÊN.`;
                role = "Writer";
                apiKey = safeWriterKey;
                break;
            case 'final_critique':
                prompt = `${CRITIC_PROMPT}\n\nBÀI NHÁP 2: "${currentDraft}"\n\nNHẬN XÉT (ROUND 2 - FINAL):`;
                role = "Critic";
                apiKey = safeCriticKey;
                break;
            case 'final':
                prompt = `${WRITER_PROMPT}\n\nINPUT: "${topic}"\n\nBÀI NHÁP 2:\n${currentDraft}\n\nLỜI CHÊ CỦA SẾP:\n"${critique}"\n\nNHIỆM VỤ: VIẾT BẢN HOÀN THIỆN CUỐI CÙNG (FINAL). ĐỪNG ĐỂ TAO THẤT VỌNG.`;
                role = "Writer";
                apiKey = safeWriterKey;
                break;
            case 'polish':
                prompt = `${WRITER_PROMPT}\n\nINPUT: "${topic}"\n\nBÀI HOÀN THIỆN:\n${currentDraft}\n\nNHIỆM VỤ: ĐỌC LẠI VÀ CHUỐT LẠI CÂU TỪ CHO MƯỢT MÀ, THANH THOÁT HƠN (POLISH). Giữ nguyên ý chính, chỉ làm cho văn phong trôi chảy như nước, nghệ sĩ hơn.`;
                role = "Writer";
                apiKey = safeWriterKey;
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const content = await callGemini(model, prompt, apiKey);
        return NextResponse.json({ content, role, action });



    } catch (error: any) {
        console.error('Debate Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
