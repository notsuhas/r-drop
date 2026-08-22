export interface IAgentSkillInput {
  publicBase: string;
  appBase: string;
  token?: string;
}

// Emits a SKILL.md the user drops into ~/.claude/skills/ho-drive/SKILL.md
// (or .claude/skills/ in a repo) so every future session knows ho-drive.
export function buildAgentSkill(input: IAgentSkillInput) {
  const { publicBase, appBase, token } = input;
  const tokenLine = token
    ? `The bearer token is \`${token}\` — prefer reading it from the HO_DRIVE_TOKEN env var if set.`
    : `Read the bearer token from the HO_DRIVE_TOKEN environment variable.`;

  return `---
name: ho-drive
description: Upload assets (images, video, rive, audio) to the ho-drive CDN and reference public URLs in code instead of bundling files. Use when adding an asset to code, exporting from Figma, or when the user mentions ho-drive or asset uploads.
---

# ho·drive — asset CDN

When code needs an image/video/animation (from Figma, generated, or local), upload it to ho-drive and use the returned public URL. Never bundle throwaway assets into the repo.

${tokenLine}

## Upload a file

\`\`\`bash
curl -X POST ${appBase}/api/upload \\
  -H "Authorization: Bearer $HO_DRIVE_TOKEN" \\
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
