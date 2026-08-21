export type Bindings = {
  BUCKET: R2Bucket;
  DB: D1Database;
  PUBLIC_BASE: string;
  APP_BASE: string;
  ADMIN_EMAIL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};
