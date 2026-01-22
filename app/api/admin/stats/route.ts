import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/lib/kv';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        // Strict Admin Check
        // In a real app, this should check a role in DB or a list of admin emails
        // For now, we fallback to a safe env var or reject if not set
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!session?.user?.email || (adminEmail && session.user.email.toLowerCase() !== adminEmail.toLowerCase())) {
            return NextResponse.json({ error: 'Unauthorized: Admin access only' }, { status: 403 });
        }

        const stats = await getUserStats();
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
