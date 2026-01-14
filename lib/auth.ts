// Force Vercel Rebuild: 2026-01-14 08:35
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import { getUserByEmail, createUser } from "@/lib/kv";

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
            if (!user.email) return false;

            try {
                const existingUser = await getUserByEmail(user.email);
                if (!existingUser) {
                    await createUser(user.email, undefined, undefined);
                }
                return true;
            } catch (error) {
                console.error("Error syncing OAuth user:", error);
                // Failsafe: Allow login even if KV sync fails
                return true;
            }
        },
        async session({ session, token }) {
            if (session.user && session.user.email) {
                try {
                    const dbUser = await getUserByEmail(session.user.email);
                    if (dbUser) {
                        // @ts-ignore
                        session.user.id = dbUser.id;
                        // @ts-ignore
                        session.user.points = dbUser.points;
                        // @ts-ignore
                        session.user.referralCode = dbUser.referralCode;
                    }
                } catch (e) {
                    // Ignore DB errors in session callback
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
