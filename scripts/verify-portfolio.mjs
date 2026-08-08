import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const inventoryPath = resolve(root, "data", "drive-inventory.json");
const manifestPath = resolve(root, "js", "portfolio-data.js");
const htmlPath = resolve(root, "index.html");
const scriptPath = resolve(root, "js", "script.js");

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

if (!existsSync(inventoryPath)) fail("source inventory missing: data/drive-inventory.json");
if (!existsSync(manifestPath)) fail("manifest missing: js/portfolio-data.js");
if (!existsSync(htmlPath)) fail("document missing: index.html");
if (!existsSync(scriptPath)) fail("renderer missing: js/script.js");
if (process.exitCode) process.exit();

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
const requiredFields = ["driveId", "sourcePath", "originalTitle", "displayTitle", "kind", "aspect", "language", "dir", "variantGroup", "provider", "providerId", "posterUrl", "originalUrl", "captionState", "ariaLabel", "credits", "rightsNote"];
for (const item of manifestMedia) {
  for (const field of requiredFields) if (!(field in item)) fail(`manifest ${item.driveId || item.sourcePath} missing ${field}`);
  if (!inventoryIds.has(item.driveId)) fail(`manifest has unknown Drive ID ${item.driveId}`);
  if (!/^https:\/\/drive\.google\.com\/thumbnail\?id=[\w-]+&sz=w1200$/.test(item.posterUrl)) fail(`invalid poster URL for ${item.driveId}`);
  if (!new RegExp(`^https://drive\\.google\\.com/file/d/${item.driveId}/view$`).test(item.originalUrl)) fail(`invalid Drive URL for ${item.driveId}`);
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
const renderer = readFileSync(scriptPath, "utf8");
for (const file of [htmlPath, scriptPath, manifestPath, resolve(root, "README.md"), resolve(root, "css", "style.css")]) {
  if (readFileSync(file, "utf8").startsWith("+")) fail(`generated file has an invalid leading +: ${file.replace(root + "/", "")}`);
}
for (const contract of ["portfolio-featured", "portfolio-archive", "media-dialog", "media-dialog-content"]) {
  if (!html.includes(`id="${contract}"`)) fail(`document missing #${contract}`);
}
if (!html.includes('src="js/portfolio-data.js"') || !html.includes('src="js/script.js"')) fail("document does not load the manifest and renderer");
if (html.indexOf('js/portfolio-data.js') > html.indexOf('js/script.js')) fail("manifest must load before renderer");
if (!renderer.includes("data-media-id")) fail("renderer does not create the data-media-id archive contract");
if (!renderer.includes('setAttribute("aria-label"')) fail("renderer does not create accessible media-control labels");
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
    ["original", item.originalUrl, item],
    ["poster", item.posterUrl, item]
  ]);
  const failures = [];
  await Promise.all(urls.map(async ([kind, url, item]) => {
    try {
      const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
      if (!response.ok) failures.push(`${kind} URL failed for ${item.driveId}: HTTP ${response.status}`);
      if (kind === "preview") {
        const text = await response.text();
        if (/request access|you need access|access denied|sign in to continue/i.test(text)) failures.push(`preview requires authentication for ${item.driveId}`);
      }
    } catch (error) {
      failures.push(`${kind} URL failed for ${item.driveId}: ${error.message}`);
    }
  }));
  failures.forEach(fail);
  if (process.exitCode) process.exit();
  console.log(`PASS source inventory: ${inventoryMedia.length} media IDs (${videos} video, ${images} image)`);
  console.log(`PASS manifest coverage: ${manifestIds.size}/${inventoryIds.size} unique Drive IDs`);
  console.log("PASS document and renderer contract");
  console.log("PASS privacy and placeholder scan");
  console.log("PASS URL and provider validation");
  console.log("PASS portfolio completion: 100%");
}
