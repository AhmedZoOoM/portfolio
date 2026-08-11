import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const SUPPORTED_MIME = /^(?:video|image)\//;
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";

const hasArabic = (text) => /[\u0600-\u06ff]/.test(text);
const cleanTitle = (title) => title.replace(/\.[^.]+$/, "").replace(/_+/g, " ").replace(/\s+/g, " ").trim();
const slugify = (value) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "other";
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;

function escapeDriveQueryValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function listChildren({ apiKey, folderId, fetchImpl }) {
  const files = [];
  let pageToken;
  do {
    const url = new URL(DRIVE_FILES_URL);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", `'${escapeDriveQueryValue(folderId)}' in parents and trashed = false`);
    url.searchParams.set("fields", "files(id,name,mimeType,size,modifiedTime,capabilities(canDownload)),nextPageToken,incompleteSearch");
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("orderBy", "name_natural");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetchImpl(url);
    if (!response.ok) throw new Error(`Google Drive files.list failed with HTTP ${response.status}`);
    const body = await response.json();
    if (body.incompleteSearch) throw new Error(`Google Drive returned an incomplete search for folder ${folderId}`);
    if (!Array.isArray(body.files)) throw new Error(`Google Drive returned an invalid file list for folder ${folderId}`);
    files.push(...body.files);
    pageToken = body.nextPageToken;
  } while (pageToken);
  return files;
}

export async function scanDriveTree({ apiKey, rootFolderId, fetchImpl = fetch }) {
  if (!apiKey) throw new Error("GOOGLE_DRIVE_API_KEY is required");
  if (!rootFolderId) throw new Error("A Google Drive source folder ID is required");

  const pending = [{ id: rootFolderId, path: "Drive root" }];
  const seenFolders = new Set();
  const media = [];
  while (pending.length) {
    const folder = pending.shift();
    if (seenFolders.has(folder.id)) continue;
    seenFolders.add(folder.id);
    const children = await listChildren({ apiKey, folderId: folder.id, fetchImpl });
    for (const child of children) {
      if (child.mimeType === FOLDER_MIME) {
        pending.push({ id: child.id, path: folder.path === "Drive root" ? child.name : `${folder.path}/${child.name}` });
      } else if (SUPPORTED_MIME.test(child.mimeType || "")) {
        media.push({
          driveId: child.id,
          sourcePath: `${folder.path}/${child.name}`,
          originalTitle: child.name,
          mimeType: child.mimeType,
          size: Number(child.size || 0),
          modifiedTime: child.modifiedTime || null,
          canDownload: child.capabilities?.canDownload ?? null
        });
      }
    }
    pending.sort((left, right) => compareText(left.path, right.path) || compareText(left.id, right.id));
  }
  return media.sort((left, right) => compareText(left.driveId, right.driveId));
}

export async function verifyPublicMedia(sources, { fetchImpl = fetch, concurrency = 8 } = {}) {
  const verified = new Array(sources.length);
  async function verify(source, index) {
    const url = `https://drive.google.com/file/d/${source.driveId}/preview`;
    let lastStatus = 0;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await fetchImpl(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
      lastStatus = response.status;
      if ((response.status === 429 || response.status >= 500) && attempt < 3) continue;
      if (!response.ok) throw new Error(`Anonymous preview failed for ${source.driveId} with HTTP ${response.status}`);
      const html = await response.text();
      if (/request access|you need access|access denied|sign in to continue/i.test(html)) {
        throw new Error(`Anonymous preview requires authentication for ${source.driveId}`);
      }
      verified[index] = { ...source, publicViewStatus: "anonymous_preview_verified" };
      return;
    }
    throw new Error(`Anonymous preview failed for ${source.driveId} with HTTP ${lastStatus}`);
  }
  for (let offset = 0; offset < sources.length; offset += concurrency) {
    await Promise.all(sources.slice(offset, offset + concurrency).map((source, index) => verify(source, offset + index)));
  }
  return verified;
}

function inferCategory(text, rules = []) {
  for (const rule of rules) {
    if (new RegExp(rule.pattern, "i").test(text)) return rule.category;
  }
  return "other";
}

function configuredProjectFor(folderName, config) {
  return Object.entries(config.folderMappings || {}).find(([canonicalName, project]) => canonicalName === folderName || project.aliases?.includes(folderName))?.[1];
}

function projectDetailsFor(folderName, config) {
  const mapped = configuredProjectFor(folderName, config);
  if (mapped) return { ...mapped };
  return {
    id: slugify(folderName),
    title: folderName,
    category: inferCategory(folderName, config.categoryInference),
    summary: `Work from the ${folderName} source folder.`
  };
}

function categoryFor(source, project, config) {
  if (source.mimeType.startsWith("image/")) return "stills";
  if (project.categoryLocked) return project.category;
  if (/showreel/i.test(source.originalTitle)) return "showreel";
  if (/(?:^|[^A-Za-z0-9])BTS(?:$|[^A-Za-z0-9])|making[ _-]?of/i.test(source.originalTitle)) return "making-of";
  if (configuredProjectFor(source.sourcePath.split("/")[0], config)) return project.category;
  return inferCategory(source.sourcePath, config.categoryInference);
}

