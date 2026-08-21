// D1 schema. Auth users live in WorkOS; only invites and API tokens are stored here.
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const invites = sqliteTable("invites", {
  email: text("email").primaryKey(),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at").notNull(),
  usedAt: integer("used_at"),
});

export const apiTokens = sqliteTable(
  "api_tokens",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    hash: text("hash").notNull(),
    userId: text("user_id").notNull(),
    prefix: text("prefix").notNull(),
    scope: text("scope").notNull().default("write"),
    createdAt: integer("created_at").notNull(),
    lastUsedAt: integer("last_used_at"),
  },
  (t) => [index("idx_api_tokens_hash").on(t.hash)],
);
