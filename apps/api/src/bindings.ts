export type Bindings = {
  BUCKET: R2Bucket;
  DB: D1Database;
  PUBLIC_BASE: string;
  APP_BASE: string;
  ADMIN_EMAILS: string;
  ASSETS: Fetcher;
  WORKOS_API_KEY?: string;
  WORKOS_CLIENT_ID?: string;
  WORKOS_COOKIE_PASSWORD: string;
};
