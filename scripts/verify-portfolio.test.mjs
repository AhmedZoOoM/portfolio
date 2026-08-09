import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const verifier = readFileSync("scripts/verify-portfolio.mjs", "utf8");
const html = readFileSync("index.html", "utf8");
const renderer = readFileSync("js/script.js", "utf8");

assert.match(verifier, /const MAX_CONCURRENT_REQUESTS = 12;/, "URL audit must cap concurrent requests");
assert.match(verifier, /const MAX_ATTEMPTS = 4;/, "URL audit must retry rate-limited requests");
assert.match(verifier, /response\.status === 429/, "URL audit must recognize HTTP 429");
assert.match(verifier, /response\.status >= 500/, "URL audit must retry transient provider failures");
assert.match(verifier, /await delay\(/, "URL audit must back off between retry attempts");
assert.match(verifier, /process\.exit\(process\.exitCode\)/, "verifier must preserve a failing exit status");
assert.doesNotMatch(verifier, /\["original", item\.originalUrl, item\]/, "Drive view URLs must be validated structurally, not rate-limited as media probes");
assert.doesNotMatch(html, /Cairo, Egypt/, "the excluded location must not be published");
assert.doesNotMatch(renderer, /Video · captions unavailable/, "caption label must not be hard-coded");
assert.match(renderer, /captionLabel/, "caption label must derive from manifest state");
assert.match(verifier, /src", "main\.js"/, "the verifier must validate the Vite module entrypoint");
assert.match(verifier, /src", "components", "media-card\.js"/, "the verifier must validate the Vite card renderer contract");
assert.match(verifier, /"playbackUrl"/, "the verifier must require the native Drive stream contract");
assert.match(verifier, /Range:\s*"bytes=0-1023"/, "the verifier must probe native streams with a small byte range");
assert.match(verifier, /response\.status !== 206/, "the verifier must reject non-seekable native stream responses");

console.log("PASS rate-limit, privacy, and caption regressions");
