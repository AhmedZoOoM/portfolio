import { expect, test } from "@playwright/test";

async function assertDynamicPortfolio(page) {
  await page.goto("./", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".play-mark, .hero-play")).toHaveCount(0);

  const cards = page.locator("#portfolio-archive [data-media-id]");
  const empty = page.locator("#portfolio-archive .archive-empty");
  const manifest = await page.evaluate(() => {
    const media = window.PORTFOLIO_DATA.projects.flatMap((project) => project.media);
    return media.map((item) => ({ id: item.driveId, category: item.category }));
  });
  const total = manifest.length;
  await expect(cards).toHaveCount(total);
  await expect(page.locator("#portfolio-archive .project-drawer[open]")).toHaveCount(0);
  if (total === 0) {
    await expect(empty).toBeVisible();
    await expect(page.locator("#media-count")).toContainText("0 / 0");
    return;
  }

  const ids = await cards.evaluateAll((nodes) => nodes.map((node) => node.dataset.mediaId));
  expect(new Set(ids).size).toBe(total);
  expect(ids.toSorted()).toEqual(manifest.map((item) => item.id).toSorted());
  const categories = manifest.map((item) => item.category);
  const filters = page.locator("#filters button[aria-pressed]");
  expect(await filters.count()).toBeGreaterThan(0);
  for (const filter of await filters.all()) {
    const category = await filter.getAttribute("data-category");
    const expected = category === "all" ? total : categories.filter((value) => value === category).length;
    await filter.click();
    await expect(page.locator("#media-count")).toContainText(`${expected} / ${total}`);
    await expect(page.locator("#portfolio-archive .project-drawer[open]")).toHaveCount(0);
  }

  const videoCard = page.locator('#portfolio-archive [data-kind="video"]').first();
  if (await videoCard.count()) {
    const category = await videoCard.getAttribute("data-category");
    await page.locator(`#filters button[data-category="${category}"]`).click();
    const videoDrawer = videoCard.locator("xpath=ancestor::details[1]");
    await expect(videoDrawer).toHaveCount(1);
    await videoDrawer.locator("summary").click();
    await expect(videoCard.locator(".media-open")).toBeVisible();
    await videoCard.locator(".media-open").click();
    const dialog = page.locator("#media-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("iframe")).toHaveCount(1);
    await expect(dialog.locator("video, .media-player-actions, .play-mark")).toHaveCount(0);
    await page.getByRole("button", { name: "Close media viewer" }).click();
    await expect(dialog).not.toBeVisible();
  }

  const imageCard = page.locator('#portfolio-archive [data-kind="image"]').first();
  if (await imageCard.count()) {
    const category = await imageCard.getAttribute("data-category");
    await page.locator(`#filters button[data-category="${category}"]`).click();
    const imageDrawer = imageCard.locator("xpath=ancestor::details[1]");
    await expect(imageDrawer).toHaveCount(1);
    await imageDrawer.locator("summary").click();
    await expect(imageCard.locator(".media-open")).toBeVisible();
    await imageCard.locator(".media-open").click();
    const dialog = page.locator("#media-dialog");
    await expect(dialog.locator("iframe")).toHaveCount(0);
    await expect(dialog.locator("img")).toHaveCount(1);
    await page.getByRole("button", { name: "Close media viewer" }).click();
  }
}

