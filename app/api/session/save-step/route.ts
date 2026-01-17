import { NextRequest, NextResponse } from 'next/server';
import { saveStepResult, type StepResult } from '@/lib/kv';
import { WorkflowStep } from '@/lib/agents';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, sessionId, step, data } = body as {
            userId: string;
            sessionId: string;
            step: WorkflowStep;
            data: StepResult;
        };

        // Validate inputs
        if (!userId || !sessionId || !step || !data) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Save to database
        await saveStepResult(userId, sessionId, step, data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in save-step API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
