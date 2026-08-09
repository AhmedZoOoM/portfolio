import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve("dist");
const indexPath = resolve(dist, "index.html");

if (!existsSync(indexPath)) throw new Error("dist/index.html is missing; run npm run build first");

const html = readFileSync(indexPath, "utf8");
for (const required of ["Every frame earns its place.", "portfolio-featured", "portfolio-archive", "media-dialog", "ProfilePage"]) {
  if (!html.includes(required)) throw new Error(`built output is missing ${required}`);
}
if (!html.includes('/portfolio/')) throw new Error("built output does not preserve the GitHub Pages base path");

console.log("PASS Vite build output contract");
