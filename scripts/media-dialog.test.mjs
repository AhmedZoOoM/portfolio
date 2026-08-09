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
const video = findByTag(content, "VIDEO");
assert.ok(video, "Drive videos must open in the page-owned native video player");
assert.equal(video.src, "https://drive.usercontent.google.com/download?id=video-id&export=download&confirm=t");
assert.equal(video.controls, true);
assert.equal(video.playsInline, true);
assert.equal(video.poster, "https://example.test/poster.jpg");

video.dispatch("error");
assert.equal(
  findByText(content, "This browser could not start the embedded video. Use the Google Drive player instead.")?.textContent,
  "This browser could not start the embedded video. Use the Google Drive player instead.",
  "native playback errors must explain the recovery path"
);

const preview = findByText(content, "Use Google Drive player");
assert.ok(preview, "native playback must retain an explicit Google Drive fallback");
preview.dispatch("click");
const frame = findByTag(content, "IFRAME");
assert.ok(frame, "the fallback action must replace the native player with the Google Drive preview");
assert.equal(frame.src, "https://drive.google.com/file/d/video-id/preview");

console.log("PASS native Drive media dialog");
