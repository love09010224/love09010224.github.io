# Scroll reveal draft

- Before this draft: `47ee941` (`main`, `checkpoint/pre-scroll-reveal`).
- Draft branch: `draft/scroll-reveal`. Nothing has been pushed or deployed.
- Motion: content rises 20px over 560ms on desktop, 16px over 440ms on mobile.
- Cards on the same row are staggered by 60ms, capped at 120ms.
- Each block runs once per page visit. The header/navigation stays still.
- Home, Achievements, Experience, Links, the footer, and 404 use the same script.
- Reduced-motion settings, keyboard focus, fragment links, printing, and history
  restoration bypass or cancel the effect. Content stays visible without JS.

Implementation and tuning: `src/scripts/scroll-reveal.ts`.

Validation: `npm run check`, `npm run build`, and all 52 desktop/mobile
Playwright tests passed. Test reports are excluded from TypeScript input so
generated trace-viewer bundles are not analyzed as application source.

Once your working tree is clean, `git switch main` returns to the checkpoint;
`git switch draft/scroll-reveal` returns to this draft.
