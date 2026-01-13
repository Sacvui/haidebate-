import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/kv';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return NextResponse.json({ error: 'Email chưa được đăng ký' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Lỗi đăng nhập' }, { status: 500 });
    }
}
