import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRoundsConfig, setRoundsConfig, type RoundsConfig } from '@/lib/kv';

const ADMIN_EMAIL = 'foreverlove3004@gmail.com';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Allow all authenticated users to read config
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const config = await getRoundsConfig();
        return NextResponse.json({ config });
    } catch (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Only admin can update config
        if (session?.user?.email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { config } = body as { config: RoundsConfig };

        // Validate config
        if (!config || typeof config !== 'object') {
            return NextResponse.json({ error: 'Invalid config format' }, { status: 400 });
        }

        const requiredKeys: (keyof RoundsConfig)[] = ['1_TOPIC', '2_MODEL', '3_OUTLINE', '4_SURVEY'];
        for (const key of requiredKeys) {
            if (typeof config[key] !== 'number' || config[key] < 1 || config[key] > 10) {
                return NextResponse.json({
                    error: `Invalid value for ${key}. Must be between 1 and 10.`
                }, { status: 400 });
            }
        }

        await setRoundsConfig(config);
        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('Error updating config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
