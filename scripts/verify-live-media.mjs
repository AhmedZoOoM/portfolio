import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchLive(url, fetchImpl, delayImpl) {
  let lastError;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetchImpl(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delayImpl(attempt * 1000);
  }
  throw new Error(`Live page did not become available: ${lastError?.message || "unknown error"}`);
}

export async function verifyLiveMedia(pageUrl, { fetchImpl = fetch, delayImpl = delay } = {}) {
  if (!pageUrl) throw new Error("Usage: node scripts/verify-live-media.mjs <GitHub Pages URL>");

  const pageResponse = await fetchLive(pageUrl, fetchImpl, delayImpl);
  const html = await pageResponse.text();
  const assetPaths = [...html.matchAll(/(?:src|href)="([^"?#]+\/assets\/[^"?#]+\.(?:js|css|jpg))"/g)].map((match) => match[1]);
  assert.ok(assetPaths.some((path) => path.endsWith(".js")), "deployed page must reference a JavaScript bundle");
  assert.ok(assetPaths.some((path) => path.endsWith(".css")), "deployed page must reference a CSS bundle");
  assert.ok(assetPaths.some((path) => path.endsWith(".jpg")), "deployed page must reference the local X portrait");

  const assets = await Promise.all(assetPaths.map(async (path) => {
    const response = await fetchLive(new URL(path, pageUrl), fetchImpl, delayImpl);
    if (path.endsWith(".jpg")) {
      return { path, bytes: Buffer.from(await response.arrayBuffer()), contentType: response.headers.get("content-type") || "" };
    }
    return { path, text: await response.text() };
  }));
  const bundle = assets.filter((asset) => asset.path.endsWith(".js")).map((asset) => asset.text).join("\n");
  const css = assets.filter((asset) => asset.path.endsWith(".css")).map((asset) => asset.text).join("\n");
  assert.match(bundle, /drive\.google\.com\/file\/d\//, "deployed bundle must use the supported Drive preview source");
  assert.match(bundle, /createElement\("iframe"\)/, "deployed bundle must create the supported Drive preview player");
  assert.doesNotMatch(bundle, /Open in Google Drive/, "deployed dialog must not duplicate Drive's own open-in-Drive control");
  assert.doesNotMatch(css, /media-player-actions/, "deployed stylesheet must not reserve space for a duplicate Drive action strip");
  assert.match(css, /height:min\(70dvh,600px\)/, "deployed wide and square Drive players must reserve control-safe viewport height");
  const portrait = assets.find((asset) => asset.path.endsWith(".jpg"));
  assert.match(portrait.contentType, /^image\/jpeg\b/, "deployed X portrait must be served as JPEG");
  assert.equal(
    createHash("sha256").update(portrait.bytes).digest("hex"),
    "da840662fcf0bc2cbc89605756aac30f50a2b9dfce8e25c6bf3366445fce2278",
    "deployed X portrait must match the approved snapshot"
  );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const pageUrl = process.argv[2];
  await verifyLiveMedia(pageUrl);
  console.log(`PASS live media deployment: ${pageUrl}`);
}
