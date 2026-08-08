# Replace all placeholder portfolio content with Ahmed Azzam's complete real-media archive

## Objective

Replace every placeholder, invented claim, dead link, and fake portfolio item in this GitHub Pages repository with verified information about **Ahmed Azzam** and every publishable media item in the canonical Google Drive folder:

- Source folder: <https://drive.google.com/drive/folders/1M-fwHszneqa2h0xoZhImtVKoBZdmAMP9>
- Repository: <https://github.com/AhmedZoOoM/portfolio>
- Public identity: **Ahmed Azzam**, with **AhmedZoOoM** used only as the handle/secondary identity

The implementation must be completed sequentially by one agent in one session. Do not split the implementation across agents, stop after a partial category, or declare success from a sample. The archive is the acceptance boundary.

## Non-negotiable 100% completion rule

Let:

- `D` = the set of all image and video Drive file IDs found by a fresh recursive scan of the canonical folder at implementation time;
- `M` = the set of unique Drive file IDs in the site's content manifest;
- `R` = the set of unique Drive file IDs rendered as discoverable, openable archive items in the built site.

Completion is exactly:

```text
100% = D == M == R
       AND every item opens its intended media
       AND every current placeholder/fake value has been removed
       AND the production GitHub Pages URL passes the same checks
```

No percentage below 100% is acceptable. A grouped duplicate, alternate export, reel, still image, or making-of clip still counts as its own item and must retain its own Drive ID. Grouping may improve presentation but must never reduce coverage.

If the Drive folder changes during implementation, rescan it, update the manifest and denominator, and rerun all checks. If any file is inaccessible, ambiguous, or not publishable, completion is blocked; list the exact Drive ID and reason instead of silently omitting it.

## Confirmed discovery snapshot

The planning scan on **2026-08-08** found **82 files / approximately 24.04 GiB**:

- **81 media files**: 77 MP4 videos and 4 PNG images
- **1 source document**: Ahmed Azzam's CV PDF, used for extraction but not published or linked

| Source location | Videos | Images | Media total |
|---|---:|---:|---:|
| Drive root | 13 | 0 | 13 |
| Automatest | 4 | 4 | 8 |
| 8Dominos | 9 | 0 | 9 |
| 8Dominos_Reels | 19 | 0 | 19 |
| Nahark Eswed Reels | 14 | 0 | 14 |
| ADIB EGYPT REELS | 6 | 0 | 6 |
| Enty Asl El Hekaya | 4 | 0 | 4 |
| The Shock | 5 | 0 | 5 |
| Instagram Reels | 3 | 0 | 3 |
| **Total** | **77** | **4** | **81** |

This table is a baseline, not a substitute for the mandatory fresh recursive scan at implementation start and immediately before completion.

### Creation families identified

The archive contains long-form edits, branded/commercial work, television/program segments, showreels, making-of and behind-the-scenes edits, social/vertical reels, and still-image work. Known work families include:

- The Fisherman
- The Shock / برنامج الصدمة
- Enty Asl El Hekaya
- ADIB Egypt reels and behind-the-scenes material
- 8Dominos campaign and reels
- Nahark Eswed reels
- Automatest videos and still images
- CIB Party
- Yasmine Atef showreel
- Youssef Baroud DOP showreel
- Feras Zayn producer showreel
- Al Plateau pieces
- Almarai making-of
- Halwani Bros
- MORO
- EVA
- Instagram reels

Preserve original filenames as provenance even when the UI uses a cleaned display title. Preserve Arabic text and render it with `dir="rtl"`; render English titles with `dir="ltr"`.

## Approved content decisions

### CV extraction and privacy

Publish these verified professional facts:

- Full name: Ahmed Mohamed Ali Azzam
- Professional display name: Ahmed Azzam
- Email: `zomation@gmail.com`
- Phone: `+20 102 060 1600`
- Education: Foreign Languages & Translation, English major, Misr University for Science and Technology; GPA 2.7 (B+), Fall 2012/2013
- Training: Video Editing, 2K Post Production, 2008
- Experience: Video Editor at Concave Post House, 2013–2016
- Credits/experience represented in the CV: Karam El King, The Shock, commercial editing, a Ramadan 2017 war documentary, The Fisherman, and Melancholia (2018)
- Freelance graphics design since 2006
- Verified software/creative skills at their stated levels: Final Cut Pro, Adobe Premiere Pro, Adobe After Effects, Adobe Photoshop, Autodesk Maya, Mudbox, MotionBuilder, Softimage, Adobe Illustrator, and Adobe InDesign; voice acting/manipulation, script writing/audio recording, stop motion, and analog-media digitization

