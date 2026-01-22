import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAdminRoute = req.nextUrl.pathname.startsWith('/api/admin')

    // Protect Admin Routes
    if (isAdminRoute) {
        if (!isLoggedIn) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        // Additional admin check can be done here if req.auth has role
    }

    return NextResponse.next()
})

export const config = {
    // matcher: ['/api/admin/:path*']
    matcher: [] // Disable middleware to prevent Edge Runtime crash due to ioredis/bcrypt in auth lib
}
