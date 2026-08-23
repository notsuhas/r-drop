import { describe, expect, test } from "bun:test";
import { isSvgContentType, svgHasActiveContent } from "@/lib/svg-guard";

describe("isSvgContentType", () => {
  test("plain", () => expect(isSvgContentType("image/svg+xml")).toBe(true));
  test("with charset", () => expect(isSvgContentType("image/svg+xml; charset=utf-8")).toBe(true));
  test("cased", () => expect(isSvgContentType("Image/SVG+XML")).toBe(true));
  test("png is not svg", () => expect(isSvgContentType("image/png")).toBe(false));
});

describe("svgHasActiveContent", () => {
  const active = [
    ["script tag", "<svg><script>alert(1)</script></svg>"],
    ["spaced script tag", "<svg>< script >alert(1)</script></svg>"],
    ["event handler", '<svg onload="alert(1)"></svg>'],
    ["event handler on a child", '<svg><rect onclick="alert(1)"/></svg>'],
    ["javascript href", '<svg><a href="javascript:alert(1)"><rect/></a></svg>'],
    ["javascript xlink href", '<svg><a xlink:href="javascript:alert(1)"/></svg>'],
    ["foreignObject", "<svg><foreignObject><body/></foreignObject></svg>"],
    ["iframe", "<svg><iframe src=x /></svg>"],
    ["animated href", '<svg><a><set attributeName="href" to="javascript:alert(1)"/></a></svg>'],
  ] as const;
  for (const [label, svg] of active) {
    test(`rejects ${label}`, () => expect(svgHasActiveContent(svg)).toBe(true));
  }

  const inert = [
    [
      "a figma-shaped export",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="#0061ff"/></svg>',
    ],
    [
      "gradients and defs",
      '<svg><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect fill="url(#g)"/></svg>',
    ],
    ["a plain external link", '<svg><a href="https://example.com"><text>hi</text></a></svg>'],
    ["a word merely starting with on", '<svg><text font-family="Onyx">once</text></svg>'],
  ] as const;
  for (const [label, svg] of inert) {
    test(`accepts ${label}`, () => expect(svgHasActiveContent(svg)).toBe(false));
  }
});
