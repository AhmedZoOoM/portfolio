# Ahmed Azzam portfolio

A dependency-free GitHub Pages portfolio for Ahmed Azzam (AhmedZoOoM).

## Content source of truth

- `data/drive-inventory.json` is the saved source scan.
- `js/portfolio-data.js` is the browser manifest and maps every scanned media Drive ID once.
- The media remains hosted in [the canonical Google Drive folder](https://drive.google.com/drive/folders/1M-fwHszneqa2h0xoZhImtVKoBZdmAMP9); the repository does not contain copied video files.

To add or remove media, rescan the Drive folder, update the inventory and the manifest together, then run:

```sh
node --check js/portfolio-data.js
node --check js/script.js
node scripts/verify-portfolio.mjs
```

The completion requirement is exact ID equality: Drive inventory = manifest = rendered archive. Do not omit alternate exports or grouped variants.

## Privacy and presentation

The site publishes only CV-derived professional information. It does not publish the raw CV or private personal details. Video caption availability is stated honestly per item; no accessibility conformance claim is made for videos without captions. Work is displayed for professional demonstration and project/client rights remain with their respective owners.
