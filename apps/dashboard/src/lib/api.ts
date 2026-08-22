// Typed API client via Hono RPC — response types are inferred from the worker's AppType.
import { hc, type InferResponseType } from "hono/client";
import type { AppType } from "../../../api/src/index";

const client = hc<AppType>("/");

interface IClientResponse {
  ok: boolean;
  statusText: string;
  json(): Promise<unknown>;
}

async function unwrap<T>(res: IClientResponse): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

type Objects = InferResponseType<typeof client.api.objects.$get, 200>;
export type IObject = Objects["objects"][number];

export const api = {
  me: () => client.api.me.$get().then(unwrap<InferResponseType<typeof client.api.me.$get, 200>>),
  objects: (prefix: string) => client.api.objects.$get({ query: { prefix } }).then(unwrap<Objects>),
  deleteObject: (key: string) =>
    client.api.objects[":key{.+}"].$delete({ param: { key } }).then(unwrap),
  renameObject: (key: string, newKey: string) =>
    client.api.objects.rename.$post({ json: { key, newKey } }).then(unwrap),
  invites: () =>
    client.api.invites.$get().then(unwrap<InferResponseType<typeof client.api.invites.$get, 200>>),
  addInvite: (email: string) => client.api.invites.$post({ json: { email } }).then(unwrap),
  deleteInvite: (email: string) =>
    client.api.invites[":email"].$delete({ param: { email } }).then(unwrap),
  tokens: () =>
    client.api.tokens.$get().then(unwrap<InferResponseType<typeof client.api.tokens.$get, 200>>),
  createToken: (name: string, scope: string) =>
    client.api.tokens
      .$post({ json: { name, scope } })
      .then(unwrap<InferResponseType<typeof client.api.tokens.$post, 201>>),
  renameToken: (id: string, name: string) =>
    client.api.tokens[":id"].$patch({ param: { id }, json: { name } }).then(unwrap),
  deleteToken: (id: string) => client.api.tokens[":id"].$delete({ param: { id } }).then(unwrap),
};
