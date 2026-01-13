
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
        async signIn({ user, account, profile }) {
            // Logic to sync with KV
            // If Google login:
            if (account?.provider === 'google') {
                const email = user.email;
                if (email) {
                    // Check KV, create if needed
                    // We cannot import 'createUser' here directly if it functionality relies on 'server-only' or similar context?
                    // Actually lib/kv.ts is safely usable on server.
                    // 1. Get user by email
                    // 2. If not exists, create with random password/null password
                }
            }
            return true;
        },
        authorized({ request, auth }) {
            return true
        },
    },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
