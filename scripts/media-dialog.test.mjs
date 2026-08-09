import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMediaDialog } from "../src/components/media-dialog.js";

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
    this.classList = {
      values: new Set(),
      add: (value) => this.classList.values.add(value),
      contains: (value) => this.classList.values.has(value)
    };
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  dispatch(type) {
    this.listeners.get(type)?.({ currentTarget: this });
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  replaceChildren(...nodes) {
    this.children = nodes;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
    this.dispatch("close");
  }

  focus() {
    this.focused = true;
  }
}

const dialog = new FakeElement("dialog");
const content = new FakeElement("div");
const title = new FakeElement("h2");
const close = new FakeElement("button");
const nodes = new Map([
  ["#media-dialog", dialog],
  ["#media-dialog-content", content],
  ["#media-dialog-title", title],
  ["#media-dialog-close", close]
]);

globalThis.document = {
  createElement: (tagName) => new FakeElement(tagName),
  querySelector: (selector) => nodes.get(selector)
};

const openMedia = createMediaDialog();
const opener = new FakeElement("button");
openMedia({
  kind: "video",
  aspect: "landscape",
  driveId: "video-id",
  displayTitle: "Wide video",
  posterUrl: "https://example.test/poster.jpg",
  originalUrl: "https://drive.google.com/file/d/video-id/view"
}, opener);

const findByTag = (node, tagName) => node.tagName === tagName ? node : node.children.map((child) => findByTag(child, tagName)).find(Boolean);
const findByText = (node, value) => node.textContent === value ? node : node.children.map((child) => findByText(child, value)).find(Boolean);
const frame = findByTag(content, "IFRAME");
assert.ok(frame, "Drive videos must open in the supported Google Drive preview player");
assert.equal(frame.src, "https://drive.google.com/file/d/video-id/preview");
assert.equal(frame.allow, "autoplay; fullscreen; picture-in-picture; encrypted-media");
assert.equal(frame.allowFullscreen, true);
const source = findByText(content, "Open in Google Drive");
assert.equal(source, undefined, "the dialog must not duplicate Drive's own open-in-Drive control");

for (const aspect of ["portrait", "landscape", "square"]) {
  openMedia({
    kind: "video",
    aspect,
    driveId: `${aspect}-video-id`,
    displayTitle: `${aspect} video`,
    posterUrl: "https://example.test/poster.jpg",
    originalUrl: `https://drive.google.com/file/d/${aspect}-video-id/view`
  }, opener);
  const aspectFrame = findByTag(content, "IFRAME");
  assert.equal(aspectFrame.className, `media-frame media-frame-${aspect}`, `${aspect} videos must use the matching responsive player treatment`);
  assert.equal(aspectFrame.src, `https://drive.google.com/file/d/${aspect}-video-id/preview`, `${aspect} videos must keep the supported Drive preview source`);
}

const componentStyles = readFileSync(new URL("../src/styles/components.css", import.meta.url), "utf8");
assert.match(
  componentStyles,
  /#media-dialog-content\s+iframe\.media-frame-landscape,\s*#media-dialog-content\s+iframe\.media-frame-square\s*\{[^}]*height:\s*min\(70dvh,\s*600px\)/,
  "only wide and square Drive embeds need a control-safe viewport height"
);
assert.match(
  componentStyles,
  /#media-dialog-content\s+\.media-frame\s*\{[^}]*max-height:\s*calc\(100dvh\s*-\s*6rem\)/,
  "the dialog must retain enough height for Drive controls in phone landscape orientation"
);
assert.match(
  componentStyles,
  /\.media-frame-portrait\s*\{[^}]*height:\s*min\(70dvh,\s*820px\)/,
  "portrait Drive embeds must remain viewport-bounded"
);
assert.match(
  componentStyles,
  /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*500px\)\s*\{[\s\S]*?\.dialog-bar\s+h2\s*\{[^}]*white-space:\s*nowrap/,
  "long titles must not take control space from Drive players on short landscape screens"
);

console.log("PASS supported Drive media dialog");
