import type { Bindings } from "@/bindings";

/** ADMIN_EMAILS is a comma-separated allowlist; admins bypass the invite gate. */
export const isAdminEmail = (env: Bindings, email: string) =>
  env.ADMIN_EMAILS.toLowerCase()
    .split(",")
    .map((entry) => entry.trim())
    .includes(email.toLowerCase());
