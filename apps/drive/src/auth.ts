import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "./db/schema";
import type { Bindings } from "./bindings";

export const createAuth = (env: Bindings) => {
  const db = drizzle(env.DB, { schema });
  return betterAuth({
    baseURL: "https://ho-drive.theclau.de",
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
            if (user.email === env.ADMIN_EMAIL) return;
            const invite = await db.query.invites.findFirst({
              where: eq(schema.invites.email, user.email),
            });
            if (!invite) throw new APIError("FORBIDDEN", { message: "not invited" });
          },
          after: async (user) => {
            if (user.email === env.ADMIN_EMAIL) return;
            await db
              .update(schema.invites)
              .set({ usedAt: Date.now() })
              .where(eq(schema.invites.email, user.email));
          },
        },
      },
    },
  });
};
