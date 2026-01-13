import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/kv';

export async function GET(request: NextRequest) {
    try {
        // TODO: Add admin authentication check here
        const users = await getAllUsers(100);
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
    }
}