async function assertAlignedPhoneHeader(page) {
  const geometry = await page.evaluate(() => {
    const box = (selector) => {
      const { x, y, width, height, right, bottom } = document.querySelector(selector).getBoundingClientRect();
      return { x, y, width, height, right, bottom };
    };

    return {
      brand: box(".brand"),
      navigation: box(".nav"),
      toggle: box("#theme-toggle"),
      cta: box(".nav-cta"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  expect(geometry.toggle.y).toBeCloseTo(geometry.cta.y, 0);
  expect(geometry.cta.x - geometry.toggle.right).toBeCloseTo(16, 0);
  expect(geometry.cta.right).toBeCloseTo(geometry.navigation.right, 0);
  expect(geometry.toggle.y - geometry.brand.bottom).toBeCloseTo(16, 0);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
}

test("deployed portfolio derives archive, filters, and player from live media", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await assertDynamicPortfolio(page);
});

test("deployed portfolio keeps dark mode by default and persists an explicit light choice", async ({ page }) => {
  await page.goto("./", { waitUntil: "networkidle" });
  const root = page.locator("html");
  const toggle = page.getByRole("button", { name: "Switch to light mode" });
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toBeEnabled();
  await expect(toggle).toHaveAttribute("title", "Switch to light mode");
  await expect(toggle.locator(".theme-toggle-icon--sun")).toBeVisible();
  await expect(toggle.locator(".theme-toggle-icon--moon")).toBeHidden();
  await toggle.click();
  const darkToggle = page.getByRole("button", { name: "Switch to dark mode" });
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(darkToggle).toHaveAttribute("title", "Switch to dark mode");
  await expect(darkToggle.locator(".theme-toggle-icon--sun")).toBeHidden();
  await expect(darkToggle.locator(".theme-toggle-icon--moon")).toBeVisible();
  await expect(darkToggle).toHaveCSS("width", "44px");
  await expect(darkToggle).toHaveCSS("height", "44px");
  await page.reload({ waitUntil: "networkidle" });
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
});

test("deployed portfolio remains usable on a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await assertDynamicPortfolio(page);
  await assertAlignedPhoneHeader(page);
  await expect(page.getByRole("link", { name: "Discuss a project" })).toBeVisible();

  await page.setViewportSize({ width: 320, height: 844 });
  await assertAlignedPhoneHeader(page);
});

const issue39Viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "high-resolution desktop", width: 2560, height: 1440 },
  { name: "4K desktop", width: 3840, height: 2160 }
];

async function readHeroAndNav(page) {
  return page.evaluate(() => {
    const rgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = ([r, g, b]) => {
      const channel = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
    const box = (node) => node.getBoundingClientRect();
    const canvas = rgb(getComputedStyle(document.body).backgroundColor);
    const navBackground = rgb(getComputedStyle(document.querySelector(".nav-links")).backgroundColor);
    const header = box(document.querySelector(".site-header"));
    const name = document.querySelector(".hero-name");
    const title = document.querySelector("#hero-title");
    const monitorImage = box(document.querySelector("#hero-poster"));
    const lede = box(document.querySelector(".hero-lede"));
    const monitor = box(document.querySelector(".hero-monitor"));
    const hero = box(document.querySelector(".hero"));
    return {
      viewportHeight: window.innerHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      headerBottom: header.bottom,
      nameTop: box(name).top,
      nameBottom: box(name).bottom,
      nameSize: parseFloat(getComputedStyle(name).fontSize),
      titleSize: parseFloat(getComputedStyle(title).fontSize),
      monitorRatio: monitorImage.width / monitorImage.height,
      heroBottomSlack: hero.bottom - Math.max(lede.bottom, monitor.bottom),
      links: [...document.querySelectorAll(".nav-links a")].map((link) => {
        const style = getComputedStyle(link);
        const rect = box(link);
        return {
          text: link.textContent.trim(),
          height: rect.height,
          width: rect.width,
          visible: rect.width > 0 && rect.height > 0 && rect.right <= window.innerWidth + 1,
          fontSize: parseFloat(style.fontSize),
          fontWeight: Number(style.fontWeight),
          contrast: contrast(rgb(style.color), navBackground),
          canvasContrast: contrast(rgb(style.color), canvas)
        };
      })
    };
  });
}

for (const theme of ["dark", "light"]) {
  for (const viewport of issue39Viewports) {
    test(`issue 39: ${theme} ${viewport.name} shows a prominent name, title, and readable navigation without dead space`, async ({ page }) => {
      await page.addInitScript((value) => { try { localStorage.setItem("portfolio-theme", value); } catch {} }, theme);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("./", { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

      const hero = page.locator("#top");
      await expect(hero.locator(".hero-name")).toHaveText("Ahmed Azzam");
      await expect(hero.locator(".hero-role-title")).toHaveText("Senior Video Editor");
      await expect(hero.locator(".hero-role-mark")).toHaveText("Portfolio");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const metrics = await readHeroAndNav(page);
      expect(metrics.overflow).toBeLessThanOrEqual(1);
      expect(metrics.nameSize).toBeGreaterThan(metrics.titleSize);
      expect(metrics.nameBottom).toBeLessThan(metrics.viewportHeight);
      expect(metrics.nameTop - metrics.headerBottom).toBeLessThan(Math.max(96, metrics.viewportHeight * 0.1));
      expect(metrics.monitorRatio).toBeCloseTo(16 / 9, 1);
      expect(metrics.heroBottomSlack).toBeLessThan(Math.max(120, metrics.viewportHeight * 0.12));

      expect(metrics.links.map((link) => link.text)).toEqual(["Work", "Archive", "About", "Experience"]);
      for (const link of metrics.links) {
        expect(link.visible).toBe(true);
        expect(link.height).toBeGreaterThanOrEqual(44);
        expect(link.fontSize).toBeGreaterThanOrEqual(15);
        expect(link.fontWeight).toBeGreaterThanOrEqual(600);
        expect(link.contrast).toBeGreaterThanOrEqual(7);
        expect(link.canvasContrast).toBeGreaterThanOrEqual(7);
      }
    });
  }
}

test("issue 39: navigation scales up on high-resolution screens", async ({ page }) => {
  const sizes = {};
  for (const viewport of [issue39Viewports[2], issue39Viewports[3], issue39Viewports[4]]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("./", { waitUntil: "networkidle" });
    sizes[viewport.width] = await page.locator(".nav-links a").first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
  }
  expect(sizes[2560]).toBeGreaterThan(sizes[1440]);
  expect(sizes[3840]).toBeGreaterThan(sizes[2560]);
});

test("issue 39: the primary navigation marks the section in view", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./", { waitUntil: "networkidle" });
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await nav.getByRole("link", { name: "Archive" }).click();
  await expect(nav.getByRole("link", { name: "Archive" })).toHaveAttribute("aria-current", "true");
  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector("#about").scrollIntoView({ block: "start" }));
  await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "true");
  await expect(nav.locator('a[aria-current="true"]')).toHaveCount(1);
});

