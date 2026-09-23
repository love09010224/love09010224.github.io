# Scroll reveal

- Before this change: `47ee941` (`checkpoint/pre-scroll-reveal`).
- Development branch: `draft/scroll-reveal`; release branch: `main`.
- Motion: content rises 20px over 560ms on desktop, 16px over 440ms on mobile.
- Cards on the same row are staggered by 60ms, capped at 120ms.
- Only initially offscreen blocks animate, once per page visit. The initial
  viewport appears immediately, without an entrance effect on route changes or
  reloads. The header/navigation stays still.
- Home, Achievements, Experience, Links, the footer, and 404 use the same script.
- Reduced-motion settings, keyboard focus, fragment links, printing, and history
  restoration bypass or cancel the effect. Content stays visible without JS.

Implementation and tuning: `src/scripts/scroll-reveal.ts`.

Local validation: type checking, a production build, and all 54 desktop/mobile
Playwright tests passed. Test reports are excluded from TypeScript input so
generated trace-viewer bundles are not analyzed as application source.

Once your working tree is clean, `git switch checkpoint/pre-scroll-reveal`
opens the pre-animation checkpoint; `git switch main` returns to the release.
