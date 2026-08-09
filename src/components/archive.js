import { createMediaCard } from "./media-card.js";

const labels = {
  all: "All work",
  commercial: "Commercial",
  television: "Television",
  showreel: "Showreel",
  social: "Social / reels",
  "making-of": "Making-of",
  stills: "Stills"
};

export function renderArchive(projects, openMedia) {
  const archive = document.querySelector("#portfolio-archive");
  const filters = document.querySelector("#filters");
  const count = document.querySelector("#media-count");
  const allMedia = projects.flatMap((project) => project.media);
  let activeCategory = "all";

  function render() {
    archive.replaceChildren();
    let shown = 0;
    projects.forEach((project, index) => {
      const media = project.media.filter((item) => activeCategory === "all" || item.category === activeCategory);
      if (!media.length) return;
      shown += media.length;
      const drawer = document.createElement("details");
      drawer.className = "project-drawer";
      drawer.open = activeCategory !== "all" || index === 0;
      drawer.dataset.category = project.category;
      const summary = document.createElement("summary");
      const track = document.createElement("span");
      track.className = "track-label";
      track.textContent = `TRACK · ${labels[project.category] || project.category}`;
      const title = document.createElement("strong");
      title.textContent = project.title;
      const total = document.createElement("span");
      total.className = "drawer-count";
      total.textContent = `${media.length} clip${media.length === 1 ? "" : "s"}`;
      summary.append(track, title, total);
      const context = document.createElement("p");
      context.className = "drawer-context";
      context.textContent = project.summary;
      const grid = document.createElement("div");
      grid.className = "media-grid";
      media.forEach((item) => grid.append(createMediaCard(item, openMedia)));
      drawer.append(summary, context, grid);
      archive.append(drawer);
    });
    count.textContent = `${shown} / ${allMedia.length} works`;
    if (!shown) archive.append(Object.assign(document.createElement("p"), { textContent: "No work matches this track." }));
  }

  const categories = ["all", ...new Set(allMedia.map((item) => item.category))];
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter";
    button.textContent = labels[category] || category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      filters.querySelectorAll("button").forEach((filter) => {
        filter.setAttribute("aria-pressed", String(filter === button));
      });
      render();
    });
    filters.append(button);
  });
  render();
}
