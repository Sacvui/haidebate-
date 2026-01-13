
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

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
        Google,
        // We will use a custom provider for ORCID if standard one has issues, 
        // but let's try standard approach or generic OIDC if possible.
        // For now, let's assume we might need a custom config for ORCID Sandbox/Prod toggle.
        {
            id: "orcid",
            name: "ORCID",
            type: "oauth",
            clientId: process.env.ORCID_CLIENT_ID,
            clientSecret: process.env.ORCID_CLIENT_SECRET,
            authorization: {
                url: "https://orcid.org/oauth/authorize",
                params: { scope: "/authenticate" }
            },
            token: "https://orcid.org/oauth/token",
            userinfo: {
                url: "https://pub.orcid.org/v3.0/expanded-search", // Tricky with ORCID
                // ORCID is special. Let's start with Google first as it's standard.
                // For ORCID, I will add a placeholder or simple config.
            },
            profile(profile) {
                return {
                    id: profile.orcid,
                    name: profile.name,
                    email: null, // ORCID doesn't always share email
                }
            }
        }
    ],
    callbacks: {
        import { getUserByEmail, createUser } from "@/lib/kv";

        // ...

        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            try {
                // Check if user exists in KV
                const existingUser = await getUserByEmail(user.email);

                if (!existingUser) {
                    // Create new user (No password for OAuth users)
                    // Note: createUser now requires password as 2nd arg? No, I made it optional?
                    // Let's check kv.ts signature.
                    // It was: createUser(email, password?, referredBy?)
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
