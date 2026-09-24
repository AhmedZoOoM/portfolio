import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const main = readFileSync("src/main.js", "utf8");
const tokens = readFileSync("src/styles/tokens.css", "utf8");
const base = readFileSync("src/styles/base.css", "utf8");
const layout = readFileSync("src/styles/layout.css", "utf8");
const responsive = readFileSync("src/styles/responsive.css", "utf8");

// Screenshot comment 2: the hero leads with the real name, the real title, and the word Portfolio.
const hero = html.match(/<section id="top"[\s\S]*?<\/section>/)?.[0] || "";
assert.match(hero, /<p class="hero-name">Ahmed Azzam<\/p>/, "the hero must lead with the verified name");
assert.match(hero, /<span class="hero-role-title">Senior Video Editor<\/span>/, "the hero must state the verified title");
assert.match(hero, /<span class="hero-role-mark">Portfolio<\/span>/, "the word Portfolio must sit next to the title");
assert.ok(hero.indexOf("hero-name") < hero.indexOf('id="hero-title"'), "the identity block must precede the tagline");
assert.match(hero, /class="hero-monitor"[\s\S]*PROGRAM \/ 01[\s\S]*FEATURED EDIT/, "the featured program monitor must remain");
assert.match(hero, /Program monitor · selected edit/, "the program-monitor eyebrow must remain");
assert.match(layout, /\.hero-identity\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/, "the identity band must span the hero so no empty band sits under the navigation");
assert.match(layout, /\.hero-name\s*\{[^}]*font-size:\s*clamp\(/, "the name must scale fluidly");
assert.doesNotMatch(layout, /\.hero\s*\{[^}]*min-height:\s*min\(760px/, "the hero must not force a fixed-height empty band");
assert.match(layout, /\.hero-monitor img\s*\{[^}]*height:\s*auto/, "the HTML height attribute must not stretch the 16:9 monitor");

// Screenshot comment 1: bigger, higher-contrast, clearly highlighted navigation.
assert.match(tokens, /--nav-size:\s*1\.0625rem/, "navigation text must be larger than body text");
assert.match(layout, /\.nav-links a\s*\{[^}]*color:\s*var\(--text\)[^}]*font-size:\s*var\(--nav-size\)[^}]*font-weight:\s*650/, "navigation links must use full-strength text at a larger, heavier size");
assert.match(layout, /\.nav-links a\[aria-current="true"\]/, "the current section must be highlighted in the navigation");
assert.match(main, /initializeNavSpy\(\)/, "the navigation current-section indicator must initialize");

// High-resolution canvases: widen the container and scale the root size in %.
assert.match(tokens, /@media \(min-width: 2400px\)\s*\{\s*html\s*\{\s*font-size:\s*125%/, "2K+/QHD screens must scale the root size");
assert.match(tokens, /@media \(min-width: 3200px\)\s*\{\s*html\s*\{\s*font-size:\s*150%/, "4K-class screens must scale the root size");
assert.match(base, /body\s*\{[^}]*font:\s*1rem\//, "body text must use rem so it follows the high-resolution root scale");
assert.match(base, /scroll-padding-top:/, "anchored and focused content must clear the sticky header");
assert.match(base, /prefers-reduced-motion:\s*reduce/, "reduced-motion preferences must remain honored");
assert.match(responsive, /@media \(max-width: 380px\)/, "the smallest phones must keep all four navigation links in view");

// Contrast of the token pairs used by the new UI (WCAG 2.2 1.4.3 text / 1.4.11 non-text).
const hex = (value) => value.match(/[0-9a-f]{2}/gi).map((part) => parseInt(part, 16));
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [hi, lo] = [luminance(hex(a)), luminance(hex(b))].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const themes = {
  dark: tokens.match(/:root\s*\{([^}]*)\}/)[1],
  light: tokens.match(/:root\[data-theme="light"\]\s*\{([^}]*)\}/)[1]
};
const token = (theme, name) => {
  const value = themes[theme].match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1] || themes.dark.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  assert.ok(value, `${theme} --${name} must be a hex token`);
  return value;
};
for (const theme of Object.keys(themes)) {
  assert.ok(ratio(token(theme, "text"), token(theme, "panel")) >= 7, `${theme}: nav links on their panel must reach AAA contrast`);
  assert.ok(ratio(token(theme, "text-muted"), token(theme, "canvas")) >= 4.5, `${theme}: supporting copy must reach AA contrast`);
  assert.ok(ratio(token(theme, "accent"), token(theme, "accent-soft")) >= 4.5, `${theme}: the highlighted nav state must reach AA contrast`);
  assert.ok(ratio(token(theme, "accent"), token(theme, "canvas")) >= 4.5, `${theme}: the accent Portfolio label must reach AA contrast`);
  assert.ok(ratio(token(theme, "line-strong"), token(theme, "canvas")) >= 3, `${theme}: interactive borders must reach 3:1 non-text contrast`);
  assert.ok(ratio(token(theme, "accent-contrast"), token(theme, "focus")) >= 4.5, `${theme}: CTA hover text must stay readable`);
}

// Current-section indicator behavior.
const { initializeNavSpy } = await import("../src/components/nav-spy.js");
function element(id) {
  const attributes = new Map();
  const listeners = new Map();
  return {
    id,
    getAttribute: (name) => (name === "href" ? `#${id}` : attributes.get(name) ?? null),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    removeAttribute: (name) => attributes.delete(name),
    addEventListener: (type, listener) => listeners.set(type, listener),
    click: () => listeners.get("click")?.(),
    current: () => attributes.get("aria-current") ?? null
  };
}
const ids = ["selected-work", "archive", "about", "experience"];
const links = ids.map(element);
const sections = new Map(ids.map((id) => [id, { id }]));
const doc = { querySelectorAll: () => links, getElementById: (id) => sections.get(id) || null };
let observerCallback;
const observed = [];
class FakeObserver {
  constructor(callback, options) { observerCallback = callback; this.options = options; }
  observe(target) { observed.push(target.id); }
}
const spy = initializeNavSpy({ document: doc, IntersectionObserver: FakeObserver });
assert.deepEqual(observed, ids, "every navigation target section must be observed");
observerCallback([{ target: sections.get("archive"), isIntersecting: true, intersectionRatio: 0.4 }]);
assert.deepEqual(links.map((link) => link.current()), [null, "true", null, null], "the visible section must be marked current");
observerCallback([{ target: sections.get("archive"), isIntersecting: false }, { target: sections.get("about"), isIntersecting: true, intersectionRatio: 0.2 }]);
assert.deepEqual(links.map((link) => link.current()), [null, null, "true", null], "exactly one link must be current as the reader scrolls");
observerCallback([{ target: sections.get("about"), isIntersecting: false }]);
assert.deepEqual(links.map((link) => link.current()), [null, null, null, null], "no link is current in un-navigated sections such as the hero");
links[3].click();
assert.equal(links[3].current(), "true", "activating a link must mark it immediately");
assert.ok(spy.observer, "the observer must be retained");

const withoutObserver = ids.map(element);
assert.doesNotThrow(() => initializeNavSpy({ document: { querySelectorAll: () => withoutObserver, getElementById: (id) => sections.get(id) }, IntersectionObserver: undefined }), "browsers without IntersectionObserver must not break page initialization");
withoutObserver[0].click();
assert.equal(withoutObserver[0].current(), "true", "click marking must work without IntersectionObserver");
assert.equal(initializeNavSpy({ document: { querySelectorAll: () => [], getElementById: () => null } }), null, "a page without navigation must be a no-op");

console.log("PASS issue 39 hero identity, navigation, high-resolution, and contrast contracts");
