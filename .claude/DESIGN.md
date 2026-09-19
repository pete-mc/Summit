<!-- @format -->

# DESIGN.md — Summit UI/Styling Reference

Read this before adding or changing any UI in Summit. It records what Summit's design
system actually is today, and what Terrain (the host site Summit injects into) is
built with — so new work stays visually consistent with both.

## Summit does NOT use a component library

Summit is plain React (18.2) with hand-written CSS — no Vuetify, MUI, Ant Design,
Tailwind, or similar. There is a small legacy pocket of Vue 2.7 (Vuex/vue-router)
still present from before the React migration, but new UI work should be React.

All shared styling lives in one file: [`src/styles/index.css`](../src/styles/index.css).
There is no CSS-in-JS, no CSS modules, no styled-components. Components are styled by
applying utility/semantic class names from that file.

**Reuse those classes before inventing new ones.** Check `index.css` first — most
common needs (buttons, form inputs, dialogs, data grids, toolbars) already have a
class.

## Design tokens (CSS custom properties)

Defined once in `:root` in `index.css`, consumed everywhere else. Always prefer these
over hard-coded values.

```css
--summit-space-xs: 4px;
--summit-space-sm: 8px;
--summit-space-md: 12px;
--summit-space-lg: 16px;

--summit-font-size-sm: 12px;
--summit-font-size-md: 14px;
--summit-font-size-lg: 16px;
--summit-font-weight-semibold: 600;

--summit-color-bg-primary: #004c00;        /* Summit brand green */
--summit-color-bg-primary-hover: #006600;
--summit-color-bg-muted: #f3f2f1;
--summit-color-bg-surface: #ffffff;
--summit-color-text-primary: #201f1e;
--summit-color-text-danger: #a4262c;
--summit-color-text-on-primary: #ffffff;
--summit-color-border-default: #c8c6c4;
--summit-color-border-subtle: #edebe9;

--summit-focus-ring-color: #0f6cbd;
--summit-focus-ring-width: 2px;

--summit-color-status-unanswered: #edebe9;  /* heat-map: not started */
--summit-color-status-answered: #7d6694;    /* heat-map: in progress */
--summit-color-status-awarded: #b3c9b3;     /* heat-map: complete */
```

Brand green (`#004c00`, hover `#006600`) is Summit's identity color — used for primary
buttons, the heat-map header row, and Summit's own entries injected into Terrain's
left nav. Don't introduce a second "primary" brand color; extend the palette with new
`--summit-color-*` tokens in the same naming style if a new semantic color is needed.

## Component conventions

- Functional components, typed props via `interface` + `React.FC<Props>`. See
  [`SimpleDropdown.tsx`](../src/components/SimpleDropdown.tsx) for the canonical
  shape: a typed `DropdownOption[]`/change-event contract, plain `<select>` styled
  with `className="summit-form-input"`.
- Prefer plain HTML elements (`<select>`, `<button>`, `<table>`) over custom
  widget abstractions — style them with existing utility classes
  (`summit-form-input`, `summit-button summit-button-primary`, etc.) rather than
  building a wrapper component whose only job is applying a class.
- Reusable pieces live in `src/components/`; page-level views live in
  `src/pages/<FeatureName>/`. Feature-specific styling still goes in the shared
  `index.css`, namespaced with a feature prefix (see `oas-*` classes for the OAS
  Progression heat-map) rather than a per-feature stylesheet.
- Naming convention for new classes: `<feature>-<element>[-<modifier>]`, e.g.
  `oas-heatmap-square-awarded`, `calendar-legend-swatch`. Keep this when adding
  classes for a new feature area.

## Terrain's own styling (the host site Summit runs inside)

Terrain (`https://terrain.scouts.com.au`) is a separate Nuxt.js (Vue 2) app built on
**Vuetify 2.x** (Material Design), Material Design Icons (MDI, via
`materialdesignicons-webfont`), and the **Nunito Sans** typeface (Light/Regular/
SemiBold). Confirmed directly from the captured frontend in
[`docs/terrain.scouts.com.au/`](../docs/terrain.scouts.com.au/):

- `vuetify` string present across 33 JS chunks; live Vuetify component classes
  (`v-btn`, `v-card`, `v-app-bar`, `v-navigation-drawer`, `v-text-field`) found in
  `_nuxt/vendors/app.*.js` and multiple page bundles.
- Vuetify's own source embeds a deprecation-warning link to
  `github.com/vuetifyjs/vuetify/releases/tag/v2.0.0#user-content-upgrade-guide` —
  confirms Vuetify **major version 2** (Vue-2-compatible line, Material Design 2
  spec) directly from framework internals, not just inferred from bundle contents.
  Exact patch version wasn't recoverable (no `version` property exposed at runtime
  via `$nuxt.$vuetify.version` or equivalent) — not worth chasing further; the whole
  2.x line is visually/structurally consistent.
- MDI: `materialdesignicons-webfont.eacc609.woff2` bundled; `mdi-*` icon classes
  (`mdi-magnify`, `mdi-plus`, `mdi-close`, etc.) used across 18 component files.
- Font: `NunitoSans-Light.woff2`, `NunitoSans-Regular.woff2`,
  `NunitoSans-SemiBold.woff2` in `_nuxt/fonts/`.
- No Bootstrap/Tailwind/Element UI/Quasar — ruled out by grep across the whole
  capture.

**What this means for Summit:** Summit already has its own established look (green
brand color, its own CSS system) rather than trying to be a Vuetify clone — don't
pull in Vuetify or MDI as dependencies just to "match Terrain". Where Summit UI is
injected directly into Terrain's own chrome (e.g. the nav-menu color overrides at the
bottom of `index.css` targeting `.NavMenu__*` / `.v-menu-group__*` classes), match
Terrain's actual rendered classes/colors there specifically, since that CSS is
overriding Terrain's real DOM. For everything else — Summit's own pages and
components — keep using Summit's existing green-branded style above; it doesn't need
to visually imitate Vuetify/Material Design.

If Terrain's Material Design look ever needs to be sourced precisely (exact color
tokens, spacing scale) for a specific integration point, check live via DevTools:
Application/Elements tab → inspect `:root` CSS custom properties on the Terrain page
itself (Vuetify typically exposes theme colors as `--v-primary-base` etc.).

## Verification

No build step needed to check this file — it's documentation. When adding new shared
styles, sanity-check by running `npm run build` and loading `dist/` as an unpacked
extension (see `.claude/DEVENV.md`) to confirm the new classes render as expected
against the real Terrain page.
