import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
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
            env: {
                KV_REST_API_URL: process.env.KV_REST_API_URL ? "Set" : "Missing",
                KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "Set" : "Missing",
                AUTH_SECRET: process.env.AUTH_SECRET ? "Set" : "Missing",
                AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? "Set" : "Missing",
            }
        });
    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "KV Connection Failed",
            error: String(error),
            env: {
                KV_REST_API_URL: process.env.KV_REST_API_URL ? "Set" : "Missing",
                KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "Set" : "Missing"
            }
        }, { status: 500 });
    }
}
