import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const main = readFileSync("src/main.js", "utf8");
const cards = readFileSync("src/components/media-card.js", "utf8");
const archive = readFileSync("src/components/archive.js", "utf8");
const components = readFileSync("src/styles/components.css", "utf8");
const layout = readFileSync("src/styles/layout.css", "utf8");

assert.doesNotMatch(html, /class="hero-play"/, "the hero poster must not have an oversized custom PLAY overlay");
assert.doesNotMatch(cards, /play-mark/, "media cards must not duplicate playback controls over thumbnails");
assert.doesNotMatch(components, /\.play-mark/, "removed playback overlays must not leave dead styling");
assert.match(main, /if \(!heroItem\)/, "the page must render safely when the configured hero is deleted");
assert.match(main, /filter\(Boolean\)/, "selected work must skip Drive IDs that no longer exist");
assert.match(main, /selected-count/, "selected-work copy must derive from current media");
assert.match(archive, /filters\.replaceChildren\(\)/, "archive filters must be idempotent across data refreshes");
assert.match(archive, /archive-empty/, "an empty Drive source must render a named empty state");
assert.match(cards, /media-visual-fallback/, "failed Drive thumbnails must expose a readable fallback");
assert.match(main, /hero-preview-fallback/, "failed hero thumbnails must expose a readable fallback");
assert.doesNotMatch(layout, /featured-grid[^}]*data-aspect="portrait"/, "selected portrait cards must preserve the manifest ratio without an editorial crop");
const responsive = readFileSync("src/styles/responsive.css", "utf8");
assert.doesNotMatch(responsive, /featured-grid\s+\.media-card:first-child\s+\.media-visual\s+img/, "mobile rules must not override the selected portrait crop");
assert.match(archive, /podcast:\s*"Podcast"/, "podcast filters must have a human-readable label");

console.log("PASS dynamic portfolio and native-player polish contracts");
