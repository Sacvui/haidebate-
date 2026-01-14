import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { addPoints } from "@/lib/kv";

const ALLOWED_ADMIN_EMAIL = "foreverlove3004@gmail.com";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Strict Authorization
        if (!session || !session.user || session.user.email !== ALLOWED_ADMIN_EMAIL) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, points, reason } = body;

        if (!userId || typeof points !== 'number') {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Add (or subtract if negative) points
        const newTotal = await addPoints(userId, points, reason || "Admin adjustment");

        return NextResponse.json({ success: true, newPoints: newTotal });
    } catch (error) {
        console.error("Admin Points Error:", error);
        return NextResponse.json({ error: 'Failed to update points' }, { status: 500 });
    }
}
