declare module "cloudflare:test" {
  interface ProvidedEnv {
    DB: D1Database;
    BUCKET: R2Bucket;
    TEST_MIGRATIONS: import("@cloudflare/vitest-pool-workers").D1Migration[];
    PUBLIC_BASE: string;
    APP_BASE: string;
    ADMIN_EMAILS: string;
  }
  export function applyD1Migrations(
    db: D1Database,
    migrations: ProvidedEnv["TEST_MIGRATIONS"],
  ): Promise<void>;
}
