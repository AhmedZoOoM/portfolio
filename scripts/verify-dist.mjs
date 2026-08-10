import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function verifyDist(distDirectory = resolve("dist")) {
  const dist = resolve(distDirectory);
  const indexPath = resolve(dist, "index.html");

  if (!existsSync(indexPath)) throw new Error("dist/index.html is missing; run npm run build first");

  const html = readFileSync(indexPath, "utf8");
  for (const required of [
    "The story is in the edit.",
    '<meta property="og:description" content="The story is in the edit.">',
    '<meta name="twitter:description" content="The story is in the edit.">',
    "portfolio-featured",
    "portfolio-archive",
    "media-dialog",
    "ProfilePage"
  ]) {
    if (!html.includes(required)) throw new Error(`built output is missing ${required}`);
  }
  if (!html.includes('/portfolio/')) throw new Error("built output does not preserve the GitHub Pages base path");

  const portraitMatch = html.match(/src="(\/portfolio\/assets\/ahmed-azzam-x-profile-[^"]+\.jpg)"/);
  if (!portraitMatch) throw new Error("built output is missing the local X portrait asset");
  const portraitPath = resolve(dist, portraitMatch[1].replace(/^\/portfolio\//, ""));
  if (!existsSync(portraitPath)) throw new Error("built portrait asset is missing from dist");
  const portraitDigest = createHash("sha256").update(readFileSync(portraitPath)).digest("hex");
  if (portraitDigest !== "da840662fcf0bc2cbc89605756aac30f50a2b9dfce8e25c6bf3366445fce2278") {
    throw new Error("built X portrait asset does not match the approved snapshot");
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  verifyDist();
  console.log("PASS Vite build output contract");
}
