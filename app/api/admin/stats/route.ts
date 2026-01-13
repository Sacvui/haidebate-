import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/lib/kv';

export async function GET(request: NextRequest) {
    try {
        const stats = await getUserStats();
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
