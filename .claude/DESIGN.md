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

The three `--summit-color-status-*` tokens above are the heat-map square's colour
states. There is a fourth state class, `.oas-heatmap-square-hidden` (the OAS
Progression page's "Hide answered" filter), which correctly has **no** token: it sets
`visibility: hidden` and clears the border so the square holds its slot while showing
nothing. Note that `.oas-heatmap-square` carries the border independently of the state
classes, so any future "invisible" state must clear `border-color` too — setting only a
transparent background leaves an empty outline behind.

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

## The `--oas-vue-*` type scale (Vuetify pages)

`src/pages/OasProgressionVue/` is a deliberate exception to "Summit doesn't use a
component library" above — built on real Vuetify 2 components (see
`.claude/OASProgression/PLAN_VUE.md`) as an evaluation of whether Vuetify is worth adopting more
broadly. It proved out well enough to become the primary OAS Progression page (route
`/summit/reports/oasprogression`); the original React version lives on unlinked at
`/summit/reports/oasprogression-legacy` as a reference. It does not use Summit's
`--summit-*` tokens; it has its own small type scale, defined once as CSS custom
properties on `.oas-vue-content` in
[`OasProgressionVueContent.vue`](../src/pages/OasProgressionVue/components/OasProgressionVueContent.vue):

```css
--oas-vue-font-size-heading: 18px;   /* filter labels: Member, Skills, Display, etc. */
--oas-vue-font-size-body: 14px;      /* table cells, filter/select input text */
--oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
```

Custom properties inherit through the DOM regardless of Vue's scoped-CSS component
boundaries, so `OASProgressionFiltersVue.vue`, `OASProgressionTableVue.vue`, and
`OASHeatMapVue.vue` all reference these (`var(--oas-vue-font-size-body)`, etc.)
instead of each hardcoding its own copy of a pixel value.

**`src/pages/IStatements/` and `src/pages/PresentAwardsVue/` share this same scale**, each
redeclaring the identical three properties on its own `.oas-vue-content` root — in
`IStatementsContent.vue` (route `/summit/reports/istatements`, plan in `.claude/I_Statement/`)
and `PresentAwardsVueContent.vue` (route `/summit/tools/presentawards-vue`, plan in
`.claude/PresentAwardsVue/`). That is deliberate rather than a copy-paste oversight: the
three pages are visual siblings — all Vuetify, all a filter row above a table — and
giving each its own `--istatement-*` / `--present-awards-*` scale would reintroduce
exactly the drift this scale exists to prevent. A change to one page's sizes should be
a considered decision about all three.

`PresentAwardsVue` is the **editable** one of the three, and the only place in the codebase
with an editable `v-data-table`. Two extra conventions come from it, both in
`PresentAwardsTableVue.vue`:

- An in-cell control that opens something (its date activator) is styled as text with a
  dotted underline and `cursor: pointer`, sized from `--oas-vue-font-size-body` — not as a
  `v-btn`, whose min-height stretches a `dense` row.
- Group header rows use `--summit-color-bg-muted` for the tint and
  `--summit-font-weight-semibold` for the label, rather than a border or a heavier rule.

The I Statements heat-map does use Summit's `--summit-*` tokens for colour (unlike the
OAS Vue page, which leans on Vuetify's theme): its purple square reuses
`--summit-color-status-answered`, the same purple as the OAS heat-map's in-progress
state, rather than introducing a second near-identical purple. Its header/border
colours likewise come from the `--summit-color-*` palette. Note that its stage-number
header sets `color` explicitly — without that, the numbers inherit a pale grey from
Terrain's own table CSS and are effectively invisible against the muted background.

**Use this scale for any new text on these pages.** Headings (filter row labels) use
`--oas-vue-font-size-heading`; everything else — table cells, filter inputs, select
values — uses `--oas-vue-font-size-body`. Don't introduce a third size without a
concrete reason; the whole reason this scale exists is that the page previously
didn't have one (see "How these values were determined" below) and near-identical
elements silently drifted out of sync as a result.

**Deliberately left outside the scale** (not oversights — each has an independent
reason to differ): `.oas-vue-pill-btn` (the PDF/Excel/Show-Table/Refresh buttons)
matches Terrain's own distinct button component, which happens to also be 14px but
for unrelated reasons (`font-weight: 600`, different semantics); Vuetify icon sizes
(`.v-icon`) are a separate concern from text sizing.

**How these values were determined, and how to add a new one:** every value in this
scale was read directly from Terrain's live DevTools Computed panel — Terrain's own
page-level CSS overrides so much of Vuetify's defaults that no static source (not
Vuetify's own defaults, not the captured snapshot in `docs/terrain.scouts.com.au/`)
reliably predicts what a given component actually renders at. If you need a size this
scale doesn't cover (e.g. a new kind of element that isn't a heading or body text),
find Terrain's own closest equivalent element live on the real site, read its
Computed panel, and match that explicitly — don't guess or reuse a nearby number.

