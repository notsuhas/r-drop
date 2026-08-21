import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { Bindings } from "./bindings";
import * as schema from "./db/schema";

export const isAdminEmail = (env: Bindings, email: string) =>
  email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();

export const createAuth = (env: Bindings) => {
  const db = drizzle(env.DB, { schema });
  return betterAuth({
    baseURL: env.APP_BASE,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const email = user.email.toLowerCase();
            if (isAdminEmail(env, email)) return;
            const invite = await db.query.invites.findFirst({
              where: eq(schema.invites.email, email),
            });
            if (!invite) throw new APIError("FORBIDDEN", { message: "not invited" });
          },
          after: async (user) => {
            const email = user.email.toLowerCase();
            if (isAdminEmail(env, email)) return;
            await db
              .update(schema.invites)
              .set({ usedAt: Date.now() })
              .where(eq(schema.invites.email, email));
          },
        },
      },
    },
  });
};
