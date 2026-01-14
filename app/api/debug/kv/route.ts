import { kv } from "@/lib/kv";
import { NextResponse } from "next/server";

export async function GET() {
    const envStatus = {
        KV_REST_API_URL: process.env.KV_REST_API_URL ? "Set" : "Missing",
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "Set" : "Missing",
        REDIS_URL: process.env.REDIS_URL ? "Set (Custom)" : "Missing",
        AUTH_SECRET: process.env.AUTH_SECRET ? "Set" : "Missing",
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? "Set" : "Missing",
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? "Set" : "Missing",
        ORCID_CLIENT_ID: process.env.ORCID_CLIENT_ID ? "Set" : "Missing",
        ORCID_CLIENT_SECRET: process.env.ORCID_CLIENT_SECRET ? "Set" : "Missing",
    };

    try {
        const start = Date.now();
        await kv.set("debug_ping", "pong");
        const value = await kv.get("debug_ping");
        const duration = Date.now() - start;

        return NextResponse.json({
            status: "ok",
            message: "KV Connection Successful",
            value,
            duration: `${duration}ms`,
            env: envStatus
        });
    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "KV Connection Failed",
            error: String(error),
            env: envStatus
        }, { status: 500 });
    }
}
