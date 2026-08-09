import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const sandbox = { window: {} };
vm.runInNewContext(readFileSync("js/portfolio-data.js", "utf8"), sandbox, { filename: "js/portfolio-data.js" });

const media = sandbox.window.PORTFOLIO_DATA.projects.flatMap((project) => project.media);
const videos = media.filter((item) => item.kind === "video");
assert.ok(videos.length > 0, "the archive must contain video media");
for (const item of videos) {
  assert.equal(
    item.playbackUrl,
    `https://drive.usercontent.google.com/download?id=${item.driveId}&export=download&confirm=t`,
    `video ${item.driveId} must declare its native Drive stream URL`
  );
}

console.log(`PASS native Drive stream manifest: ${videos.length} videos`);