Do **not** publish Ahmed's birth date, street/home address, marital status, military status, or the raw CV file. Do not infer job titles, awards, client relationships, dates, or skill levels beyond the CV and media evidence.

### Verified social profiles

Use only links verified during research:

- YouTube: <https://www.youtube.com/@AhmedZoOoM> (channel ID `UCaw7jUYxteMhAQPDEPRIm5w`)
- Instagram: <https://www.instagram.com/ahmedzooom/>
- Vimeo: <https://vimeo.com/ahmedzooom>
- Behance: <https://www.behance.net/AhmedZoOoM>
- X: <https://x.com/AhmedZoOoM>

Exclude unverified LinkedIn, Facebook, and TikTok URLs. Do not preserve the site's current generic/root social links.

### Media hosting decision

Use a **Drive-first hybrid** suitable for a static GitHub Pages site:

- Video preview/embed: `https://drive.google.com/file/d/{DRIVE_ID}/preview`
- Original/open-in-Drive link: `https://drive.google.com/file/d/{DRIVE_ID}/view`
- Poster/thumbnail: `https://drive.google.com/thumbnail?id={DRIVE_ID}&sz=w1200`
- Still images: use the Drive thumbnail endpoint for display and the original Drive view URL for the full source
- YouTube or Vimeo: use an external provider embed only when the exact creation is unambiguously matched; keep its Drive ID and Drive source link in the manifest
- Existing YouTube uploads that cannot be matched exactly to a Drive item remain accessible through the verified channel link but are not added to the 81-item Drive completion denominator

Do not commit the 24 GiB media archive, use Git LFS for Pages assets, or duplicate full-size videos into the repository. GitHub Pages' repository/file limits make remote embedding the appropriate implementation.

All Drive media must be publicly viewable without authentication. Validate this in a signed-out/anonymous context. A `200` response alone is insufficient if the player shows a permission request.

### Rights and captions

- Include a short portfolio disclaimer that work is shown for professional demonstration and that project/client rights remain with their respective owners.
- A disclaimer does not create usage rights. If a file is not authorized for public display, record it as a blocker rather than hiding it while claiming 100%.
- Use existing captions when available.
- Mark unavailable caption state truthfully. Do not generate or claim captions that do not exist.
- Do not claim full WCAG 2.1 AA conformance for spoken media while caption coverage remains incomplete.

## Minimal implementation architecture

Keep the static site dependency-free. Use the browser platform and the Node.js standard library already available for verification.

### Files

- Add `js/portfolio-data.js`: the single canonical manifest for profile, verified socials, projects, and all Drive media
- Add `scripts/verify-portfolio.mjs`: one executable coverage/content gate
- Replace placeholder markup in `index.html` with semantic containers, real profile copy, contact links, and one native `<dialog>` media viewer
- Replace the current demo styling in `css/style.css` with the approved portfolio system
- Replace dead/demo effects in `js/script.js` with manifest rendering, filtering, and dialog behavior
- Update `README.md` with content-maintenance and verification instructions
- Keep this plan as `PORTFOLIO_REAL_CONTENT_PLAN.md`

Do not add a framework, package manager, build system, CMS, database, custom player, carousel library, icon library, or runtime API. Add one only if a verified browser limitation makes the native solution impossible.

### Manifest contract

Expose one static global so GitHub Pages can load it without bundling:

```js
window.PORTFOLIO_DATA = {
  baseline: {
    scannedAt: "ISO timestamp",
    sourceFolderUrl: "canonical Drive URL",
    expectedMediaCount: 81,
    expectedVideoCount: 77,
    expectedImageCount: 4,
    folderCounts: {}
  },
  profile: {},
  socials: [],
  featuredMediaIds: [],
  projects: [
    {
      id: "stable-project-slug",
      title: "Project title",
      category: "commercial | television | showreel | social | making-of | stills",
      summary: "Evidence-based description",
      media: []
    }
  ]
};
```

Every media record must contain:

