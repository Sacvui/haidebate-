// Force Vercel Rebuild: 2026-01-13 21:40
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import { getUserByEmail, createUser } from "@/lib/kv";

// Define ORCID Provider manually if not exported or standard OIDC
const OrcidProvider = {
    id: "orcid",
    name: "ORCID",
    type: "oauth" as const,
    authorization: {
        url: "https://orcid.org/oauth/authorize",
        params: { scope: "/authenticate" },
    },
    token: "https://orcid.org/oauth/token",
    userinfo: "https://orcid.org/oauth/userinfo", // ORCID might not return standard userinfo, check docs
    // ORCID returns user info in token response usually: orcid, name
    profile(profile: any) {
        return {
            id: profile.sub || profile.orcid,
            name: profile.name || profile.given_name,
            email: profile.email,
            image: null,
        }
    },
    clientId: process.env.ORCID_CLIENT_ID,
    clientSecret: process.env.ORCID_CLIENT_SECRET,
}

export const config = {
    theme: {
        logo: "https://next-auth.js.org/img/logo/logo-sm.png",
    },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        {
            id: "orcid",
            name: "ORCID",
            type: "oauth",
            clientId: process.env.ORCID_CLIENT_ID,
            clientSecret: process.env.ORCID_CLIENT_SECRET,
            authorization: {
                url: "https://orcid.org/oauth/authorize",
                params: { scope: "/authenticate" },
            },
            token: "https://orcid.org/oauth/token",
            userinfo: {
                url: "https://pub.orcid.org/v3.0/expanded-search",
            },
            profile(profile) {
                return {
                    id: profile.orcid,
                    name: profile.name || profile.given_name,
                    email: null,
                }
            },
            allowDangerousEmailAccountLinking: true,
        }
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            try {
                // Check if user exists in KV
                const existingUser = await getUserByEmail(user.email);

                if (!existingUser) {
                    // Create new user (No password for OAuth users)
                    await createUser(user.email, undefined, undefined);
                }
                return true;
            } catch (error) {
                console.error("Error syncing OAuth user:", error);
                return false;
            }
        },
        authorized({ request, auth }) {
            return true
        },
    },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
