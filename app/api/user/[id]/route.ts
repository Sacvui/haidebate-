import { NextResponse } from 'next/server';
import { getUser } from '@/lib/kv';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = params.id;
        const user = await getUser(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Fetch user error:', error);
        return NextResponse.json({ error: 'Lỗi tải thông tin' }, { status: 500 });
    }
}
