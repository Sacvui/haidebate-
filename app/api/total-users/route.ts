import { NextRequest, NextResponse } from 'next/server';
import { getTotalUsers } from '@/lib/kv';

export async function GET(request: NextRequest) {
    try {
        const total = await getTotalUsers();
        return NextResponse.json({ total });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get total users' }, { status: 500 });
    }
}
