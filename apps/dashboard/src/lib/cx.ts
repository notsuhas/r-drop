/** Joins class names, dropping falsy entries. Later classes win by source order,
 *  so callers can always append an override. */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");