```js
{
  driveId: "unique canonical Drive file ID",
  sourcePath: "folder/original filename",
  originalTitle: "verbatim filename without destructive normalization",
  displayTitle: "clean human-facing title",
  kind: "video | image",
  aspect: "landscape | portrait | square | unknown",
  language: "ar | en | mixed | unknown",
  dir: "rtl | ltr",
  variantGroup: "stable grouping key or null",
  provider: "drive | youtube | vimeo",
  providerId: "external ID or null",
  posterUrl: "validated poster URL",
  originalUrl: "Drive view URL",
  captionState: "available | unavailable | not-applicable | unknown",
  ariaLabel: "specific accessible label",
  credits: "only verified credits",
  rightsNote: "short ownership/display note"
}
```

No item may exist only in HTML. No media record may lack a source Drive ID. Use stable Drive IDs as the reconciliation key, never filenames alone.

### DOM contract

The renderer must produce:

- `#portfolio-featured` for the curated six-item entry point
- `#portfolio-archive` for the complete archive
- `[data-media-id]` on every media card/open control
- `[data-category]` on filterable project/media elements
- `[data-variant-group]` where alternate exports belong together
- `#media-dialog` and `#media-dialog-content` for the native viewer
- A live result count that reports filtered and total media counts

The six initial featured items are:

1. `The Fisherman_Final.mp4`
2. `برنامج الصدمة - عماله الاطفال`
3. `CIB PARTY.mp4`
4. `Enty episode 1`
5. `Comparison Trap.mp4`
6. The first ADIB Egypt reel in source order

Each featured item also remains in the complete archive and counts once by Drive ID.

## Design direction: editor's light table

Design for clients and producers who need to evaluate range quickly, while letting peers inspect the complete archive.

### Visual system

- Monitor ink: `#111318`
- Slate: `#1B1F27`
- Projection white: `#F4F2EC`
- Metadata gray: `#A8AFBA`
- Edit amber: `#E7B454`
- Keyboard focus blue: `#72B7FF`
- Typography: Archivo when reliably available, with a system sans-serif fallback; metadata may use `ui-monospace`
- Use a restrained cinematic hero, strong typographic hierarchy, thin timeline/contact-sheet rules, and media-first cards
- Avoid generic gradients, fake counters, stock testimonials, ornamental timelines, autoplay backgrounds, and animation that competes with the work

### Page hierarchy

1. Compact header with Work, About, Experience, Contact, and verified social links
2. Hero: Ahmed Azzam, concise evidence-based positioning, primary “View selected work” and secondary “Browse all work” actions
3. Selected work: asymmetric six-item grid with varied landscape/portrait treatment
4. Full archive: project-grouped, filterable media grid with an always-visible item count
5. About and experience: concise CV-derived facts and skills, no inflated prose
6. Contact: real email, phone, and verified social profiles
7. Rights/caption disclaimer and maintenance timestamp

### Interaction and accessibility requirements

- Never autoplay video or audio
- Create a Drive/video iframe only after the user opens an item; destroy it when the dialog closes
- Use native `<button>`, `<a>`, `<dialog>`, headings, landmarks, and form controls
- Provide visible keyboard focus using `#72B7FF`
- Ensure controls are at least 44 by 44 CSS pixels
- Keep all filtering and dialog actions keyboard-operable
- Escape closes the dialog; focus returns to the launching item
- Give every iframe a specific `title`; every image gets useful `alt` text
- Preserve Arabic titles and directionality
- Respect `prefers-reduced-motion`
- Maintain readable contrast and avoid conveying categories/state through color alone
- With JavaScript unavailable, the page must still expose Ahmed's identity/contact and a direct link to the canonical Drive folder; progressive enhancement supplies the complete interactive archive

### Performance requirements

- Do not insert 77 iframes during initial load
- Render lightweight cards/posters first and instantiate only the active viewer
- Use `loading="lazy"`, explicit aspect ratios, and fixed media dimensions to reduce layout shift
- Keep JavaScript deferred and dependency-free
- Use thumbnails sized for their rendered breakpoint rather than original media files
- Avoid speculative preloads for videos

## Sequential implementation procedure

The implementing agent must perform these phases in order and record the named evidence before advancing.

### Phase 0 — establish the immutable working baseline

