(() => {
  const data = window.PORTFOLIO_DATA;
  if (!data) return;

  const featured = document.querySelector("#portfolio-featured");
  const archive = document.querySelector("#portfolio-archive");
  const filters = document.querySelector("#filters");
  const count = document.querySelector("#media-count");
  const dialog = document.querySelector("#media-dialog");
  const dialogContent = document.querySelector("#media-dialog-content");
  const dialogTitle = document.querySelector("#media-dialog-title");
  const closeDialog = document.querySelector("#media-dialog-close");
  const allMedia = data.projects.flatMap((project) => project.media);
  let activeCategory = "all";
  let opener;

  function element(tag, options = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(options).forEach(([key, value]) => {
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "ariaLabel") node.setAttribute("aria-label", value);
      else if (key.startsWith("data-")) node.setAttribute(key, value);
      else node[key] = value;
    });
    children.forEach((child) => node.append(child));
    return node;
  }

  function card(item) {
    const article = element("article", {
      className: "media-card",
      "data-media-id": item.driveId,
      "data-category": item.category,
      "data-variant-group": item.variantGroup || "",
      "data-aspect": item.aspect
    });
    const open = element("button", { type: "button", ariaLabel: item.ariaLabel });
    const image = element("img", { src: item.posterUrl, alt: item.displayTitle, loading: "lazy" });
    const copy = element("div", { className: "card-copy", dir: item.dir });
    copy.append(
      element("p", { className: "card-meta", text: item.category }),
      element("h3", { text: item.displayTitle }),
      element("p", { className: "card-meta", text: item.kind === "video" ? "Video · captions unavailable" : "Still image" })
    );
    const links = element("div", { className: "card-links" });
    const source = element("a", { href: item.originalUrl, target: "_blank", rel: "noopener noreferrer", text: "Open original in Drive" });
    source.addEventListener("click", (event) => event.stopPropagation());
    links.append(source);
    open.append(image, copy);
    open.addEventListener("click", () => openMedia(item, open));
    article.append(open, links);
    return article;
  }

  function renderFeatured() {
    const byId = new Map(allMedia.map((item) => [item.driveId, item]));
    data.featuredMediaIds.forEach((id) => featured.append(card(byId.get(id))));
  }

  function renderArchive() {
    archive.replaceChildren();
    let shown = 0;
    data.projects.forEach((project) => {
      const items = project.media.filter((item) => activeCategory === "all" || item.category === activeCategory);
      if (!items.length) return;
      shown += items.length;
      const header = element("header", {}, [
        element("h3", { text: project.title }),
        element("p", { className: "card-meta", text: project.summary })
      ]);
      const grid = element("div", { className: "media-grid" });
      items.forEach((item) => grid.append(card(item)));
      archive.append(element("section", { className: "project-group", "data-category": project.category }, [header, grid]));
    });
    if (!shown) archive.append(element("p", { text: "No media in this category." }));
    count.textContent = `${shown} / ${allMedia.length} items`;
  }

  function renderFilters() {
    const categories = ["all", ...new Set(allMedia.map((item) => item.category))];
    const labels = { all: "All", commercial: "Commercial", television: "Television", showreel: "Showreel", social: "Social / reels", "making-of": "Making-of", stills: "Stills" };
    categories.forEach((category) => {
      const button = element("button", { className: "filter", type: "button", text: labels[category] || category });
      button.dataset.category = category;
      button.setAttribute("aria-pressed", String(category === activeCategory));
      button.addEventListener("click", () => {
        activeCategory = category;
        filters.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        renderArchive();
      });
      filters.append(button);
    });
  }

  function openMedia(item, trigger) {
    opener = trigger;
    dialogTitle.textContent = item.displayTitle;
    dialogContent.replaceChildren();
    if (item.kind === "image") {
      dialogContent.append(element("img", { src: item.posterUrl, alt: item.displayTitle }));
    } else {
      const frame = element("iframe", {
        src: "https://drive.google.com/file/d/" + item.driveId + "/preview",
        title: "Video: " + item.displayTitle,
        allow: "fullscreen",
        allowFullscreen: true
      });
      dialogContent.append(frame);
    }
    dialog.showModal();
  }

  function clearDialog() {
    dialogContent.replaceChildren();
    if (opener) opener.focus();
  }

  function populateProfile() {
    const experience = document.querySelector("#experience-list");
    const skills = document.querySelector("#skills-list");
    data.profile.experience.forEach((item) => experience.append(element("li", { text: item })));
    data.profile.skills.forEach((item) => skills.append(element("li", { text: item })));
  }

  closeDialog.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", clearDialog);
  renderFeatured();
  renderFilters();
  renderArchive();
  populateProfile();
})();
