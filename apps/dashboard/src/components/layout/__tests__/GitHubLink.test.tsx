import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import GitHubLink from "@/components/layout/GitHubLink";

const link = () => screen.getByRole("link", { name: /view on github/i });

describe("GitHubLink", () => {
  test("points at the repo and opens safely in a new tab", () => {
    render(<GitHubLink />);
    const a = link() as HTMLAnchorElement;
    expect(a.getAttribute("href")).toBe("https://github.com/notsuhas/r-drop");
    expect(a.getAttribute("target")).toBe("_blank");
    // noopener keeps the new tab from reaching back through window.opener.
    expect(a.getAttribute("rel")).toContain("noopener");
  });

  test("announces that it leaves the app", () => {
    render(<GitHubLink />);
    expect(link().getAttribute("aria-label")).toContain("opens in a new tab");
  });

  test("expanded shows the label, collapsed is mark-only but still labelled", () => {
    const { unmount } = render(<GitHubLink />);
    expect(link().textContent).toContain("View on GitHub");
    unmount();

    render(<GitHubLink collapsed />);
    expect(link().textContent).toBe("");
    expect(link().getAttribute("title")).toBe("View on GitHub");
  });

  test("closes the mobile sheet when followed", () => {
    let closed = false;
    render(<GitHubLink onNavigate={() => (closed = true)} />);
    link().click();
    expect(closed).toBe(true);
  });
});
