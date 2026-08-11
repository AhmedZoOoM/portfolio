import "./styles/index.css";

import { portfolioData } from "./data/portfolio-data.js";
import { renderArchive } from "./components/archive.js";
import { createMediaCard } from "./components/media-card.js";
import { createMediaDialog } from "./components/media-dialog.js";
import { renderSocialLinks } from "./components/social-links.js";
import { initializeTheme } from "./components/theme-toggle.js";

initializeTheme();
const openMedia = createMediaDialog();
const allMedia = portfolioData.projects.flatMap((project) => project.media);
const mediaById = new Map(allMedia.map((item) => [item.driveId, item]));

function alignHashAnchor() {
  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return;
  window.requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
}

function renderHero() {
  const heroItem = mediaById.get(portfolioData.site.heroMediaId);
  const poster = document.querySelector("#hero-poster");
  const play = document.querySelector("#hero-play");
  const monitor = document.querySelector(".hero-monitor");
  const showPosterFallback = () => {
    poster.hidden = true;
    monitor.classList.add("hero-monitor-empty");
    if (monitor.querySelector(".hero-preview-fallback")) return;
    const fallback = document.createElement("p");
    fallback.className = "hero-preview-fallback";
    fallback.textContent = "Featured preview unavailable";
    monitor.append(fallback);
  };
  if (!heroItem) {
    showPosterFallback();
    play.disabled = true;
    play.textContent = "Featured media unavailable";
    return;
  }
  poster.src = heroItem.posterUrl;
  poster.alt = heroItem.displayTitle;
  poster.closest("[dir]").dir = heroItem.dir;
  poster.addEventListener("error", showPosterFallback, { once: true });
  play.addEventListener("click", () => openMedia(heroItem, play));
}

function renderSelectedWork() {
  const featured = document.querySelector("#portfolio-featured");
  const selected = portfolioData.site.featuredMediaIds.map((id) => mediaById.get(id)).filter(Boolean);
  const selectedCount = document.querySelector("#selected-count");
  document.querySelector("#selected-eyebrow").textContent = `Selected sequence / ${String(selected.length).padStart(2, "0")}`;
  selectedCount.textContent = selected.length === 1 ? "One entry point into the complete archive." : `${selected.length} entry points into the complete archive.`;
  if (!selected.length) {
    selectedCount.textContent = "Selected work will return after the next Drive sync.";
    const empty = document.createElement("p");
    empty.className = "archive-empty";
    empty.textContent = "No selected media is currently available.";
    featured.append(empty);
    return;
  }
  selected.forEach((item) => {
    featured.append(createMediaCard(item, openMedia, { featured: item.driveId === portfolioData.site.heroMediaId }));
  });
}

function renderProfile() {
  const experience = document.querySelector("#experience-list");
  const skills = document.querySelector("#skills-list");
  portfolioData.profile.experience.forEach((item) => experience.append(Object.assign(document.createElement("li"), { textContent: item })));
  portfolioData.profile.skills.forEach((item) => skills.append(Object.assign(document.createElement("li"), { textContent: item })));
}

renderHero();
renderSelectedWork();
renderArchive(portfolioData.projects, openMedia);
renderProfile();
renderSocialLinks(portfolioData.socials);
window.addEventListener("load", alignHashAnchor, { once: true });
window.addEventListener("hashchange", alignHashAnchor);