This scale was added after several rounds of exactly that guessing produced
mismatched text that looked consistent on paper (same stated font-size) but rendered
differently — in one case because the actual cause was a layout bug (a `<legend>`
inheriting `width: 100%` from a rule written for the React page's different layout),
not a font-size problem at all, which was only found because there was finally one
shared value to check against instead of independently-set numbers with nothing to
compare.

## Terrain's own CSS custom properties — prefer these over hardcoded values

Terrain declares a full palette on `:root`, in the **same `:root` as Summit's own `--summit-*`
tokens**, so both are live on every page and either can be referenced. Read from the live site's
Computed panel, 2026-09-28.

```css
/* Structure and text */
--color-white:              #fff;
--color-default-background: #fafafa;   /* the page ground v-data-table sits on */
--color-light-charcoal:     #e5e9ec;   /* Terrain's own table/card border */
--color-light-mid-charcoal: #b7c2cc;
--color-neutral-charcoal:   #748494;
--color-medium-charcoal:    #405261;
--color-dark-charcoal:      #253642;   /* Terrain's body text */
--color-slate:              #1d2b36;

/* Brand blues */
--color-australian-nav-blue: #071e57;
--color-scouts-medium-blue:  #00348d;  /* floated input labels */
--color-base-blue:           #1070ca;  /* buttons; our Vuetify theme primary */
--color-blue-2:              #2d9cdb;

/* Sections */
--color-section-joey: #b65518;  --color-section-cubs:     #ffc82e;
--color-section-scouts: #00ae42; --color-section-venturer: #9e1b32;
--color-section-rover: #dc291e;  --color-international:    #622599;

/* Alerts */
--color-alert-danger: #ef5350;  --color-alert-success: #6fcf97;
--color-alert-caution: #ffd180; --color-alert-info:    #a0d4ff;

/* OAS stages 1-9 — Terrain's own per-stage scale */
--color-oas-stage-1: #003c1c;  --color-oas-stage-2: #106236;  --color-oas-stage-3: #00897b;
--color-oas-stage-4: #00acc1;  --color-oas-stage-5: #00838f;  --color-oas-stage-6: #2549a8;
--color-oas-stage-7: #16337f;  --color-oas-stage-8: #071e57;  --color-oas-stage-9: #001d3e;
```

**Use the token, not the literal.** `var(--color-light-charcoal, #e5e9ec)` tracks Terrain if they
ever retheme; `#e5e9ec` does not. The fallback keeps it working if a page ever loads without them.

Two things worth knowing:

- **`--summit-color-text-primary` (#201f1e) and `--color-dark-charcoal` (#253642)** are two
  slightly different near-blacks doing the same job. New text on a Vuetify page should prefer
  Terrain's.
- **Terrain has nine official OAS stage colours.** The heat map currently colours by *state*
  (`--summit-color-status-unanswered/answered/awarded` — grey/purple/green), not by stage. Using
  Terrain's scale instead would be a deliberate design change, not a tidy-up; noted here so the
  option is known rather than rediscovered.

### Terrain does not style its table headers

Confirmed from the live Computed panel on a Terrain `v-data-table` `thead`: no background, no
colour override, no font-weight, no border. Everything visible is Vuetify's default, plus the
global `* { font-family: NunitoSans-regular }` and `* { margin: 0; padding: 0 }` resets.

So "make a table look like Terrain's" means **removing** our own header styling, not replacing it
with different values. Summit's OAS heat map currently paints its `thead` with
`--summit-color-bg-primary` (Summit green); Terrain has no equivalent anywhere.

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

## Summit's CSS loses cascade ties — never rely on inheriting a Vuetify rule

`manifest.json` injects `summit.css` as a **content-script stylesheet**. Chrome places
those in a lower-precedence cascade origin than the page's own stylesheets, so where
Summit's CSS and Terrain's CSS have equal specificity, **Terrain wins**.

The practical consequence: any Vuetify styling Summit relies on *inheriting* rather than
*stating* can lose on a cold load. This produced a real bug on both Vue data tables —
Vuetify's own `padding: 0 16px` for table cells lost to Terrain's ambient CSS, leaving
the first column flush against the table edge.

The symptom is distinctive and worth recognising:

> Correct when navigating in from another Summit page, **wrong on a hard refresh**
> straight onto the page.

That is a load-order race, not a wrong value. Arriving from elsewhere only looks right
because the styles had already settled. **Suspect this before adjusting any numbers** —
changing the value will appear to fix it in one navigation path and not the other.

The fix is to state the rule yourself, scoped to your component and reaching through
`::v-deep` where it targets Vuetify-rendered elements, so the layout no longer depends
on which stylesheet won. Both `PresentAwardsTableVue.vue` and `OASProgressionTableVue.vue`
now restate their cell padding this way.

## Verification

No build step needed to check this file — it's documentation. When adding new shared
styles, sanity-check by running `npm run build` and loading `dist/` as an unpacked
extension (see `.claude/DEVENV.md`) to confirm the new classes render as expected
against the real Terrain page.

**Test a Vuetify page with a hard refresh directly onto its own URL**, not just by
navigating to it from Summit home — see the cascade section above for why those two
paths can render differently.
