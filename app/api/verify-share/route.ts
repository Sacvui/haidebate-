import { NextResponse } from 'next/server';
import { validateShareUrl, tryClaimShareReward } from '@/lib/kv';

export async function POST(req: Request) {
    try {
        const { userId, postUrl } = await req.json();

        if (!userId || !postUrl) {
            return NextResponse.json({ error: 'Missing userId or postUrl' }, { status: 400 });
        }

        // 1. Validate URL format
        const isValid = await validateShareUrl(postUrl);
        if (!isValid) {
            return NextResponse.json({
                error: 'Link không hợp lệ. Chỉ chấp nhận Facebook, Zalo, LinkedIn, Twitter.'
            }, { status: 400 });
        }

        // 2. Submit and Claim Reward (Atomic Check)
        const result = await tryClaimShareReward(userId, postUrl);

        if (!result.success) {
            return NextResponse.json({
                error: result.reason
            }, { status: 429 });
        }

        return NextResponse.json({ success: true, message: 'Đã cộng 30 điểm!' });
    } catch (error) {
        console.error('Share error:', error);
        return NextResponse.json({ error: 'Lỗi xử lý chia sẻ' }, { status: 500 });
    }
}
