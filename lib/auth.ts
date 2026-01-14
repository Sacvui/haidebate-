// Force Vercel Rebuild: 2026-01-13 22:10 (ORCID Keys Added)
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import { cookies } from "next/headers";

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
                    name: profile.name || profile.given_name || "ORCID User",
                    email: profile.email || `${profile.orcid}@orcid.local`,
                    image: null,
                }
            },
            allowDangerousEmailAccountLinking: true,
        }
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // DEBUG: Force allow to test Provider/Env config
            return true;

            /*
            if (!user.email) return false;

            try {
                // Check if user exists in KV
                const existingUser = await getUserByEmail(user.email);

                if (!existingUser) {
                     // Create new user (No password for OAuth users)
                     // Note: We disabled cookie-based referral for stability. 
                     // Users can add referral code manually later if needed.
                    await createUser(user.email, undefined, undefined);
                }
                return true;
            } catch (error) {
                console.error("Error syncing OAuth user:", error);
                // FAILSAFE: Allow login even if KV sync fails to prevent AccessDenied
                return true; 
            }
            */
        },
        async session({ session, token }) {
            if (session.user && session.user.email) {
                const dbUser = await getUserByEmail(session.user.email);
                if (dbUser) {
                    // @ts-ignore
                    session.user.id = dbUser.id;
                    // @ts-ignore
                    session.user.points = dbUser.points;
                    // @ts-ignore
                    session.user.referralCode = dbUser.referralCode;
                }
            }
            return session;
        },
        authorized({ request, auth }) {
            return true
        },
    },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
