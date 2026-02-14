import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../api/db";
import { notion } from "better-auth/social-providers";
import * as schema from "../../drizzle/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        }
    }),
    socialProviders: {
        notion: {
            clientId: process.env.NOTION_CLIENT_ID!,
            clientSecret: process.env.NOTION_CLIENT_SECRET!,
        },
    },
});
