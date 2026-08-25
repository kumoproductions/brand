# Building with the kumo.productions™ design system

## Setup — none required

Components are self-contained React functions; there is no provider, theme wrapper, or context. The look comes entirely from CSS custom properties defined in `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css` (all reachable via `styles.css`). Give the page `background: var(--surface-page); color: var(--text-primary); font-family: var(--font-body)` (the shipped base CSS already does this for `body`). Dark mode: set `data-theme="dark"` on the root element — every token flips; never hand-pick dark colors.

## Styling idiom — tokens, not classes

This system has **no CSS classes and no utility framework**. Components style themselves inline from tokens; style your own layout glue the same way — inline styles (or your own CSS) using `var(--*)`:

- Surfaces: `--surface-page`, `--surface-card`, `--surface-sunken`, `--surface-inverse` (Space black plate)
- Text: `--text-primary`, `--text-secondary`, `--text-inverse`, `--text-on-accent`
- Accent (the ONLY highlight colors, per brand rules): `--accent` (Night sky blue #1E4B6B), `--accent-soft` (Sky blue #64ADD4), `--accent-soft-bg`. In dark mode `--accent` becomes Sky blue automatically — never place Night sky blue on black yourself.
- Hairlines: `--border-default` (subtle), `--border-strong`; solid fills: `--solid` / `--on-solid`
- Status (UI-only, use sparingly): `--danger`, `--success`, `--warning` (+ `-bg` variants)
- Type: `--font-display` (headings), `--font-body`, `--font-mono` (uppercase labels with `--tracking-label`); sizes `--text-xs`…`--text-3xl`; weights `--weight-regular/medium/semibold`. **PP Object Sans is the logotype face only — never use it for headings or text.**
- Space: `--space-1`(4px)…`--space-16`(64px); control heights `--control-h-sm/md/lg`
- **Shape is binary: sharp rectangles or pills (`--radius-full`). Never use any other border-radius.** Flat brand: prefer hairlines over shadows (`--shadow-card` exists but is whisper-quiet).
- Motion: `transition: … var(--dur) var(--ease)` (200ms ease-out-expo); `--dur-slow` (300ms) for arrow slides / underline growth.

## Component notes

- `ArrowButton` (label + sliding arrow, no box) is the site's signature CTA — reach for it before `Button` for links/nav actions. `Button variant="accent"` is rare; `primary` (solid black/white) is the default.
- `KumoLogo` renders brand marks from the live brand portal: always pass `basePath="https://brand.kumo.productions/"`. On `--surface-inverse` panels add `inverse`.
- Form fields (`Input`, `Select`) are transparent with gray hairlines and square corners — that is the intended look, not missing styles.

## Where the truth lives

Read `tokens/*.css` before inventing any color/size; per-component API is each `<Name>.d.ts`, usage in `<Name>.prompt.md`; full brand standards (logo clearspace, color rules, do/don't) in `guidelines/brand-guidelines.md`.

## Example

```tsx
const Screen = () => (
  <div style={{ background: 'var(--surface-page)', minHeight: '100%', padding: 'var(--space-8)', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
    <KumoLogo basePath="https://brand.kumo.productions/" variant="abbreviation-tm" height={24} />
    <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Tabs items={['Works', 'About', 'Process', 'Contact']} value="Works" onChange={() => {}} />
      <Card title="Render queue" meta="C24015" footer="Updated 5 min ago">
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>delivery_v3.mov — 00:00:30</span>
      </Card>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button>Start render</Button>
        <ArrowButton label="View projects" />
      </div>
    </div>
  </div>
);
```
