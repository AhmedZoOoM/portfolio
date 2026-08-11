import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildPortfolioData,
  scanDriveTree,
  serializePortfolioModule,
  verifyPublicMedia
} from "./sync-drive-media.mjs";

const folderMime = "application/vnd.google-apps.folder";

function response(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async text() {
      return JSON.stringify(body);
    },
    async json() {
      return body;
    }
  };
}

const pages = new Map([
  ["root:", {
    files: [
      { id: "folder-automatest", name: "Automatest", mimeType: folderMime },
      { id: "removed-replacement", name: "Fresh edit.mp4", mimeType: "video/mp4", size: "10", modifiedTime: "2026-08-11T00:00:00.000Z" }
    ],
    nextPageToken: "page-2"
  }],
  ["root:page-2", {
    files: [{ id: "folder-unknown", name: "Client Podcast", mimeType: folderMime }]
  }],
  ["folder-automatest:", {
    files: [
      { id: "auto-video", name: "AI and Testing.mp4", mimeType: "video/mp4", size: "20", modifiedTime: "2026-08-10T00:00:00.000Z" },
      { id: "auto-image", name: "AI and Testing.png", mimeType: "image/png", size: "5", modifiedTime: "2026-08-10T00:00:00.000Z" }
    ]
  }],
  ["folder-unknown:", {
    files: [{ id: "inferred-podcast", name: "Episode 1.mp4", mimeType: "video/mp4", size: "30", modifiedTime: "2026-08-09T00:00:00.000Z" }]
  }]
]);

const requests = [];
const fetchImpl = async (input) => {
  const url = new URL(input);
  assert.equal(url.searchParams.get("key"), "test-key");
  assert.equal(url.searchParams.get("orderBy"), "name_natural", "Drive queries must use only documented order keys");
  const parent = /'([^']+)' in parents/.exec(url.searchParams.get("q"))?.[1];
  const pageToken = url.searchParams.get("pageToken") || "";
  requests.push(`${parent}:${pageToken}`);
  return response(pages.get(`${parent}:${pageToken}`));
};

const scanned = await scanDriveTree({
  apiKey: "test-key",
  rootFolderId: "root",
  fetchImpl
});

assert.deepEqual(requests, ["root:", "root:page-2", "folder-automatest:", "folder-unknown:"], "scan must consume every page and recurse deterministically");
assert.deepEqual(scanned.map((item) => item.driveId), ["auto-image", "auto-video", "inferred-podcast", "removed-replacement"], "scan output must be stable and contain only the current Drive tree");

const config = {
  sourceFolderId: "root",
  featuredMediaIds: ["deleted-id", "auto-video"],
  featuredLimit: 3,
  folderMappings: {
    "Drive root": { id: "selected-edits", title: "Selected edits", category: "commercial", summary: "Root" },
    Automatest: { id: "automatest", title: "Automatest", category: "podcast", summary: "Podcast" },
    "Enty Asl El Hekaya": {
      id: "enty",
      title: "Enty Asl El Hekaya",
      category: "podcast",
      categoryLocked: true,
      aliases: ["Enty Asl El Hekaya - أنتى أصل الحكاية"],
      summary: "Podcast"
    }
  },
  categoryInference: [
    { pattern: "podcast", category: "podcast" }
  ],
  profile: {},
  socials: []
};

const data = buildPortfolioData(scanned, config, { scannedAt: "2026-08-11T01:02:03.000Z" });
const media = data.projects.flatMap((project) => project.media);
assert.equal(media.find((item) => item.driveId === "auto-video").category, "podcast", "Automatest videos must be podcasts");
assert.equal(media.find((item) => item.driveId === "auto-image").category, "stills", "image MIME type must override folder category");
assert.equal(media.find((item) => item.driveId === "inferred-podcast").category, "podcast", "unknown folders must use deterministic inference");
assert.deepEqual(data.featuredMediaIds, ["auto-video", "auto-image", "inferred-podcast"], "deleted featured IDs must be skipped and refilled from current media");
assert.equal(data.baseline.expectedMediaCount, scanned.length);
assert.doesNotMatch(serializePortfolioModule(data), /deleted-id/, "generated output must remove deleted Drive content");

const taxonomyData = buildPortfolioData([
  { driveId: "enty-video", sourcePath: "Enty Asl El Hekaya - أنتى أصل الحكاية/Episode.mp4", originalTitle: "Episode.mp4", mimeType: "video/mp4" },
  { driveId: "bts-video", sourcePath: "Drive root/BTS_ADIB.mp4", originalTitle: "BTS_ADIB.mp4", mimeType: "video/mp4" }
], { ...config, featuredMediaIds: ["enty-video", "bts-video", "enty-video"], featuredLimit: 1 });
assert.equal(taxonomyData.projects.find((project) => project.id === "enty")?.category, "podcast", "bilingual folder aliases must retain the configured podcast project");
assert.equal(taxonomyData.projects.flatMap((project) => project.media).find((item) => item.driveId === "bts-video").category, "making-of", "BTS separated by punctuation or underscores must map to making-of");
assert.deepEqual(taxonomyData.featuredMediaIds, ["enty-video"], "featured preferences must be deduplicated and capped");

const publicMedia = await verifyPublicMedia([
  { driveId: "public-video", mimeType: "video/mp4" }
], {
  fetchImpl: async () => response({ html: "preview" })
});
assert.equal(publicMedia[0].publicViewStatus, "anonymous_preview_verified", "successful anonymous previews must be recorded in generated inventory");
await assert.rejects(
  verifyPublicMedia([{ driveId: "private-video", mimeType: "video/mp4" }], {
    fetchImpl: async () => ({ ...response({}), async text() { return "You need access"; } })
  }),
  /authentication/i,
  "private media must stop synchronization before generated files are replaced"
);

await assert.rejects(
  scanDriveTree({
    apiKey: "test-key",
    rootFolderId: "root",
    fetchImpl: async () => response({ files: [], incompleteSearch: true })
  }),
  /incomplete/i,
  "partial Drive search results must fail closed"
);

await assert.rejects(
  scanDriveTree({
    apiKey: "test-key",
    rootFolderId: "root",
    fetchImpl: async () => response({ error: { message: "denied" } }, { ok: false, status: 403 })
  }),
  /403/,
  "Drive API failures must fail closed"
);

const synchronizerSource = await readFile(new URL("./sync-drive-media.mjs", import.meta.url), "utf8");
assert.doesNotMatch(synchronizerSource, /localeCompare/, "generated order must not depend on the runner locale");

console.log("PASS recursive Drive synchronization and taxonomy");
