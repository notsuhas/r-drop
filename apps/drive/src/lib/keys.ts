export const slugify = (s: string) => {
  const dot = s.lastIndexOf(".");
  const [base, ext] = dot > 0 ? [s.slice(0, dot), s.slice(dot)] : [s, ""];
  return (
    base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") +
    ext.toLowerCase()
  );
};

export const camelCase = (s: string) =>
  s
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());

export const cleanFolder = (f: string) =>
  f.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "");
