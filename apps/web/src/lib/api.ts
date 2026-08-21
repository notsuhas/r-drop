export interface IObject {
  key: string;
  size: number;
  uploaded: string;
  contentType: string;
  url: string;
}

export interface IListing {
  folders: string[];
  objects: IObject[];
}

export interface IInvite {
  email: string;
  createdBy: string;
  createdAt: number;
  usedAt: number | null;
}

export interface IApiToken {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  createdAt: number;
  lastUsedAt: number | null;
}

export interface IMe {
  actor: { type: string; userId: string; email?: string };
  isAdmin: boolean;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => req<IMe>("/api/me"),
  objects: (prefix: string) =>
    req<IListing>(`/api/objects?prefix=${encodeURIComponent(prefix)}`),
  upload: (file: File, folder: string) => {
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    return req<IObject & { manifestUrl: string }>("/api/upload", {
      method: "POST",
      body: form,
    });
  },
  deleteObject: (key: string) =>
    req<{ deleted: string }>(`/api/objects/${key}`, { method: "DELETE" }),
  invites: () => req<IInvite[]>("/api/invites"),
  addInvite: (email: string) =>
    req<{ email: string }>("/api/invites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    }),
  deleteInvite: (email: string) =>
    req<{ deleted: string }>(`/api/invites/${encodeURIComponent(email)}`, {
      method: "DELETE",
    }),
  tokens: () => req<IApiToken[]>("/api/tokens"),
  createToken: (name: string, scope: string) =>
    req<{ token: string; name: string }>("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, scope }),
    }),
  deleteToken: (id: string) =>
    req<{ deleted: string }>(`/api/tokens/${id}`, { method: "DELETE" }),
};

export const PUBLIC_BASE = "https://ho-drops.theclau.de";
