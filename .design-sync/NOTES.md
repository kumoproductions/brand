# design-sync notes — @kumoproductions/branding

Repo-specific facts a future sync needs. Config: `.design-sync/config.json`.

- **No dist, no build**: components are plain ESM JSX in `public/components/<group>/*.jsx` (no TS, no cross-imports, only `import React from 'react'`). The converter runs in synth-entry mode. `--entry ./public/components/index.js` is deliberately a NONEXISTENT path: the entry walk-up still finds the repo's package.json (repo root = the package) and the soft miss triggers synthesis from `srcDir`.
- **react is not a repo dependency** (demo cards load React 18.3.1 from CDN). Converter deps live in `.ds-sync/node_modules` (esbuild, ts-morph, @types/react, react@18.3.1, react-dom@18.3.1, playwright@1.60.0) and `--node-modules .ds-sync/node_modules` points there.
- **`tokensPkg: "../.."`** is a deliberate hack: copyTokens only reads tokens from a "package" resolved against --node-modules; `../..` walks from `.ds-sync/node_modules` back to the repo root, which IS the package. `tokensGlob: public/tokens/*.css` then matches colors/typography/spacing.
- **`.design-sync/fonts.css`** mirrors `public/fonts.css` with RELATIVE urls (`../public/fonts/*.woff2`) because the site file uses site-absolute `/fonts/` urls the converter can't resolve. Keep in sync with public/fonts.css when fonts change.
- **`cssEntry: .design-sync/base.css`**: the DS has no component CSS (all inline styles + token vars); base.css supplies body defaults and keeps `_ds_bundle.css` from being an @import-only stub ([CSS_PLACEHOLDER]).
- **`brand-guidelines.md`** (repo root, gitignored) is a copy of the built site's English guideline text. Regenerate before a re-sync build: `pnpm build && cp dist/en/llms-full.txt brand-guidelines.md`.
- **playwright@1.60.0** matches the machine's cached chromium-1223 (`%LOCALAPPDATA%/ms-playwright`). A different machine may need a different playwright version — check the cache dir name against playwright's browsers.json.
- **`dtsPropsFor` covers ALL 16 components** — the JSX has no types, so without it every `<Name>Props` degrades to an index signature. When a component's props change, update its entry. The build's `[DTS_REACT]` warning (no @types/react in repo node_modules) is harmless for the same reason.
- **KumoLogo** ships no SVG assets in the bundle; previews and designs must pass `basePath="https://brand.kumo.productions/"`.

## Preview-authoring facts (wave 1, 2026-08-25)

- IconButton does not scale its icon: the box tracks `--control-h-*` but children render intrinsic-size. Previews (and real apps) should pass per-size icons (~14/18/24px). Possible component improvement: scale children via font-size/em.
- ArrowButton icon-only form (no `label`, `ariaLabel` set) is supported and renders a bare arrow.
- Tooltip previews: the bubble only shows on hover/focus; the working static trick is a wrapper ref + `useEffect` focusing the inner button (focusin bubbles to the Tooltip span). Give ~40px top padding so a top-side bubble isn't clipped.
- KumoLogo loading from `https://brand.kumo.productions/` works in headless capture — no network/CSP issue.
- Editing `cfg.overrides.<Name>.viewport` mid-wave trips `[CONFIG_STALE]` for that component on scoped preview-rebuild (cardMode alone doesn't; viewport is in the grade slice). Make override edits BEFORE the wave's base full build, or expect to re-run a full package-build to re-stamp.

- **Committing sync-only changes**: `.design-sync` is in .oxlintrc ignorePatterns, and oxlint exits 1 with "No files found" when every staged lintable file is ignored — the lefthook pre-commit then blocks the commit. Commit with `LEFTHOOK=0 git commit …` after running `pnpm lint && pnpm format && pnpm typecheck` manually.

## Known render warns

- `[FONT_REMOTE]` "TP Tokyo City", "BIZ UDPGothic", "Gravitica Mono", "IBM Plex Mono" — tokens/typography.css carries a Google-Fonts @import that serves BIZ UDPGothic + IBM Plex Mono at runtime; TP Tokyo City and Gravitica Mono are licensed faces that genuinely don't ship on web (the guideline documents their substitutes). Expected on every validate.
- `[RENDER_BLANK]`/floor-card warns only apply to components without authored previews; all 16 are scoped for authoring in the first sync.

## Re-sync risks

- `brand-guidelines.md` goes stale silently — it is a build artifact copy; regenerate it (see above) whenever guideline text changed.
- `.design-sync/fonts.css` duplicates public/fonts.css by hand; a font swap in public/ won't propagate on its own.
- `dtsPropsFor` and the authored previews duplicate knowledge of component APIs; a props change in public/components/ needs both updated (validate/grades will flag the previews, nothing flags dtsPropsFor except review).
- KumoLogo previews depend on brand.kumo.productions being reachable from the render machine.
