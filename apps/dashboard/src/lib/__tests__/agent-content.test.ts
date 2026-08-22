import { describe, expect, test } from "bun:test";
import { buildAgentSetupPrompt } from "@/lib/agent-content";

const input = {
  publicBase: "https://cdn.x",
  appBase: "https://app.x",
  token: "tok_secret",
};

describe("buildAgentSetupPrompt", () => {
  const prompt = buildAgentSetupPrompt(input);

  test("wraps the skill in delimiters the agent can copy between", () => {
    expect(prompt).toContain("SKILL-START");
    expect(prompt).toContain("SKILL-END");
    // Split on the delimiters as whole lines: step 1 names them inline too.
    const body = prompt.split("\nSKILL-START\n")[1]?.split("\nSKILL-END")[0] ?? "";
    expect(body).toContain("name: r-drop");
    expect(body).toContain("# r·drop — asset CDN");
  });

  test("carries both bases and the token into the skill", () => {
    expect(prompt).toContain("https://app.x/api/upload");
    expect(prompt).toContain("https://cdn.x/_manifest/<folder>.json");
    expect(prompt).toContain("tok_secret");
  });

  // The install step used to name only ~/.claude/skills, which made a prompt
  // advertised as "paste into any agent" silently Claude-only.
  test("offers an install path for non-Claude harnesses", () => {
    expect(prompt).toContain("~/.claude/skills/r-drop/SKILL.md");
    expect(prompt).toContain("AGENTS.md");
    expect(prompt).toContain("~/.cursor/rules/r-drop.mdc");
  });

  test("tells the agent to drop frontmatter when appending to a shared file", () => {
    expect(prompt).toMatch(/drop the .*frontmatter/);
  });

  test("keeps the token out of tracked files and out of chat", () => {
    expect(prompt).toContain("Never print the bearer token back to me");
    expect(prompt).toMatch(/Prefer a user-level path/);
  });

  test("falls back to the env var when no token is minted", () => {
    const anon = buildAgentSetupPrompt({ ...input, token: undefined });
    expect(anon).toContain("R_DROP_TOKEN");
    expect(anon).not.toContain("tok_secret");
  });
});