- [ ] Confirm a clean branch based on the latest default branch and preserve unrelated user work
- [ ] Record the current commit SHA
- [ ] Recursively enumerate the Drive folder, including every nested folder
- [ ] Record for every source file: Drive ID, parent path, filename, MIME type, size, modified time, and public-view status
- [ ] Separate the CV PDF from the media denominator
- [ ] Recalculate `D`, video/image totals, and folder counts; update this plan's snapshot if the source changed
- [ ] Inventory every current placeholder/fake value in `index.html`, CSS, JavaScript, and README

**Gate:** a machine-readable source inventory exists, all counts reconcile, and each inaccessible item is identified. Do not begin UI work from the old 81-item assumption if the fresh scan differs.

### Phase 1 — create the failing completion gate first

- [ ] Add `scripts/verify-portfolio.mjs` using only Node.js standard-library modules
- [ ] Make it fail clearly while the manifest is absent/incomplete
- [ ] Run the failing check and save the failure as RED evidence

The verifier must fail on:

- expected count not matching the fresh Drive inventory
- a Drive ID missing from the manifest
- a duplicate Drive ID
- an unknown extra Drive ID
- video/image/folder counts that do not reconcile
- a media record missing a required field
- an invalid Drive/provider URL or invalid `dir`/kind/caption-state enum
- a manifest media ID not represented by the renderer contract
- a current placeholder phrase, fake email, generic root social URL, or unsupported skill claim
- forbidden CV fields or the raw CV URL being exposed
- missing required semantic containers or script loading order

Use deterministic, actionable failure messages containing the relevant Drive ID/path.

**Gate:** the verifier fails for the expected missing-manifest/content reasons, not because the script crashes.

### Phase 2 — build and reconcile the canonical content manifest

- [ ] Add the verified profile and privacy-filtered CV facts
- [ ] Add only the five verified social profiles
- [ ] Map every file in `D` to exactly one media record
- [ ] Preserve the original filename/path and add a clean display title separately
- [ ] Classify every record by project, category, kind, aspect, language, direction, and caption state
- [ ] Group alternate versions with `variantGroup` without deleting individual records
- [ ] Verify exact YouTube/Vimeo matches; otherwise keep Drive as provider
- [ ] Select the six featured IDs from the actual mapped records
- [ ] Run `node --check js/portfolio-data.js`
- [ ] Run the verifier and resolve every manifest error

**Gate:** manifest IDs equal the fresh Drive inventory IDs, totals reconcile, and no UI implementation has to invent content.

### Phase 3 — replace the placeholder document shell

- [ ] Remove every fake project card, generic bio sentence, fake statistic, demo contact value, unsupported tool claim, and dead social link
- [ ] Add semantic header/navigation, hero, selected-work container, archive container, about/experience, contact, disclaimer, and footer
- [ ] Add a native media dialog with an accessible label and close control
- [ ] Load `js/portfolio-data.js` before the deferred renderer
- [ ] Add canonical description/social metadata based only on verified facts
- [ ] Keep a no-JavaScript fallback with contact and Drive-folder access

**Gate:** text search finds none of the inventoried placeholder values, and the document remains usable without the renderer.

### Phase 4 — render all media from data

- [ ] Render the featured section by ID from the same canonical records used by the archive
- [ ] Render all project groups and every media record into `#portfolio-archive`
- [ ] Add All, Commercial, Television, Showreel, Social/Reels, Making-of, and Stills filters only where records exist
- [ ] Update the visible count as `shown / total`
- [ ] Keep every variant individually openable inside its project grouping
- [ ] Open images or a single lazy-created provider iframe in the dialog
- [ ] Provide a direct “Open original in Drive” link for every item
- [ ] Tear down viewer content on close and restore focus
- [ ] Ensure no title/description is inserted as unsafe HTML
- [ ] Run `node --check js/script.js`

**Gate:** the DOM contains exactly one discoverable `[data-media-id]` archive item for every ID in `D`, and filters never alter the total inventory.

### Phase 5 — apply the design system and responsive behavior

- [ ] Implement the approved light-table colors and type hierarchy as CSS custom properties
- [ ] Create the asymmetric featured grid without hard-coding content into CSS/HTML
- [ ] Use aspect-aware archive cards for landscape, portrait, square, and unknown sources
- [ ] Support narrow mobile, tablet, laptop, and wide layouts without horizontal overflow
- [ ] Style hover, active, focus-visible, loading, unavailable, empty-filter, and dialog states
- [ ] Respect reduced motion and keep transitions subtle
- [ ] Verify focus visibility, 44px targets, contrast, heading order, landmarks, labels, and directionality

