import assert from "node:assert/strict";
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
assert.ok(source, "the embedded player must retain an explicit external fallback");
assert.equal(source.href, "https://drive.google.com/file/d/video-id/view");

console.log("PASS supported Drive media dialog");
