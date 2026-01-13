
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// ... imports

export async function GET() {
    const usersToSeed = [
        {
            id: "seed-user-hailp",
            email: "hailp@test.com",
            referralCode: "HAILP100K",
            referredBy: "admin",
            points: 100000,
            username: "hailp"
        },
        {
            id: "seed-user-tinng",
            email: "TinNg@test.com",
            referralCode: "TINNG100K",
            referredBy: "admin",
            points: 100000,
            username: "TinNg"
        }
    ];

    try {
        const results = [];
        for (const u of usersToSeed) {
            const user = {
                id: u.id,
                email: u.email,
                referralCode: u.referralCode,
                referredBy: u.referredBy,
                points: u.points,
                createdAt: new Date().toISOString()
            };

            // 1. Create User
            await kv.set(`user:${u.id}`, user);

            // 2. Map Email/Username to ID
            await kv.set(`email:${u.email}`, u.id);
            await kv.set(`email:${u.username}`, u.id); // For easy login

            // 3. User List Index
            await kv.sadd("users", u.id);

            results.push(u.username);
        }

        return NextResponse.json({
            success: true,
            message: `Seeded users: ${results.join(', ')} with 100,000 points each!`,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
