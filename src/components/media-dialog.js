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
    } else {
      const frame = document.createElement("iframe");
      frame.className = `media-frame media-frame-${item.aspect}`;
      frame.src = `https://drive.google.com/file/d/${item.driveId}/preview`;
      frame.title = `Video: ${item.displayTitle}`;
      frame.allow = "autoplay; fullscreen; picture-in-picture";
      frame.allowFullscreen = true;
      content.append(frame);
    }
    dialog.showModal();
  };
}
