import { and, eq, isNull } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

/**
 * Stamps first sign-in on an invite row.
 *
 * Called for every caller that completes sign-in, not only invited ones. Admins
 * bypass the invite gate but still have an invite row on the People page, and
 * stamping only inside the gate left them reading "hasn't signed in yet" while
 * signed in and looking at the page.
 *
 * No matching row (an admin who was never invited) is a no-op, and the isNull
 * guard keeps the original timestamp rather than moving it on every sign-in.
 */
export function markInviteUsed(db: DrizzleD1Database<typeof schema>, email: string, now: number) {
  return db
    .update(schema.invites)
    .set({ usedAt: now })
    .where(and(eq(schema.invites.email, email.toLowerCase()), isNull(schema.invites.usedAt)))
    .run();
}
