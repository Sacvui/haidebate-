import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { getAllUsers } from "@/lib/kv";

const ALLOWED_ADMIN_EMAIL = "foreverlove3004@gmail.com";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Strict Authorization
        if (!session || !session.user || session.user.email !== ALLOWED_ADMIN_EMAIL) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await getAllUsers(100);
        return NextResponse.json({ users });
    } catch (error) {
        console.error("Admin Users Error:", error);
        return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
    }
}