export function buildPortfolioData(sources, config, { scannedAt } = {}) {
  const folderNames = [...new Set(sources.map((source) => source.sourcePath.split("/")[0]))];
  const projectEntries = folderNames.map((folderName) => [folderName, projectDetailsFor(folderName, config)]);
  const projectsByFolder = new Map(projectEntries);
  const media = sources.map((source) => {
    const folderName = source.sourcePath.split("/")[0];
    const project = projectsByFolder.get(folderName);
    const title = cleanTitle(source.originalTitle);
    const isImage = source.mimeType.startsWith("image/");
    const category = categoryFor(source, project, config);
    const portrait = project.category === "social" || /(?:reels?|portrait|vertical)/i.test(source.sourcePath);
    return {
      driveId: source.driveId,
      sourcePath: source.sourcePath,
      originalTitle: source.originalTitle,
      mimeType: source.mimeType,
      displayTitle: title,
      kind: isImage ? "image" : "video",
      aspect: portrait ? "portrait" : "landscape",
      language: hasArabic(title) ? (/[A-Za-z]/.test(title) ? "mixed" : "ar") : "en",
      dir: hasArabic(title) ? "rtl" : "ltr",
      variantGroup: project.id,
      provider: "drive",
      providerId: null,
      posterUrl: `https://drive.google.com/thumbnail?id=${source.driveId}&sz=w1200`,
      originalUrl: `https://drive.google.com/file/d/${source.driveId}/view`,
      captionState: isImage ? "not-applicable" : "unavailable",
      ariaLabel: `${isImage ? "Open image: " : "Play video: "}${title}`,
      credits: "Credits not specified in the source material.",
      rightsNote: "Shown for professional demonstration; rights remain with their respective owners.",
      projectId: project.id,
      category
    };
  });

  const preferred = config.featuredMediaIds || [];
  const featuredLimit = config.featuredLimit || 6;
  const currentIds = new Set(media.map((item) => item.driveId));
  const featuredMediaIds = [...new Set(preferred.filter((id) => currentIds.has(id)))].slice(0, featuredLimit);
  for (const item of media) {
    if (featuredMediaIds.length >= featuredLimit) break;
    if (!featuredMediaIds.includes(item.driveId)) featuredMediaIds.push(item.driveId);
  }
  const heroMediaId = currentIds.has(config.heroMediaId) ? config.heroMediaId : featuredMediaIds[0] || null;
  const folderCounts = Object.fromEntries(projectEntries.map(([folderName, project]) => [folderName === "Drive root" ? "root" : folderName, media.filter((item) => item.projectId === project.id).length]));
  const modifiedTimes = sources.map((source) => source.modifiedTime).filter(Boolean).sort();

  return {
    baseline: {
      scannedAt: scannedAt || modifiedTimes.at(-1) || null,
      sourceFolderUrl: `https://drive.google.com/drive/folders/${config.sourceFolderId}`,
      expectedMediaCount: media.length,
      expectedVideoCount: media.filter((item) => item.kind === "video").length,
      expectedImageCount: media.filter((item) => item.kind === "image").length,
      folderCounts
    },
    profile: config.profile,
    socials: config.socials,
    heroMediaId,
    featuredMediaIds,
    projects: projectEntries.map(([, project]) => ({
      ...project,
      media: media.filter((item) => item.projectId === project.id)
    }))
  };
}

export function serializePortfolioModule(data) {
  return `/* Generated by scripts/sync-drive-media.mjs. Do not edit by hand. */\nwindow.PORTFOLIO_DATA = ${JSON.stringify(data, null, 2)};\n`;
}

export function serializeInventory(sources, config) {
  const modifiedTimes = sources.map((source) => source.modifiedTime).filter(Boolean).sort();
  return `${JSON.stringify({
    sourceFolderId: config.sourceFolderId,
    sourceFolderUrl: `https://drive.google.com/drive/folders/${config.sourceFolderId}`,
    sourceModifiedAt: modifiedTimes.at(-1) || null,
    media: sources
  }, null, 2)}\n`;
}

async function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const config = JSON.parse(await readFile(new URL("../data/portfolio-config.json", import.meta.url), "utf8"));
  const sources = await scanDriveTree({
    apiKey: process.env.GOOGLE_DRIVE_API_KEY,
    rootFolderId: config.sourceFolderId
  });
  const verifiedSources = await verifyPublicMedia(sources);
  const data = buildPortfolioData(verifiedSources, config);
  const outputs = [
    [new URL("../data/drive-inventory.json", import.meta.url), serializeInventory(verifiedSources, config)],
    [new URL("../js/portfolio-data.js", import.meta.url), serializePortfolioModule(data)]
  ];
  if (process.argv.includes("--check")) {
    const changed = [];
    for (const [path, content] of outputs) {
      if (await readFile(path, "utf8").catch(() => "") !== content) changed.push(fileURLToPath(path).replace(`${root}\\`, ""));
    }
    if (changed.length) throw new Error(`Drive-generated files are stale: ${changed.join(", ")}`);
  } else {
    await Promise.all(outputs.map(([path, content]) => writeFile(path, content)));
    console.log(`Synchronized ${verifiedSources.length} media items from Google Drive.`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file:///${process.argv[1].replace(/\\/g, "/")}`))) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
