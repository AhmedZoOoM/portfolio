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
