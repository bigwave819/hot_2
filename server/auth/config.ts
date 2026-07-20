import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/server/db";
import * as schema from "@/server/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  user: {
    additionalFields: {
      role: {
        type: ["guest", "receptionist", "admin"] as const,
        input: false,
        defaultValue: "guest",
        returned: true,
      },
      isActive: {
        type: "boolean",
        input: false,
        defaultValue: true,
        returned: true,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh the expiry once per day of activity
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type AppUser = Session["user"];
export type UserRole = AppUser["role"];