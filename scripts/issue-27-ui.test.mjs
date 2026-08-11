import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const archive = readFileSync("src/components/archive.js", "utf8");
const components = readFileSync("src/styles/components.css", "utf8");
const layout = readFileSync("src/styles/layout.css", "utf8");
const responsive = readFileSync("src/styles/responsive.css", "utf8");
const tokens = readFileSync("src/styles/tokens.css", "utf8");
const html = readFileSync("index.html", "utf8");
const main = readFileSync("src/main.js", "utf8");

assert.doesNotMatch(
  archive,
  /drawer\.open\s*=|(?:setAttribute|toggleAttribute)\(\s*["']open["']/,
  "every archive disclosure must use the native closed default, including the first 8Dominos group and filtered rerenders"
);

assert.match(
  components,
  /\.media-visual\s+img\s*\{[^}]*object-fit:\s*contain/,
  "thumbnail frames must show the complete selected poster instead of cropping it"
);
assert.doesNotMatch(components, /\.media-card:hover\s+img\s*\{[^}]*transform:/, "hover feedback must not crop the poster inside its frame");
assert.match(
  components,
  /\.media-card\[data-aspect="portrait"\]\s+\.media-visual\s+img\s*\{[^}]*aspect-ratio:\s*9\s*\/\s*16/,
  "portrait thumbnails must use their manifest aspect ratio"
);
assert.match(
  components,
  /\.media-card\[data-aspect="square"\]\s+\.media-visual-fallback\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/,
  "a missing square poster must keep the same square footprint"
);
assert.match(
  components,
  /\.media-card\[data-aspect="square"\]\s+\.media-visual\s+img\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/,
  "square thumbnails must use their manifest aspect ratio"
);
assert.doesNotMatch(layout, /featured-grid[^}]*data-aspect="portrait"/, "selected portrait thumbnails must not be cropped into a featured-card ratio");
assert.doesNotMatch(responsive, /data-aspect="portrait"/, "phone layouts must preserve portrait media's 9:16 ratio");

assert.match(html, /<button id="theme-toggle"[^>]*aria-pressed="false"[^>]*>Light mode<\/button>/, "the header must expose a stable, accessible light-mode toggle");
assert.doesNotMatch(html.match(/<button id="theme-toggle"[^>]*>/)?.[0] || "", /\b(?:disabled|hidden|inert|aria-hidden)\b/, "the light-mode toggle must remain operable and exposed to assistive technology");
assert.match(main, /initializeTheme\(\)/, "theme state must initialize before the rest of the page interaction");
assert.match(tokens, /:root\s*\{[^}]*color-scheme:\s*dark/, "the existing dark UI must remain the explicit default");
assert.match(tokens, /:root\[data-theme="light"\]\s*\{[^}]*color-scheme:\s*light/, "light mode must be an explicit token override");

const darkTokens = {
  canvas: "#090c10",
  panel: "#11161d",
  panelRaised: "#18202a",
  line: "#2a3541",
  text: "#edf2f6",
  textMuted: "#98a6b5",
  accent: "#55c8f5",
  accentSoft: "#153746",
  focus: "#8bdcff",
  header: "rgb(9 12 16 / .92)",
  accentContrast: "#090c10"
};
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const [name, value] of Object.entries(darkTokens)) {
  const cssName = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  assert.match(tokens, new RegExp(`--${cssName}:\\s*${escapeRegExp(value)}`), `dark token --${cssName} must remain unchanged`);
}

const { initializeTheme } = await import("../src/components/theme-toggle.js");

function fixture(savedValue, { throwOnStorage = false } = {}) {
  const listeners = new Map();
  const attributes = new Map([["aria-pressed", "false"]]);
  const toggle = {
    addEventListener: (type, listener) => listeners.set(type, listener),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    click: () => listeners.get("click")?.()
  };
  const meta = { content: "#090c10" };
  const document = {
    documentElement: { dataset: {} },
    querySelector: (selector) => selector === "#theme-toggle" ? toggle : selector === 'meta[name="theme-color"]' ? meta : null
  };
  let stored = savedValue;
  const storage = {
    getItem: () => {
      if (throwOnStorage) throw new Error("blocked");
      return stored;
    },
    setItem: (_key, value) => {
      if (throwOnStorage) throw new Error("blocked");
      stored = value;
    }
  };
  return { attributes, document, meta, storage, toggle, stored: () => stored };
}

const firstVisit = fixture(null);
initializeTheme({ document: firstVisit.document, storage: firstVisit.storage });
assert.equal(firstVisit.document.documentElement.dataset.theme, "dark", "a first visit must retain the locked dark UI");
assert.equal(firstVisit.attributes.get("aria-pressed"), "false");
firstVisit.toggle.click();
assert.equal(firstVisit.document.documentElement.dataset.theme, "light");
assert.equal(firstVisit.attributes.get("aria-pressed"), "true");
assert.equal(firstVisit.stored(), "light", "the explicit user choice must persist");
assert.equal(firstVisit.meta.content, "#f4f7f9", "browser chrome must follow light mode");
firstVisit.toggle.click();
assert.equal(firstVisit.document.documentElement.dataset.theme, "dark");
assert.equal(firstVisit.stored(), "dark");

const savedLight = fixture("light");
initializeTheme({ document: savedLight.document, storage: savedLight.storage });
assert.equal(savedLight.document.documentElement.dataset.theme, "light", "an exact saved light choice must restore");

const invalid = fixture("sepia");
initializeTheme({ document: invalid.document, storage: invalid.storage });
assert.equal(invalid.document.documentElement.dataset.theme, "dark", "unknown stored values must fail closed to dark");

const blocked = fixture(null, { throwOnStorage: true });
assert.doesNotThrow(() => initializeTheme({ document: blocked.document, storage: blocked.storage }));
blocked.toggle.click();
assert.equal(blocked.document.documentElement.dataset.theme, "light", "blocked persistence must not block the current toggle interaction");

const blockedGetter = fixture(null);
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  get: () => { throw new Error("blocked getter"); }
});
try {
  assert.doesNotThrow(() => initializeTheme({ document: blockedGetter.document }), "denied access to the storage property must not abort page initialization");
  blockedGetter.toggle.click();
  assert.equal(blockedGetter.document.documentElement.dataset.theme, "light");
} finally {
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else delete globalThis.localStorage;
}

console.log("PASS issue 27 archive, aspect-ratio, and theme contracts");
