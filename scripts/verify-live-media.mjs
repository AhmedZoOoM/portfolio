import assert from "node:assert/strict";

const pageUrl = process.argv[2];
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

if (!pageUrl) throw new Error("Usage: node scripts/verify-live-media.mjs <GitHub Pages URL>");

async function fetchLive(url) {
  let lastError;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(attempt * 1000);
  }
  throw new Error(`Live page did not become available: ${lastError?.message || "unknown error"}`);
}

const pageResponse = await fetchLive(pageUrl);
const html = await pageResponse.text();
const assetPaths = [...html.matchAll(/(?:src|href)="([^"?#]+\/assets\/[^"?#]+\.(?:js|css))"/g)].map((match) => match[1]);
assert.ok(assetPaths.some((path) => path.endsWith(".js")), "deployed page must reference a JavaScript bundle");
assert.ok(assetPaths.some((path) => path.endsWith(".css")), "deployed page must reference a CSS bundle");

const assets = await Promise.all(assetPaths.map(async (path) => {
  const response = await fetchLive(new URL(path, pageUrl));
  return { path, text: await response.text() };
}));
const bundle = assets.filter((asset) => asset.path.endsWith(".js")).map((asset) => asset.text).join("\n");
const css = assets.filter((asset) => asset.path.endsWith(".css")).map((asset) => asset.text).join("\n");
assert.match(bundle, /drive\.google\.com\/file\/d\//, "deployed bundle must use the supported Drive preview source");
assert.match(bundle, /createElement\("iframe"\)/, "deployed bundle must create the supported Drive preview player");
assert.match(bundle, /Open in Google Drive/, "deployed bundle must retain the external Drive fallback");
assert.match(css, /media-player-actions/, "deployed stylesheet must include player fallback controls");

console.log(`PASS live media deployment: ${pageUrl}`);
