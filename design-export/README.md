# Design export — reference only

Generated screens from **claude.ai/design** (exported June 2026), kept as the visual
source-of-truth for implementing Process in React Native.

## Format
- `*.dc.html` — claude.ai/design "design component" files: plain HTML + inline styles + a small
  JS logic class, driven by `support.js` (the runtime). **This is web, not React Native** —
  translate each screen into RN (StyleSheet + Reanimated/Skia). Do **not** import these directly.
  Open any `.dc.html` in a browser to preview it.
- `android-frame.jsx` — the device-frame wrapper used by the previews.
- `screenshots/` — a few rendered state captures. Note: some PNGs show icons as literal text
  (e.g. `water_drop`) because the Material Symbols font hadn't loaded at capture time — a
  screenshot artifact, not a design issue.

## Build note — navigation (important)
These screens predate the Meals-tab decision. Their core screens use a **4-tab** bottom nav
(Today / Streaks / Weight / Settings). **Build to the current spec instead:**
**5 tabs (Today / Meals / Streaks / Weight / Settings) + a center camera FAB**, and add the
"Today's nutrition" card to Home. Authoritative specs: `docs/design-prompts.md`, `docs/backlog.md`.

Everything else (colors, type, spacing, components, animations) matches the Fresh Sage system and
is safe to use as exact reference.
