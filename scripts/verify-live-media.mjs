import assert from "node:assert/strict";

const pageUrl = process.argv[2];
const representativeVideos = [
  "17AowvP6cMvmD0yhEehTEPM7CKsGh7s2_",
  "14QDMVIdDJO6jVTzt5PbcrFviXL2-J-r3",
  "1XahedVA2AfhI9dL71OwIQHLwB541uw2P"
];
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
assert.match(bundle, /drive\.usercontent\.google\.com\/download/, "deployed bundle must use the native Drive stream source");
assert.match(bundle, /createElement\("video"\)/, "deployed bundle must create a native video player");
assert.match(bundle, /Use Google Drive player/, "deployed bundle must retain the Drive fallback");
assert.match(css, /media-player-actions/, "deployed stylesheet must include player fallback controls");

for (const driveId of representativeVideos) {
  const response = await fetch(`https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`, {
    headers: { Range: "bytes=0-1023" },
    redirect: "follow",
    signal: AbortSignal.timeout(20000)
  });
  assert.equal(response.status, 206, `live representative ${driveId} must support byte ranges`);
  assert.ok(response.headers.get("content-type")?.startsWith("video/"), `live representative ${driveId} must remain a video response`);
  await response.body?.cancel();
}

console.log(`PASS live media deployment: ${pageUrl}`);
