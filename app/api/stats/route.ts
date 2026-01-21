import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { auth } from '@/lib/auth';

// Base stats to make the system look established (Marketing "Fake it til you make it" strategy for launch)
// In production, you might want to remove these or set them to actual historical data.
const BASE_STATS = {
    users: 1240,
    debates: 8560,
    projects: 430
};

export async function GET() {
    try {
        // Fetch real increments from KV
        // keys: stats:users, stats:debates, stats:projects
        const realUsers = await kv.get<number>('stats:users') || 0;
        const realDebates = await kv.get<number>('stats:debates') || 0;
        const realProjects = await kv.get<number>('stats:projects') || 0;

        return NextResponse.json({
            users: BASE_STATS.users + realUsers,
            debates: BASE_STATS.debates + realDebates,
            projects: BASE_STATS.projects + realProjects
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(BASE_STATS); // Fallback to base
    }
}

export async function POST(request: Request) {
    try {
        // Require authentication for tracking to prevent spam
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type } = body;

        // Strict allowed types
        const allowedTypes = ['user_signup', 'new_session', 'project_complete'];
        if (!allowedTypes.includes(type)) {
            return NextResponse.json({ error: 'Invalid stat type' }, { status: 400 });
        }

        if (type === 'user_signup') {
            await kv.incr('stats:users');
        } else if (type === 'new_session') {
            await kv.incr('stats:debates');
        } else if (type === 'project_complete') {
            await kv.incr('stats:projects');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to track stat' }, { status: 500 });
    }
}
