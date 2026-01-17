import { NextRequest, NextResponse } from 'next/server';
import { getPostPrompts, savePostPrompts } from '@/lib/kv';
import { HAI_RONG_CHOI_PROMPT, HAI_RONG_CHOI_CRITIC_PROMPT } from '@/lib/prompts/haiRongChoi';

export async function GET() {
    try {
        const stored = await getPostPrompts();
        return NextResponse.json({
            prompts: stored || {
                writer: HAI_RONG_CHOI_PROMPT,
                critic: HAI_RONG_CHOI_CRITIC_PROMPT
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { writer, critic } = body;

        if (!writer || !critic) {
            return NextResponse.json({ error: 'Both writer and critic prompts are required' }, { status: 400 });
        }

        await savePostPrompts({ writer, critic });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
