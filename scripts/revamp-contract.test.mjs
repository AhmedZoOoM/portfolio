import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const manifestPath = new URL("../js/portfolio-data.js", import.meta.url);
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(manifestPath, "utf8"), sandbox, { filename: "js/portfolio-data.js" });

const data = sandbox.window.PORTFOLIO_DATA;
const allMedia = data.projects.flatMap((project) => project.media);
const approvedFeaturedIds = [
  "16kl-TkbvU090UNE0v2GnmIBiq5-bbbEt",
  "1-aKQ0XYCg0QQs-HRzcwntWSWdNTRilVQ",
  "1XahedVA2AfhI9dL71OwIQHLwB541uw2P",
  "1QuwhZeMIujn7IA9mUAKesgK9XYGYl6Me",
  "1UeE0bPFDZCmEHz21MBE9fClbU7UpSm9q",
  "14QDMVIdDJO6jVTzt5PbcrFviXL2-J-r3"
];

assert.deepEqual(
  Array.from(data.featuredMediaIds),
  approvedFeaturedIds,
  "selected work must use the approved podcast-led sequence"
);
assert.ok(
  allMedia.some((item) => item.driveId === "1Cz1J0y9WeeBCiWTF-rMeTK_GbPfrz8SN"),
  "The Fisherman must remain in the complete archive"
);
assert.ok(
  allMedia.some((item) => item.driveId === "17AowvP6cMvmD0yhEehTEPM7CKsGh7s2_"),
  "episode 1 must remain in the complete archive"
);
assert.ok(
  data.profile.experience.includes("Credits represented in the CV include Karam El King, The Shock, commercial editing, a Ramadan 2017 war documentary, The Fisherman, and Melancholia (2018)."),
  "the verified CV credits must remain unchanged"
);
assert.deepEqual(
  Array.from(data.profile.skills),
  [
    "Final Cut Pro (expert)",
    "Adobe Premiere Pro (expert)",
    "Adobe After Effects (moderate)",
    "Adobe Photoshop (expert)",
    "Adobe Illustrator and InDesign (novice)",
    "Voice acting/manipulation, script writing/audio recording, stop motion, and analog-media digitization"
  ],
  "only the requested Autodesk tool group may be removed"
);
assert.equal(data.profile.email, "zomation@gmail.com", "the verified contact email must remain unchanged");
assert.equal(data.profile.phone, "+20 102 060 1600", "the verified contact phone must remain unchanged");
assert.deepEqual(
  Array.from(data.socials, ({ name, url }) => ({ name, url })),
  [
    { name: "YouTube", url: "https://www.youtube.com/@AhmedZoOoM" },
    { name: "Instagram", url: "https://www.instagram.com/ahmedzooom/" },
    { name: "Vimeo", url: "https://vimeo.com/ahmedzooom" },
    { name: "Behance", url: "https://www.behance.net/AhmedZoOoM" },
    { name: "X", url: "https://x.com/AhmedZoOoM" }
  ],
  "the ordered verified social profiles must remain unchanged"
);
assert.ok(existsSync(new URL("../package.json", import.meta.url)), "the portfolio must be buildable with Vite");
assert.ok(existsSync(new URL("../.github/workflows/deploy-pages.yml", import.meta.url)), "GitHub Pages must deploy the Vite build");

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
const dataAdapter = readFileSync(new URL("../src/data/portfolio-data.js", import.meta.url), "utf8");
const componentStyles = readFileSync(new URL("../src/styles/components.css", import.meta.url), "utf8");
const dialogRenderer = readFileSync(new URL("../src/components/media-dialog.js", import.meta.url), "utf8");
const liveVerifier = readFileSync(new URL("../scripts/verify-live-media.mjs", import.meta.url), "utf8");
const distVerifier = readFileSync(new URL("../scripts/verify-dist.mjs", import.meta.url), "utf8");
const socialCard = readFileSync(new URL("../public/og/portfolio-card.svg", import.meta.url), "utf8");
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");
const deployWorkflow = readFileSync(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8");
const layoutStyles = readFileSync(new URL("../src/styles/layout.css", import.meta.url), "utf8");
const responsiveStyles = readFileSync(new URL("../src/styles/responsive.css", import.meta.url), "utf8");
const portraitPath = new URL("../src/assets/ahmed-azzam-x-profile.jpg", import.meta.url);
const portraitExists = existsSync(portraitPath);
const portraitBytes = portraitExists ? readFileSync(portraitPath) : Buffer.alloc(0);
function jpegDimensions(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > bytes.length) return null;
    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    }
    offset += segmentLength;
  }
  return null;
}
const capture = (source, pattern, label) => {
  const match = source.match(pattern);
  assert.ok(match, label);
  return match[1];
};
const captureCssBlock = (source, startPattern, label) => {
  const start = source.search(startPattern);
  assert.notEqual(start, -1, label);
  const openingBrace = source.indexOf("{", start);
  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }
  assert.fail(`${label} must have balanced braces`);
};
const mobile900Styles = captureCssBlock(
  responsiveStyles,
  /@media\s*\(max-width:\s*900px\)/,
  "the 900px responsive block must exist"
);
const mobile620Styles = captureCssBlock(
  responsiveStyles,
  /@media\s*\(max-width:\s*620px\)/,
  "the 620px responsive block must exist"
);
assert.equal(
  captureCssBlock(
    '@media (max-width: 900px) { .other { display: block; } } @media (max-width: 620px) { .contact-grid { grid-template-areas: "copy" "portrait" "actions"; } }',
    /@media\s*\(max-width:\s*900px\)/,
    "bounded media-query fixture must parse"
  ).includes(".contact-grid"),
  false,
  "the 900px parser must not scan into a later media query"
);
assert.deepEqual(
  {
    metaDescription: capture(html, /<meta name="description" content="([^"]+)">/, "document description must exist"),
    ogTitle: capture(html, /<meta property="og:title" content="([^"]+)">/, "Open Graph title must exist"),
    ogDescription: capture(html, /<meta property="og:description" content="([^"]+)">/, "Open Graph description must exist"),
    twitterTitle: capture(html, /<meta name="twitter:title" content="([^"]+)">/, "X card title must exist"),
    twitterDescription: capture(html, /<meta name="twitter:description" content="([^"]+)">/, "X card description must exist"),
    documentTitle: capture(html, /<title>([^<]+)<\/title>/, "document title must exist"),
    jobTitle: capture(html, /"jobTitle": "([^"]+)"/, "structured-data role must exist"),
    heroTitle: capture(html, /<h1 id="hero-title">([^<]+)<\/h1>/, "hero title must exist"),
    heroCopy: capture(html, /<h1 id="hero-title">[^<]+<\/h1>\s*<p class="hero-copy">([^<]+)<\/p>/, "hero introduction must exist"),
    aboutOpening: capture(html, /<section id="about"[\s\S]*?<div>\s*<p>([^<]+)<\/p>/, "About introduction must exist"),
    contactTitle: capture(html, /<h2 id="contact-title">([^<]+)<\/h2>/, "contact heading must exist"),
    contactCopy: capture(html, /<h2 id="contact-title">[^<]+<\/h2>\s*<p class="hero-copy">([^<]+)<\/p>/, "contact introduction must exist"),
    contactEmail: capture(html, /<a class="button button-primary" href="mailto:zomation@gmail\.com">([^<]+)<\/a>/, "verified email action must exist"),
    contactPhone: capture(html, /<a class="button" href="tel:\+201020601600">([^<]+)<\/a>/, "verified phone action must exist"),
    socialCardTagline: capture(socialCard, /<text x="80" y="380"[^>]*>([^<]+)<\/text>/, "social-card tagline must exist"),
    socialCardRole: capture(socialCard, /<text x="80" y="450"[^>]*>([^<]+)<\/text>/, "social-card role must exist"),
    distPinsNewHero: distVerifier.includes("The story is in the edit."),
    distPinsOgDescription: distVerifier.includes('<meta property="og:description" content="The story is in the edit.">'),
    distPinsTwitterDescription: distVerifier.includes('<meta name="twitter:description" content="The story is in the edit.">'),
    distPinsOldHero: distVerifier.includes("Every frame earns its place.")
  },
  {
    metaDescription: "Ahmed Azzam aka ZoOoM is a Senior Video Editor shaping rhythm and emotion across commercials, television, podcasts, and visual stories.",
    ogTitle: "Ahmed Azzam — Senior Video Editor",
    ogDescription: "The story is in the edit.",
    twitterTitle: "Ahmed Azzam — Senior Video Editor",
    twitterDescription: "The story is in the edit.",
    documentTitle: "Ahmed Azzam — Senior Video Editor",
    jobTitle: "Senior Video Editor",
    heroTitle: "The story is in the edit.",
    heroCopy: "Ahmed Azzam aka ZoOoM — Senior Video Editor. I don’t just cut footage. I shape the rhythm, build the emotion, and make every frame count — across commercials, television, podcasts, and visual stories.",
    aboutOpening: "Ahmed Azzam is a Senior Video Editor and freelance graphics designer. This portfolio presents the supplied work archive directly, with each item linked to its original Drive source.",
    contactTitle: "Let’s make something worth watching.",
    contactCopy: "Have footage, a story, or an idea in mind? Send it my way. Let’s turn it into something people remember.",
    contactEmail: "zomation@gmail.com",
    contactPhone: "+20 102 060 1600",
    socialCardTagline: "The story is in the edit.",
    socialCardRole: "Senior Video Editor",
    distPinsNewHero: true,
    distPinsOgDescription: true,
    distPinsTwitterDescription: true,
    distPinsOldHero: false
  },
  "sitewide messaging and preserved contact values must match the approved contract"
);
assert.deepEqual(
  {
    assetExists: portraitExists,
    assetSha256: portraitExists ? createHash("sha256").update(portraitBytes).digest("hex") : null,
    assetDimensions: jpegDimensions(portraitBytes),
    localAccessibleMarkup: /<a class="contact-portrait" href="https:\/\/x\.com\/AhmedZoOoM" target="_blank" rel="noopener noreferrer" aria-label="Ahmed Azzam on X">\s*<img src="\.\/src\/assets\/ahmed-azzam-x-profile\.jpg" width="400" height="400" loading="lazy" decoding="async" alt="Portrait of Ahmed Azzam">\s*<\/a>/.test(html),
    avoidsRuntimeHotlink: !html.includes("pbs.twimg.com"),
    contactDomOrder: /class="contact-copy"[\s\S]*class="contact-portrait"[\s\S]*class="contact-actions"/.test(html),
    desktopGrid: /\.contact-grid\s*\{[^}]*grid-template-areas:\s*"copy portrait"\s*"actions portrait"/.test(layoutStyles),
    mobileGridAt900: /\.contact-grid\s*\{[^}]*grid-template-areas:\s*"copy"\s*"portrait"\s*"actions"/.test(mobile900Styles),
    distVerifiesPortrait: distVerifier.includes("ahmed-azzam-x-profile") && distVerifier.includes("da840662fcf0bc2cbc89605756aac30f50a2b9dfce8e25c6bf3366445fce2278"),
    liveVerifiesPortrait: liveVerifier.includes(".jpg") && liveVerifier.includes("da840662fcf0bc2cbc89605756aac30f50a2b9dfce8e25c6bf3366445fce2278")
  },
  {
    assetExists: true,
    assetSha256: "da840662fcf0bc2cbc89605756aac30f50a2b9dfce8e25c6bf3366445fce2278",
    assetDimensions: { width: 400, height: 400 },
    localAccessibleMarkup: true,
    avoidsRuntimeHotlink: true,
    contactDomOrder: true,
    desktopGrid: true,
    mobileGridAt900: true,
    distVerifiesPortrait: true,
    liveVerifiesPortrait: true
  },
  "portrait source, accessibility, responsive order, and deployment checks must match the approved contract"
);
assert.match(dataAdapter, /heroMediaId: sourceData\.heroMediaId/, "the generated current hero must power the hero player");
assert.doesNotMatch(dataAdapter, /heroMediaId: "17AowvP6cMvmD0yhEehTEPM7CKsGh7s2_"/, "episode 1 must no longer power the hero player");
assert.match(layoutStyles, /\.hero-grid\s*>\s*\*\s*\{[^}]*min-width:\s*0/, "hero columns must be allowed to shrink within phone viewports");
assert.match(mobile900Styles, /\.section\s*\{[^}]*scroll-margin-top:\s*8rem/, "tablet anchor targets must clear the wrapped sticky navigation");
assert.match(mobile620Styles, /\.section\s*\{[^}]*scroll-margin-top:\s*12rem/, "phone anchor targets must clear the wrapped sticky navigation");
assert.match(html, /aria-label="Verified social profiles"/, "social navigation must stay labeled");
assert.doesNotMatch(html, />YouTube<|>Instagram<|>Vimeo<|>Behance<|>X</, "social links must render as icons, not visible text");
assert.match(html, /<script type="module" src="\.\/src\/main\.js"><\/script>/, "the legacy Pages fallback must load the module beneath the repository path");
assert.doesNotMatch(html, /href="\/portfolio\/css\/style\.css"/, "the Vite artifact must not reference an unbuilt legacy stylesheet");
assert.match(main, /import "\.\/styles\/index\.css";/, "the Vite entrypoint must statically bundle its stylesheet");
assert.match(main, /window\.addEventListener\("load", alignHashAnchor/, "a hash selected before layout settles must be realigned after the load event");
assert.match(main, /target\.scrollIntoView\(\{ block: "start" \}\)/, "hash realignment must scroll the requested target into view");
assert.doesNotMatch(componentStyles, /content-visibility\s*:\s*auto/, "archive layout must remain measurable before an anchor below it is selected");
assert.match(dialogRenderer, /media-frame-\$\{item\.aspect\}/, "the media dialog must preserve each item's aspect ratio");
assert.match(dialogRenderer, /autoplay; fullscreen; picture-in-picture/, "the Drive embed must permit user-initiated playback");
assert.doesNotMatch(dialogRenderer, /createElement\("video"\)/, "the Pages viewer must not use a Drive download endpoint blocked by cross-origin resource policy");
assert.doesNotMatch(dialogRenderer, /Open in Google Drive/, "the dialog must not duplicate Drive's own open-in-Drive control");
assert.doesNotMatch(componentStyles, /media-player-actions/, "the dialog must not reserve vertical space for a duplicate Drive action strip");
assert.match(componentStyles, /#media-dialog-content\s+iframe\.media-frame-landscape,\s*#media-dialog-content\s+iframe\.media-frame-square\s*\{[^}]*height:\s*min\(70dvh,\s*600px\)/, "wide and square Drive players need a control-safe viewport height without affecting image previews");
assert.match(componentStyles, /#media-dialog-content\s+\.media-frame\s*\{[^}]*max-height:\s*calc\(100dvh\s*-\s*6rem\)/, "Drive controls must fit in phone landscape orientation");
assert.match(componentStyles, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*500px\)\s*\{[\s\S]*?\.dialog-bar\s+h2\s*\{[^}]*white-space:\s*nowrap/, "long media titles must not clip the player on short landscape screens");
assert.doesNotMatch(liveVerifier, /drive\.usercontent\.google\.com/, "the live verifier must validate the supported embedded player path");
assert.match(componentStyles, /\.media-frame-portrait/, "portrait media requires a viewport-bounded viewer treatment");
assert.match(componentStyles, /100dvh/, "the viewer must account for mobile browser viewport height");
assert.match(packageJson, /"verify:live"/, "the portfolio must expose a post-deploy media verification command");
assert.match(deployWorkflow, /npm run verify:live -- "\$\{\{ steps\.deployment\.outputs\.page_url \}\}"/, "GitHub Pages must verify the deployed media surface");

console.log("PASS approved revamp contract");
