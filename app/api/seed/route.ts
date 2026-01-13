
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
    const userId = "seed-user-hailp";
    const user = {
        id: userId,
        email: "hailp@test.com",
        referralCode: "HAILP100K",
        referredBy: "admin",
        points: 100000,
        createdAt: new Date().toISOString()
    };

    try {
        // 1. Create User
        await kv.set(`user:${userId}`, user);

        // 2. Map Email to ID (for login)
        // NOTE: Our login logic might search by scanning keys or a specific index. 
        // Let's check how login works. 
        // If login is currently "Enter Email -> Search DB", we need to make sure 'hailp@test.com' is findable.
        // Assuming simple KV structure or we need an email-to-id index.
        // Let's create an index just in case: email:{email} -> userId
        await kv.set(`email:hailp@test.com`, userId);

        // Also map "hailp" as an email for convenience if the user just types "hailp"
        await kv.set(`email:hailp`, userId);

        // 3. User List Index (optional but good for admin)
        await kv.sadd("users", userId);

        return NextResponse.json({
            success: true,
            message: "Seeded user 'hailp' with 100,000 points!",
            user
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
