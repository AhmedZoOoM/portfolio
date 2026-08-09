// Vite bundles this stylesheet. The rejection is intentionally ignored when the
// repository is served directly by legacy GitHub Pages, where css/style.css is
// the equivalent fallback stylesheet.
import("./styles/index.css").catch(() => {});

import { portfolioData } from "./data/portfolio-data.js";
import { renderArchive } from "./components/archive.js";
import { createMediaCard } from "./components/media-card.js";
import { createMediaDialog } from "./components/media-dialog.js";
import { renderSocialLinks } from "./components/social-links.js";

const openMedia = createMediaDialog();
const allMedia = portfolioData.projects.flatMap((project) => project.media);
const mediaById = new Map(allMedia.map((item) => [item.driveId, item]));

function renderHero() {
  const heroItem = mediaById.get(portfolioData.site.heroMediaId);
  const poster = document.querySelector("#hero-poster");
  const play = document.querySelector("#hero-play");
  poster.src = heroItem.posterUrl;
  poster.alt = heroItem.displayTitle;
  poster.closest("[dir]").dir = heroItem.dir;
  play.addEventListener("click", () => openMedia(heroItem, play));
}

function renderSelectedWork() {
  const featured = document.querySelector("#portfolio-featured");
  portfolioData.site.featuredMediaIds.forEach((id) => {
    const item = mediaById.get(id);
    featured.append(createMediaCard(item, openMedia, { featured: id === portfolioData.site.heroMediaId }));
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
