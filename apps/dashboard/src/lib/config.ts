export interface IAppConfig {
  publicBase: string;
}

let cached: Promise<IAppConfig> | null = null;

export function getConfig(): Promise<IAppConfig> {
  cached ??= fetch("/api/config").then((res) => {
    if (!res.ok) throw new Error("config unavailable");
    return res.json() as Promise<IAppConfig>;
  });
  return cached;
}
