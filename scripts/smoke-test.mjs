import { readFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
if (html.includes("js/portfolio-data.js") || html.includes("js/script.js")) {
  throw new Error("legacy static scripts must not be referenced by the built page");
}
if (!html.includes('type="module"')) throw new Error("built page must load the Vite module entrypoint");

console.log("PASS built site smoke contract");
