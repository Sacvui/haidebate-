import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/kv';
import { compare } from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return NextResponse.json({ error: 'Email chưa được đăng ký' }, { status: 404 });
        }

        // Verify password if user has one
        if (user.password) {
            if (!password) {
                return NextResponse.json({ error: 'Vui lòng nhập mật khẩu' }, { status: 400 });
            }
            const isValid = await compare(password, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Mật khẩu không đúng' }, { status: 401 });
            }
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Lỗi đăng nhập' }, { status: 500 });
    }
}
