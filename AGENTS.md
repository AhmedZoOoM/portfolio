# Portfolio contribution guidance

Preserve all verified archive media and public professional facts. Use `js/portfolio-data.js` as the canonical media manifest, with `src/data/portfolio-data.js` as a thin Vite adapter. Keep the published GitHub Pages path at `/portfolio/` unless an explicit Pages-domain migration is requested.

Before a UI or content change, inspect the rendered route and relevant component/style modules. After a change, run the smallest relevant checks; for content or media changes, run `npm run check` and `npm run verify`. Do not add copied media assets, autoplay, invented credits, CV-private details, visible text social labels, or unverified claims.

Keep changes sequential, focused, accessible, responsive, and performance-conscious. The full archive must remain discoverable and openable.
