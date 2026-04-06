import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import "dotenv/config";

console.log("TRUSTED:", process.env.BETTER_AUTH_TRUSTED_ORIGINS);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",") : ["http://localhost:5173"],
  
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
  },

});