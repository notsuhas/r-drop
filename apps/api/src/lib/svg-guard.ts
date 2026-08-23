/**
 * SVG is the one image type a browser will execute.
 *
 * Objects are served straight off R2 with no worker in the read path to add a
 * CSP header, so an SVG carrying script is stored XSS on the CDN origin. The
 * content-type blocklist next door does not catch it, and SVG cannot simply be
 * refused: the dashboard previews it and it is a first-class export format.
 *
 * So: refuse the ones that carry active content, rather than rewriting them.
 * A silently altered asset is worse than a refused upload — you would not know
 * which of your files had been edited.
 */
const ACTIVE_CONTENT = [
  /<\s*script/i,
  /<\s*foreignObject/i,
  /<\s*(?:iframe|embed|object)\b/i,
  /\son[a-z]+\s*=/i,
  /(?:xlink:href|href)\s*=\s*["']?\s*javascript:/i,
  // <set attributeName="href"> rewrites a link target at animation time.
  /attributeName\s*=\s*["']?\s*(?:xlink:)?href/i,
];

export const SVG_CONTENT_TYPE = "image/svg+xml";

export const isSvgContentType = (type: string) =>
  type.toLowerCase().split(";")[0].trim() === SVG_CONTENT_TYPE;

export const svgHasActiveContent = (svg: string) => ACTIVE_CONTENT.some((re) => re.test(svg));
