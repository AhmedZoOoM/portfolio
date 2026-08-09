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

  function mediaActions(item) {
    const actions = makeElement("div", "media-player-actions");
    const source = makeElement("a", "source-link", "Open in Google Drive");
    source.href = item.originalUrl;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    actions.append(source);
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
    player.append(frame, mediaActions(item));
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
    } else showDrivePreview(item);
    dialog.showModal();
  };
}