test("issue 39: keyboard focus stays visible and reduced motion disables transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./", { waitUntil: "networkidle" });
  const workLink = page.locator(".nav-links a").first();
  await workLink.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(workLink).toBeFocused();
  const focus = await workLink.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), transition: parseFloat(style.transitionDuration) };
  });
  expect(focus.outlineStyle).toBe("solid");
  expect(focus.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(focus.transition).toBeLessThan(0.01);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
});

test("issue 39: selected work leaves no tall empty gaps and keeps portrait posters uncropped", async ({ page }) => {
  for (const viewport of [issue39Viewports[2], issue39Viewports[3]]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("./", { waitUntil: "networkidle" });
    const layout = await page.evaluate(() => {
      const grid = document.querySelector("#portfolio-featured");
      const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
      const cards = [...grid.querySelectorAll(".media-card")].map((card) => {
        const rect = card.getBoundingClientRect();
        const image = card.querySelector("img");
        const imageRect = image.getBoundingClientRect();
        return {
          aspect: card.dataset.aspect,
          left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
          imageRatio: imageRect.width / imageRect.height,
          objectFit: getComputedStyle(image).objectFit,
          hidden: image.hidden
        };
      });
      return { gap, gridBottom: grid.getBoundingClientRect().bottom, cards };
    });
    for (const card of layout.cards) {
      const below = layout.cards.filter((other) => other !== card && other.top >= card.bottom - 1 && other.left < card.right - 1 && other.right > card.left + 1);
      const nextTop = below.length ? Math.min(...below.map((other) => other.top)) : layout.gridBottom;
      expect(nextTop - card.bottom).toBeLessThanOrEqual(layout.gap + 2);
      if (card.aspect === "portrait" && !card.hidden) {
        expect(card.imageRatio).toBeCloseTo(9 / 16, 1);
        expect(card.objectFit).toBe("contain");
      }
    }
  }
});
