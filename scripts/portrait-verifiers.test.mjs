import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { verifyDist } from "./verify-dist.mjs";
import { verifyLiveMedia } from "./verify-live-media.mjs";

const approvedPortrait = new URL("../src/assets/ahmed-azzam-x-profile.jpg", import.meta.url);
const requiredHtml = [
  "The story is in the edit.",
  '<meta property="og:description" content="The story is in the edit.">',
  '<meta name="twitter:description" content="The story is in the edit.">',
  "portfolio-featured",
  "portfolio-archive",
  "media-dialog",
  "ProfilePage"
].join(" ");

const createDistFixture = () => {
  const fixture = mkdtempSync(join(tmpdir(), "portfolio-dist-verifier-"));
  const assets = join(fixture, "assets");
  mkdirSync(assets);
  writeFileSync(
    join(fixture, "index.html"),
    `${requiredHtml} <img src="/portfolio/assets/ahmed-azzam-x-profile-test.jpg">`
  );
  return { fixture, portrait: join(assets, "ahmed-azzam-x-profile-test.jpg") };
};

{
  const { fixture } = createDistFixture();
  try {
    assert.throws(() => verifyDist(fixture), /portrait asset is missing/, "dist verification must reject a missing portrait file");
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

{
  const { fixture, portrait } = createDistFixture();
  try {
    writeFileSync(portrait, "not the approved portrait");
    assert.throws(() => verifyDist(fixture), /does not match the approved snapshot/, "dist verification must reject portrait corruption");
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

const liveHtml = `${requiredHtml} <script src="/portfolio/assets/app.js"></script> <link href="/portfolio/assets/app.css"> <img src="/portfolio/assets/ahmed-azzam-x-profile-test.jpg">`;
const bundle = 'drive.google.com/file/d/example createElement("iframe")';
const css = "height:min(70dvh,600px)";
const response = (body, contentType = "text/plain") => new Response(body, { status: 200, headers: { "content-type": contentType } });
const liveFetch = ({ portraitBody, portraitType = "image/jpeg", html = liveHtml }) => async (url) => {
  const pathname = new URL(url).pathname;
  if (pathname.endsWith("app.js")) return response(bundle, "text/javascript");
  if (pathname.endsWith("app.css")) return response(css, "text/css");
  if (pathname.endsWith(".jpg")) return response(portraitBody, portraitType);
  return response(html, "text/html");
};
const noDelay = async () => {};

await assert.rejects(
  verifyLiveMedia("https://example.test/portfolio/", {
    fetchImpl: liveFetch({ html: liveHtml.replace(/ <img[^>]+\.jpg">/, "") }),
    delayImpl: noDelay
  }),
  /must reference the local X portrait/,
  "live verification must reject a page without the portrait"
);

await assert.rejects(
  verifyLiveMedia("https://example.test/portfolio/", {
    fetchImpl: liveFetch({ portraitBody: "not jpeg", portraitType: "text/plain" }),
    delayImpl: noDelay
  }),
  /must be served as JPEG/,
  "live verification must reject a non-JPEG portrait"
);

await assert.rejects(
  verifyLiveMedia("https://example.test/portfolio/", {
    fetchImpl: liveFetch({ portraitBody: "wrong jpeg bytes" }),
    delayImpl: noDelay
  }),
  /must match the approved snapshot/,
  "live verification must reject the wrong portrait digest"
);

console.log("PASS portrait verifier negative contracts");
