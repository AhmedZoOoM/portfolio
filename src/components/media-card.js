function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function createMediaCard(item, openMedia, { featured = false } = {}) {
  const card = make("article", `media-card${featured ? " media-card-featured" : ""}`);
  card.dataset.mediaId = item.driveId;
  card.dataset.category = item.category;
  card.dataset.variantGroup = item.variantGroup || "";
  card.dataset.aspect = item.aspect;

  const button = make("button", "media-open");
  button.type = "button";
  button.setAttribute("aria-label", item.ariaLabel);
  const visual = make("span", "media-visual");
  const image = document.createElement("img");
  image.src = item.posterUrl;
  image.alt = item.displayTitle;
  image.loading = featured ? "eager" : "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    image.hidden = true;
    visual.classList.add("media-visual-fallback");
    visual.append(make("span", "media-fallback", `${item.kind === "image" ? "Image" : "Video"} preview unavailable`));
  }, { once: true });
  visual.append(image);

  const copy = make("span", "card-copy");
  copy.dir = item.dir;
  copy.append(
    make("span", "card-meta", `${item.projectTitle} · ${item.category}`),
    make("strong", "card-title", item.displayTitle),
    make("span", "card-meta", item.kind === "video" ? "Video edit" : "Still image")
  );
  button.append(visual, copy);
  button.addEventListener("click", () => openMedia(item, button));

  const links = make("div", "card-links");
  const source = make("a", "source-link", "Open source");
  source.href = item.originalUrl;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  links.append(source);
  card.append(button, links);
  return card;
}
