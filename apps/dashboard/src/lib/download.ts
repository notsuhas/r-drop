// Cross-origin CDN URLs ignore the anchor download attribute, so fetch the
// bytes and hand the browser a same-origin blob instead.
export async function downloadFile(url: string, filename: string) {
  const blob = await fetch(url).then((res) => res.blob());
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
