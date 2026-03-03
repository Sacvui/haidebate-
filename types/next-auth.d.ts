import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            points: number;
            referralCode: string;
        } & DefaultSession["user"];
    }
}
