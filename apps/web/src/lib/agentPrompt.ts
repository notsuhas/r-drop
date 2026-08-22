export interface IAgentPromptInput {
  publicBase: string;
  appBase: string;
  token?: string;
}

export function buildAgentPrompt(input: IAgentPromptInput) {
  const { publicBase, appBase, token } = input;
  const tokenLine = token
    ? `Bearer token (secret — put it in the agent's env as HO_DRIVE_TOKEN):\n${token}`
    : `Bearer token: read it from the HO_DRIVE_TOKEN environment variable.`;

  return `## ho·drive — asset CDN for this project

When you need an image/video/animation in code (from Figma, generated, or local), upload it to ho·drive and reference the returned public URL instead of bundling the file into the repo.

${tokenLine}

### Upload a file

curl -X POST ${appBase}/api/upload \\
  -H "Authorization: Bearer $HO_DRIVE_TOKEN" \\
  -F "folder=<feature-name>" \\
  -F "file=@./hero-banner.png"

Response: { "key", "url", "manifestUrl", "size", "contentType" }
- "url" is the permanent public CDN URL — write it into the code directly.
- Filenames are slugified (lowercase, dashes). Uploading the same name to the same folder overwrites it — that's how you update an asset.
- Group assets by feature: folder=checkout-v2, folder=onboarding, etc. Omitting folder puts files in "scratch".
- Limits: 50MB per file. The folder name "_manifest" is reserved.

### Folder manifest (public, no token needed)

${publicBase}/_manifest/<folder>.json
→ { "folder", "count", "assets": { camelCaseName: url } }

It's regenerated on every upload/delete. Fetch the manifest to discover a folder's assets instead of asking for URLs to be pasted.

### List a folder with the token

curl -H "Authorization: Bearer $HO_DRIVE_TOKEN" ${appBase}/api/manifest/<folder>
`;
}
