import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const inventoryPath = resolve(root, "data", "drive-inventory.json");
const manifestPath = resolve(root, "js", "portfolio-data.js");
const htmlPath = resolve(root, "index.html");
const rendererPath = resolve(root, "src", "main.js");
const cardRendererPath = resolve(root, "src", "components", "media-card.js");
const socialLinksPath = resolve(root, "src", "components", "social-links.js");
const dataModulePath = resolve(root, "src", "data", "portfolio-data.js");
const stylesheetPath = resolve(root, "src", "styles", "index.css");
const MAX_CONCURRENT_REQUESTS = 12;
const MAX_ATTEMPTS = 4;
const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

if (!existsSync(inventoryPath)) fail("source inventory missing: data/drive-inventory.json");
if (!existsSync(manifestPath)) fail("manifest missing: js/portfolio-data.js");
if (!existsSync(htmlPath)) fail("document missing: index.html");
if (!existsSync(rendererPath)) fail("renderer missing: src/main.js");
if (!existsSync(cardRendererPath)) fail("card renderer missing: src/components/media-card.js");
if (!existsSync(socialLinksPath)) fail("social-link renderer missing: src/components/social-links.js");
if (!existsSync(dataModulePath)) fail("data adapter missing: src/data/portfolio-data.js");
if (!existsSync(stylesheetPath)) fail("stylesheet entrypoint missing: src/styles/index.css");
if (process.exitCode) process.exit(process.exitCode);

const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
const inventoryMedia = inventory.media || [];
const inventoryIds = new Set(inventoryMedia.map((item) => item.driveId));
const videos = inventoryMedia.filter((item) => item.mimeType === "video/mp4").length;
const images = inventoryMedia.filter((item) => item.mimeType === "image/png").length;
if (!inventoryMedia.length || videos + images !== inventoryMedia.length) {
  fail("source inventory does not reconcile video and image totals");
}
if (inventoryIds.size !== inventoryMedia.length) fail("source inventory has duplicate Drive IDs");

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(manifestPath, "utf8"), sandbox, { filename: "js/portfolio-data.js" });
const data = sandbox.window.PORTFOLIO_DATA;
if (!data) fail("manifest does not assign window.PORTFOLIO_DATA");
const manifestMedia = data?.projects?.flatMap((project) => project.media || []) || [];
const manifestIds = new Set(manifestMedia.map((item) => item.driveId));
const requiredFields = ["driveId", "sourcePath", "originalTitle", "displayTitle", "kind", "aspect", "language", "dir", "variantGroup", "provider", "providerId", "playbackUrl", "posterUrl", "originalUrl", "captionState", "ariaLabel", "credits", "rightsNote"];
for (const item of manifestMedia) {
  for (const field of requiredFields) if (!(field in item)) fail(`manifest ${item.driveId || item.sourcePath} missing ${field}`);
  if (!inventoryIds.has(item.driveId)) fail(`manifest has unknown Drive ID ${item.driveId}`);
  if (!/^https:\/\/drive\.google\.com\/thumbnail\?id=[\w-]+&sz=w1200$/.test(item.posterUrl)) fail(`invalid poster URL for ${item.driveId}`);
  if (!new RegExp(`^https://drive\\.google\\.com/file/d/${item.driveId}/view$`).test(item.originalUrl)) fail(`invalid Drive URL for ${item.driveId}`);
  if (item.kind === "video" && item.playbackUrl !== `https://drive.usercontent.google.com/download?id=${item.driveId}&export=download&confirm=t`) fail(`invalid native Drive stream URL for ${item.driveId}`);
  if (item.kind === "image" && item.playbackUrl !== null) fail(`still image must not declare a video stream URL: ${item.driveId}`);
  if (!["video", "image"].includes(item.kind)) fail(`invalid kind for ${item.driveId}`);
  if (!["rtl", "ltr"].includes(item.dir)) fail(`invalid direction for ${item.driveId}`);
  if (!["available", "unavailable", "not-applicable", "unknown"].includes(item.captionState)) fail(`invalid caption state for ${item.driveId}`);
  if (item.kind === "image" && item.category !== "stills") fail(`still image must use the stills category: ${item.driveId}`);
  if (/showreel/i.test(item.originalTitle) && item.category !== "showreel") fail(`showreel must use the showreel category: ${item.driveId}`);
  if (/(BTS|Making of)/i.test(item.originalTitle) && item.category !== "making-of") fail(`making-of item must use the making-of category: ${item.driveId}`);
}
if (manifestIds.size !== manifestMedia.length) fail("manifest has duplicate Drive IDs");
for (const item of inventoryMedia) if (!manifestIds.has(item.driveId)) fail(`manifest missing Drive ID ${item.driveId}: ${item.sourcePath}`);
if (manifestMedia.length !== inventoryMedia.length) fail(`manifest coverage is ${manifestMedia.length}/${inventoryMedia.length}, expected exact equality`);
if (data?.baseline?.expectedMediaCount !== inventoryMedia.length || data?.baseline?.expectedVideoCount !== videos || data?.baseline?.expectedImageCount !== images) fail("manifest baseline counts do not match the source inventory");
if (new Set(data?.featuredMediaIds || []).size !== 6 || !(data?.featuredMediaIds || []).every((id) => manifestIds.has(id))) fail("featured media IDs must contain six unique manifest IDs");

