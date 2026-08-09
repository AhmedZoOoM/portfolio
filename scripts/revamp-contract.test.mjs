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
const componentStyles = readFileSync(new URL("../src/styles/components.css", import.meta.url), "utf8");
const dialogRenderer = readFileSync(new URL("../src/components/media-dialog.js", import.meta.url), "utf8");
const liveVerifier = readFileSync(new URL("../scripts/verify-live-media.mjs", import.meta.url), "utf8");
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");
const deployWorkflow = readFileSync(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8");
assert.match(html, /aria-label="Verified social profiles"/, "social navigation must stay labeled");
assert.doesNotMatch(html, />YouTube<|>Instagram<|>Vimeo<|>Behance<|>X</, "social links must render as icons, not visible text");
assert.match(html, /<script type="module" src="\.\/src\/main\.js"><\/script>/, "the legacy Pages fallback must load the module beneath the repository path");
assert.doesNotMatch(html, /href="\/portfolio\/css\/style\.css"/, "the Vite artifact must not reference an unbuilt legacy stylesheet");
assert.match(main, /import "\.\/styles\/index\.css";/, "the Vite entrypoint must statically bundle its stylesheet");
assert.match(main, /window\.addEventListener\("load", alignHashAnchor/, "a hash selected before layout settles must be realigned after the load event");
assert.match(main, /target\.scrollIntoView\(\{ block: "start" \}\)/, "hash realignment must scroll the requested target into view");
assert.doesNotMatch(componentStyles, /content-visibility\s*:\s*auto/, "archive layout must remain measurable before an anchor below it is selected");
assert.match(dialogRenderer, /media-frame-\$\{item\.aspect\}/, "the media dialog must preserve each item's aspect ratio");
assert.match(dialogRenderer, /autoplay; fullscreen; picture-in-picture/, "the Drive embed must permit user-initiated playback");
assert.doesNotMatch(dialogRenderer, /createElement\("video"\)/, "the Pages viewer must not use a Drive download endpoint blocked by cross-origin resource policy");
assert.doesNotMatch(liveVerifier, /drive\.usercontent\.google\.com/, "the live verifier must validate the supported embedded player path");
assert.match(componentStyles, /\.media-frame-portrait/, "portrait media requires a viewport-bounded viewer treatment");
assert.match(componentStyles, /100dvh/, "the viewer must account for mobile browser viewport height");
assert.match(packageJson, /"verify:live"/, "the portfolio must expose a post-deploy media verification command");
assert.match(deployWorkflow, /npm run verify:live -- "\$\{\{ steps\.deployment\.outputs\.page_url \}\}"/, "GitHub Pages must verify the deployed media surface");

console.log("PASS approved revamp contract");
