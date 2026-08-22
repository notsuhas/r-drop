import type { Bindings } from "./bindings";

export type Actor =
  | { type: "user"; userId: string; email: string; name: string; picture: string | null }
  | { type: "token"; userId: string; tokenId: string };

export type Env = { Bindings: Bindings; Variables: { actor: Actor } };
