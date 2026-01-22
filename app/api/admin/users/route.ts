import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { getAllUsers, kv } from "@/lib/kv";

const ALLOWED_ADMIN_EMAIL = "foreverlove3004@gmail.com";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Strict Authorization
        if (!session || !session.user || !session.user.email || session.user.email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Debug checks
        try {
            const users = await getAllUsers(100);

            // Check if KV is actually working
            // If empty, try a test write/read to confirm connection
            if (users.length === 0) {
                try {
                    await kv.set('system:health_check', 'ok');
                    const check = await kv.get('system:health_check');
                    if (check !== 'ok') {
                        throw new Error("KV Read/Write failed");
                    }
                } catch (connErr: any) {
                    return NextResponse.json({
                        error: "Database Connection Failed",
                        debug: "Could not write to KV/Redis. Check env vars.",
                        details: connErr.message
                    }, { status: 500 });
                }
            }

            return NextResponse.json({ users });
        } catch (kvError: any) {
            console.error("KV Error:", kvError);
            return NextResponse.json({
                error: "Failed to fetch from KV",
                details: kvError.message,
                stack: kvError.stack
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Admin Users Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
