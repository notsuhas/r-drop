// Every piece of copy-to-agent content lives in this one file so it can be
// audited in a single place.

export interface IAgentContentInput {
  publicBase: string;
  appBase: string;
  token?: string;
}

function buildAgentSkill(input: IAgentContentInput) {
  const { publicBase, appBase, token } = input;
  const tokenLine = token
    ? `Read the bearer token from the \`R_DROP_TOKEN\` environment variable. If it isn't set, the token is \`${token}\` — put it in the environment (or an untracked file such as \`.dev.vars\`) rather than leaving it in a file you might commit.`
    : `Read the bearer token from the \`R_DROP_TOKEN\` environment variable.`;

  return `---
name: r-drop
description: Upload assets (images, video, audio, any file) to the r-drop CDN and reference public URLs in code instead of bundling files. Use when adding an asset to code, exporting from Figma, or when the user mentions r-drop or asset uploads.
---

# r·drop — asset CDN

When code needs an image/video/animation (from Figma, generated, or local), upload it to r-drop and use the returned public URL. Never bundle throwaway assets into the repo.

${tokenLine}

## Upload a file

\`\`\`bash
curl -X POST ${appBase}/api/upload \\
  -H "Authorization: Bearer $R_DROP_TOKEN" \\
  -F "folder=<feature-name>" \\
  -F "file=@./hero-banner.png"
\`\`\`

Response: \`{ "key", "url", "manifestUrl", "size", "contentType" }\`
- \`url\` is the permanent public CDN URL — write it into the code directly.
- Filenames are slugified (lowercase, dashes). Same name + same folder overwrites — that is how you update an asset.
- Group assets by feature: \`folder=checkout-v2\`, \`folder=onboarding\`. Omitting folder uses \`scratch\`.
- Limits: 50MB per file. The folder name \`_manifest\` is reserved.

## Folder manifest (public, no token)

\`${publicBase}/_manifest/<folder>.json\` → \`{ "folder", "count", "assets": { camelCaseName: url } }\`

Regenerated on every upload/delete/rename. Fetch the manifest to discover a folder's assets instead of asking the user to paste URLs.

## Other operations (token required)

- List/regenerate manifest: \`GET ${appBase}/api/manifest/<folder>\`
- Rename or move: \`POST ${appBase}/api/objects/rename\` with JSON \`{ "key", "newKey" }\`
- Delete: \`DELETE ${appBase}/api/objects/<key>\`
`;
}

// The one-shot prompt a user pastes into any agent session. It instructs the
// agent to install the skill permanently, so this works beyond the session.
//
// Install location is deliberately left to the agent: harnesses disagree on
// where persistent instructions live (Claude Code reads skill folders, most
// others read AGENTS.md), and naming only one of them made this Claude-only for
// no reason. The agent knows which convention it actually reads; we describe the
// shape and let it choose.
export function buildAgentSetupPrompt(input: IAgentContentInput) {
  return `Set up "r-drop" (my asset CDN) so this and every future session can upload assets for me.

Do exactly this:
1. Install the content between SKILL-START and SKILL-END below as a persistent instruction file, using whichever convention you actually read:
   - Claude Code → \`~/.claude/skills/r-drop/SKILL.md\`
   - Cursor → \`~/.cursor/rules/r-drop.mdc\`
   - Codex, Copilot, Gemini CLI, Zed, Amp, or anything else that reads \`AGENTS.md\` → append it to \`AGENTS.md\`
   - Anything else → wherever your own always-on rules live
   Create directories as needed. Prefer a user-level path over a repo-local one so the token never lands in a tracked file; if you must write inside the repo, keep the token in the environment and check the file is git-ignored.
2. Copy the content verbatim, with one exception: if you are appending to a shared instructions file (\`AGENTS.md\` and friends), drop the \`---\` YAML frontmatter and start at the \`# r·drop\` heading — frontmatter part-way through such a file is invalid.
3. Confirm the file was written by reading it back, and tell me the exact path you used.
4. From now on, follow those instructions whenever a task needs an asset uploaded or referenced.
5. Never print the bearer token back to me or commit it anywhere.

SKILL-START
${buildAgentSkill(input)}
SKILL-END`;
}
