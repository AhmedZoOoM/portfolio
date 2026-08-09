import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const manifestPath = new URL("../js/portfolio-data.js", import.meta.url);
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(manifestPath, "utf8"), sandbox, { filename: "js/portfolio-data.js" });

const data = sandbox.window.PORTFOLIO_DATA;
const allMedia = data.projects.flatMap((project) => project.media);
const approvedFeaturedIds = [
  "17AowvP6cMvmD0yhEehTEPM7CKsGh7s2_",
  "1-aKQ0XYCg0QQs-HRzcwntWSWdNTRilVQ",
  "1XahedVA2AfhI9dL71OwIQHLwB541uw2P",
  "1QuwhZeMIujn7IA9mUAKesgK9XYGYl6Me",
  "1UeE0bPFDZCmEHz21MBE9fClbU7UpSm9q",
  "14QDMVIdDJO6jVTzt5PbcrFviXL2-J-r3"
];

assert.deepEqual(
  Array.from(data.featuredMediaIds),
  approvedFeaturedIds,
  "selected work must use the approved podcast-led sequence"
);
assert.ok(
  allMedia.some((item) => item.driveId === "1Cz1J0y9WeeBCiWTF-rMeTK_GbPfrz8SN"),
  "The Fisherman must remain in the complete archive"
);
assert.ok(existsSync(new URL("../package.json", import.meta.url)), "the portfolio must be buildable with Vite");
assert.ok(existsSync(new URL("../.github/workflows/deploy-pages.yml", import.meta.url)), "GitHub Pages must deploy the Vite build");

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
assert.match(html, /aria-label="Verified social profiles"/, "social navigation must stay labeled");
assert.doesNotMatch(html, />YouTube<|>Instagram<|>Vimeo<|>Behance<|>X</, "social links must render as icons, not visible text");
assert.match(main, /window\.addEventListener\("load", alignHashAnchor/, "a hash selected before layout settles must be realigned after the load event");
assert.match(main, /target\.scrollIntoView\(\{ block: "start" \}\)/, "hash realignment must scroll the requested target into view");

console.log("PASS approved revamp contract");