**Gate:** functional responsive and keyboard checks pass. Pixel-by-pixel or before/after visual comparison is explicitly out of scope.

### Phase 6 — prove content and media completeness

- [ ] Rerun a fresh recursive Drive scan and compare it to the saved source inventory
- [ ] Run `node scripts/verify-portfolio.mjs`
- [ ] Run `node --check js/portfolio-data.js` and `node --check js/script.js`
- [ ] Scan tracked files for placeholders, private CV fields, unverified socials, and unsupported claims
- [ ] Validate every poster, Drive view URL, and preview/provider URL without authentication
- [ ] Open at least one landscape video, portrait reel, still image, Arabic-titled item, and grouped variant through the real UI
- [ ] Exercise every filter, keyboard dialog flow, and no-results state
- [ ] Confirm initial page load contains zero eager video iframes
- [ ] Confirm `D == M == R` and report the final numerator/denominator (for example, `81/81` only if the source remains unchanged)

**Gate:** all automated checks pass and every source ID is both represented and reachable. A sampled playback check supplements, but never replaces, the all-ID link/coverage audit.

### Phase 7 — document, publish, and verify production

- [ ] Update README with the architecture, source-of-truth rule, add/remove-media workflow, privacy rules, and exact verification command
- [ ] Review the diff for secrets, generated binaries, raw CV data, and accidental full-size media
- [ ] Commit coherent checkpoints and push the implementation branch
- [ ] Open a pull request linked with `Closes #<this issue number>`
- [ ] Run/observe repository checks and resolve failures
- [ ] Merge only after all gates pass
- [ ] Wait for GitHub Pages deployment to complete
- [ ] Fetch the production URL and repeat the placeholder scan, manifest/count verification, all-link audit, and representative interaction checks against production
- [ ] Post final evidence on this issue and close it only through the merged pull request

**Gate:** the production GitHub Pages site, not only the local branch, satisfies the 100% rule.

## Required verifier output

A passing run must print a concise reconciliation summary similar to:

```text
PASS source inventory: 81 media IDs (77 video, 4 image)
PASS manifest coverage: 81/81 unique Drive IDs
PASS rendered archive contract: 81/81 unique Drive IDs
PASS privacy and placeholder scan
PASS URL and provider validation
PASS portfolio completion: 100%
```

If the fresh source count changes, the output must use that count; do not retain `81` merely to satisfy a stale assertion.

## Final acceptance checklist

- [ ] Fresh recursive Drive inventory is attached or summarized with timestamp and exact count
- [ ] Every current Drive image/video ID appears exactly once in the manifest
- [ ] Every manifest ID appears exactly once as a discoverable archive item
- [ ] Every archive item opens valid media and has a direct Drive source link
- [ ] All duplicate/alternate exports remain available and are grouped without being dropped
- [ ] Selected work contains six valid IDs and introduces no duplicate inventory records
- [ ] Profile, experience, skills, email, and phone are CV-derived and accurate
- [ ] Birth date, home address, marital status, military status, and raw CV are absent
- [ ] YouTube, Instagram, Vimeo, Behance, and X links resolve to Ahmed Azzam/AhmedZoOoM
- [ ] No unverified social link remains
- [ ] No `Project Title`, lorem ipsum, fake metric, `hello@example.com`, unsupported DaVinci/Avid claim, or generic social root URL remains
- [ ] No media autoplays and no video iframe is loaded before user action
- [ ] Keyboard, focus return, reduced motion, directionality, semantics, and basic contrast checks pass
- [ ] Caption limitations and rights ownership are stated honestly
- [ ] Node syntax checks and `scripts/verify-portfolio.mjs` pass
- [ ] README explains repeatable content maintenance
- [ ] Merged production GitHub Pages site passes the same 100% reconciliation

## Implementation report required before closure

The implementing agent must leave one final issue comment containing:

- source scan timestamp and final file totals
- exact `D`, `M`, and `R` counts
- folders/projects represented
- inaccessible or rights-blocked items (must be zero for completion)
- exact commands/checks run and their outcomes
- pull request and merge commit links
- production GitHub Pages URL and deployment verification result
- known caption limitations without claiming unsupported compliance

Do not close this issue based on screenshots, visual comparison, a featured subset, or local-only success. Close only when the deployed archive is demonstrably complete.