const html = readFileSync(htmlPath, "utf8");
const renderer = readFileSync(rendererPath, "utf8");
const cardRenderer = readFileSync(cardRendererPath, "utf8");
const socialLinks = readFileSync(socialLinksPath, "utf8");
const dataModule = readFileSync(dataModulePath, "utf8");
for (const file of [htmlPath, rendererPath, cardRendererPath, socialLinksPath, dataModulePath, stylesheetPath, manifestPath, resolve(root, "README.md")]) {
  if (readFileSync(file, "utf8").startsWith("+")) fail(`generated file has an invalid leading +: ${file.replace(root + "/", "")}`);
}
for (const contract of ["portfolio-featured", "portfolio-archive", "media-dialog", "media-dialog-content"]) {
  if (!html.includes(`id="${contract}"`)) fail(`document missing #${contract}`);
}
if (!html.includes('type="module" src="./src/main.js"')) fail("document does not load the repository-relative Vite module entrypoint");
if (!dataModule.includes('../../js/portfolio-data.js')) fail("data adapter does not retain the canonical media manifest");
if (!cardRenderer.includes("card.dataset.mediaId")) fail("card renderer does not create the data-media-id archive contract");
if (!cardRenderer.includes('setAttribute("aria-label"')) fail("card renderer does not create accessible media-control labels");
if (!socialLinks.includes('aria-label')) fail("social links do not expose accessible labels");
if (!inventoryMedia.every((item) => item.publicViewStatus === "anonymous_preview_verified")) fail("source inventory lacks anonymous preview verification");
for (const placeholder of ["Project Title", "hello@example.com", "DaVinci Resolve", "Avid Media Composer", "10+ years", "linkedin.com"]) {
  if (html.includes(placeholder) || readFileSync(resolve(root, "README.md"), "utf8").includes(placeholder)) fail(`placeholder or unsupported claim remains: ${placeholder}`);
}
for (const forbidden of ["birth date", "marital status", "military status", "Ahmed-Azzam - CV"]) {
  if (html.includes(forbidden) || readFileSync(manifestPath, "utf8").includes(forbidden)) fail(`forbidden CV detail exposed: ${forbidden}`);
}

if (!process.exitCode) {
  const urls = manifestMedia.flatMap((item) => [
    ["preview", `https://drive.google.com/file/d/${item.driveId}/preview`, item],
    ["poster", item.posterUrl, item],
    ...(item.kind === "video" ? [["stream", item.playbackUrl, item]] : [])
  ]);
  const failures = [];
  async function validateUrl([kind, url, item]) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(url, {
          redirect: "follow",
          headers: kind === "stream" ? { Range: "bytes=0-1023" } : undefined,
          signal: AbortSignal.timeout(20000)
        });
        if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
          const retryAfter = Number(response.headers.get("retry-after"));
          await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : attempt * 750);
          continue;
        }
        if (!response.ok) failures.push(`${kind} URL failed for ${item.driveId}: HTTP ${response.status}`);
        if (kind === "stream") {
          if (response.status !== 206) failures.push(`native stream is not range-seekable for ${item.driveId}: HTTP ${response.status}`);
          if (!response.headers.get("content-type")?.startsWith("video/")) failures.push(`native stream is not a video response for ${item.driveId}`);
          if (!response.headers.get("content-range")?.startsWith("bytes 0-1023/")) failures.push(`native stream returned an invalid byte range for ${item.driveId}`);
          await response.body?.cancel();
        }
        if (kind === "preview") {
          const text = await response.text();
          if (/request access|you need access|access denied|sign in to continue/i.test(text)) failures.push(`preview requires authentication for ${item.driveId}`);
        }
        return;
      } catch (error) {
        if (attempt < MAX_ATTEMPTS) {
          await delay(attempt * 750);
          continue;
        }
        failures.push(`${kind} URL failed for ${item.driveId}: ${error.message}`);
      }
    }
  }
  for (let offset = 0; offset < urls.length; offset += MAX_CONCURRENT_REQUESTS) {
    await Promise.all(urls.slice(offset, offset + MAX_CONCURRENT_REQUESTS).map(validateUrl));
    await delay(100);
  }
  failures.forEach(fail);
  if (process.exitCode) process.exit(process.exitCode);
  console.log(`PASS source inventory: ${inventoryMedia.length} media IDs (${videos} video, ${images} image)`);
  console.log(`PASS manifest coverage: ${manifestIds.size}/${inventoryIds.size} unique Drive IDs`);
  console.log("PASS document and renderer contract");
  console.log("PASS privacy and placeholder scan");
  console.log("PASS URL and provider validation");
  console.log("PASS portfolio completion: 100%");
}
