// D1 schema. Auth users live in WorkOS; only invites and API tokens are stored here.
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const invites = sqliteTable("invites", {
  email: text("email").primaryKey(),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at").notNull(),
  usedAt: integer("used_at"),
  // Recorded at sign-in so revocation can find this person's tokens without a
  // WorkOS round trip that might fail.
  workosUserId: text("workos_user_id"),
});

export const apiTokens = sqliteTable(
  "api_tokens",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    hash: text("hash").notNull(),
    userId: text("user_id").notNull(),
    // The owner's email, so every request can re-check that they are still
    // allowed in. Null on tokens issued before this column existed.
    userEmail: text("user_email"),
    prefix: text("prefix").notNull(),
    scope: text("scope").notNull().default("write"),
    createdAt: integer("created_at").notNull(),
    lastUsedAt: integer("last_used_at"),
    // Null means no expiry.
    expiresAt: integer("expires_at"),
  },
  (t) => [index("idx_api_tokens_hash").on(t.hash)],
);
