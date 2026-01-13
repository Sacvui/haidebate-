import { NextResponse } from 'next/server';
import { validateShareUrl, canShare, submitShare } from '@/lib/kv';

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

        // 2. Check daily limit
        const allowed = await canShare(userId);
        if (!allowed) {
            return NextResponse.json({
                error: 'Bạn đã hết lượt nhận điểm chia sẻ hôm nay (3/3).'
            }, { status: 429 });
        }

        // 3. Submit and award points
        await submitShare(userId, postUrl);

        return NextResponse.json({ success: true, message: 'Đã cộng 30 điểm!' });
    } catch (error) {
        console.error('Share error:', error);
        return NextResponse.json({ error: 'Lỗi xử lý chia sẻ' }, { status: 500 });
    }
}
