const driveDownloadUrl = (driveId) => `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`;
const drivePreviewUrl = (driveId) => `https://drive.google.com/file/d/${driveId}/preview`;

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

export function createMediaDialog() {
  const dialog = document.querySelector("#media-dialog");
  const content = document.querySelector("#media-dialog-content");
  const title = document.querySelector("#media-dialog-title");
  const close = document.querySelector("#media-dialog-close");
  let opener;

  function clear() {
    content.replaceChildren();
    opener?.focus();
  }

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", clear);

  function mediaActions(item, showPreview) {
    const actions = makeElement("div", "media-player-actions");
    const source = makeElement("a", "source-link", "Open in Google Drive");
    source.href = item.originalUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    const preview = makeElement("button", "media-preview-button", "Use Google Drive player");
    preview.type = "button";
    preview.addEventListener("click", showPreview);
    actions.append(source, preview);
    return actions;
  }

  function showDrivePreview(item) {
    const player = makeElement("div", `media-player media-player-${item.aspect}`);
    const frame = document.createElement("iframe");
    frame.className = `media-frame media-frame-${item.aspect}`;
    frame.src = drivePreviewUrl(item.driveId);
    frame.title = `Google Drive player: ${item.displayTitle}`;
    frame.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    frame.allowFullscreen = true;
    player.append(frame, mediaActions(item, () => showNativePlayer(item)));
    content.replaceChildren(player);
  }

  function showNativePlayer(item) {
    const player = makeElement("div", `media-player media-player-${item.aspect}`);
    const status = makeElement("p", "media-player-status", "Loading video controls…");
    status.setAttribute("aria-live", "polite");
    const video = document.createElement("video");
    video.className = `media-frame media-frame-${item.aspect}`;
    video.src = item.playbackUrl || driveDownloadUrl(item.driveId);
    video.poster = item.posterUrl;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", `Video: ${item.displayTitle}`);
    video.addEventListener("loadedmetadata", () => {
      const aspect = video.videoWidth === video.videoHeight ? "square" : video.videoWidth > video.videoHeight ? "landscape" : "portrait";
      player.className = `media-player media-player-${aspect}`;
      video.className = `media-frame media-frame-${aspect}`;
      status.textContent = "";
    });
    video.addEventListener("error", () => {
      status.textContent = "This browser could not start the embedded video. Use the Google Drive player instead.";
      player.classList.add("media-player-error");
    });
    player.append(status, video, mediaActions(item, () => showDrivePreview(item)));
    content.replaceChildren(player);
  }

  return function openMedia(item, trigger) {
    opener = trigger;
    title.textContent = item.displayTitle;
    content.replaceChildren();
    if (item.kind === "image") {
      const image = document.createElement("img");
      image.className = `media-frame media-frame-${item.aspect}`;
      image.src = item.posterUrl;
      image.alt = item.displayTitle;
      content.append(image);
    } else showNativePlayer(item);
    dialog.showModal();
  };
}
