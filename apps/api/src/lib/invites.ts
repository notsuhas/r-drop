import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

/**
 * Records a completed sign-in on an invite row: first-sign-in timestamp, and
 * the WorkOS user id.
 *
 * Called for every caller that completes sign-in, not only invited ones. Admins
 * bypass the invite gate but still have an invite row on the People page, and
 * stamping only inside the gate left them reading "hasn't signed in yet" while
 * signed in and looking at the page.
 *
 * No matching row (an admin who was never invited) is a no-op. usedAt is
 * coalesced so it keeps the original timestamp rather than moving on every
 * sign-in, while the user id is always refreshed — that is what revocation
 * needs to be correct, so it must not go stale.
 */
export function recordSignIn(
  db: DrizzleD1Database<typeof schema>,
  email: string,
  workosUserId: string,
  now: number,
) {
  return db
    .update(schema.invites)
    .set({ usedAt: sql`coalesce(${schema.invites.usedAt}, ${now})`, workosUserId })
    .where(eq(schema.invites.email, email.toLowerCase()))
    .run();
}
