import { WorkOS } from "@workos-inc/node/worker";
import type { Bindings } from "../bindings";

/** WorkOS credentials are user-supplied secrets; auth routes 503 until both exist. */
export const workosConfigured = (env: Bindings) =>
  Boolean(env.WORKOS_API_KEY && env.WORKOS_CLIENT_ID);

export const getWorkos = (env: Bindings) =>
  new WorkOS(env.WORKOS_API_KEY, { clientId: env.WORKOS_CLIENT_ID });
