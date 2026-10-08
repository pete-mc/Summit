<!-- @format -->

# DESIGN.md — Summit UI/Styling Reference

Read this before adding or changing any UI in Summit. It records what Summit's design
system actually is today, and what Terrain (the host site Summit injects into) is
built with — so new work stays visually consistent with both.

## Summit is now built on Vue 2.7 + Vuetify 2 — new UI work should use it

**New pages should be Vue 2.7 + Vuetify 2 components**, following the pattern in
`src/pages/OasProgressionVue/`, `src/pages/PresentAwardsVue/`, and
`src/pages/IStatements/`. This is a deliberate shift, not a stray experiment: the
Vuetify build of OAS Progression proved out well enough (see
`.claude/OASProgression/PLAN_VUE.md`) that it replaced the original React page as the
one linked from Summit's nav menu — see `src/router/SummitRouter.ts`, where
`/summit/reports/oasprogression` and `/summit/tools/PresentAwards` route to the Vue
components. OAS Progression's React original has since been deleted outright (its
shared, non-UI service layer survives under `src/pages/OasProgression/services/`,
still imported by the Vue page and I Statements — only the React components/route were
removed); Present Awards' React original still survives at an unlinked `-legacy` route
for reference. I Statements was built Vue-first and has no React equivalent at all.

React (18.2) is **not** gone — it's still live and routed for pages that haven't been
rebuilt: `Home`, `MilestoneReport`, `OasReport`, `PeakAward`, `Topo`,
`SummitCalendar`, `DisplayOptions` (see `src/pages/` and `SummitRouter.ts`). Keep
maintaining these in React; don't rewrite a page to Vue just because this file says
Vue is now the default — that's a decision worth its own plan (as OAS Progression's
was), not an incidental side effect of an unrelated change.

**So, for new work:** building a new page or materially reworking an existing one →
Vue 2.7 + Vuetify 2. Small fixes to an existing React page → stay in React, matching
that page's existing conventions below.

All shared styling (both React's utility classes and the cross-cutting tokens Vue
pages also use) lives in one file: [`src/styles/index.css`](../src/styles/index.css).
There is no CSS-in-JS, no CSS modules, no styled-components — React components are
styled by applying class names from that file; Vuetify components lean on Vuetify's
own theme plus the `--oas-vue-*` scale described below.

**Reuse existing classes/components before inventing new ones.** Check `index.css`
first for React work — most common needs (buttons, form inputs, dialogs, data grids,
toolbars) already have a class. For Vue work, check `src/components/` for a shared
component (e.g. `SummitLoadingState.vue`) and the `--oas-vue-*` scale before adding
page-local styling.

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

## Component conventions (React pages)

These apply to the still-active React pages (`Home`, `MilestoneReport`, `OasReport`,
`PeakAward`, `Topo`, `SummitCalendar`, `DisplayOptions`, and the unlinked `-legacy`
pages). For new/Vue work see the next section.

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

`src/pages/OasProgressionVue/` was the first page built on real Vuetify 2 components
(see `.claude/OASProgression/PLAN_VUE.md`), evaluating whether Vuetify was worth
adopting more broadly — it was, and Vuetify is now the default for new pages (see
above). `OasProgressionVue` became the primary OAS Progression page (route
`/summit/reports/oasprogression`); the original React version has since been deleted
outright, rather than kept unlinked like Present Awards' legacy page — see the top of
this file. It does not use Summit's
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

**What this means for Summit:** Vuetify is now a direct dependency (`"vuetify": "^2.7.2"`
in `package.json`, set up in `src/vuetifySetup.ts`), used deliberately *because* it's
also what Terrain itself is built on — new Vue pages share Terrain's own component
library rather than approximating its look from outside. That doesn't mean imitating
Terrain pixel-for-pixel everywhere: Summit's brand green remains Summit's own identity
color (primary buttons, heat-map header, nav-menu entries), and the still-active React
pages keep their existing green-branded `--summit-*` look rather than being reworked
to chase Material Design. Where Summit UI is injected directly into Terrain's own
chrome (e.g. the nav-menu color overrides at the bottom of `index.css` targeting
`.NavMenu__*` / `.v-menu-group__*` classes), match Terrain's actual rendered
classes/colors there specifically, since that CSS is overriding Terrain's real DOM.

If Terrain's Material Design look ever needs to be sourced precisely (exact color
tokens, spacing scale) for a specific integration point, check live via DevTools:
Application/Elements tab → inspect `:root` CSS custom properties on the Terrain page
itself (Vuetify typically exposes theme colors as `--v-primary-base` etc.).

## Page layout: filter panel spacing IS standard — declare it once, never per page

**Fixed 2026-09-29.** `.oas-vue-filter-panel` and the page-level panel classes now live in
`src/styles/index.css` and are **not** redeclared in any page's scoped `<style>` block.

This was the `.claude/DEV_NOTES.md` entry:

> Filter area doesn't have same space below it, as per OAS Progression, Present Awards etc. This
> layout should be standard for every page we make.

The duplication was the cause, and it failed in both directions at once:

- OAS Progression declared the class with `gap: 12px`, Present Awards with `gap: 8px` — two
  copies, free to drift, and drifted.
- **I Statements declared it nowhere at all.** The class was on its markup, looked load-bearing,
  and did nothing. Nothing flagged this, because a class that matches no rule is not an error.
- `.istatement-panel` and `.present-awards-panel` were dead the same way — written on their pages'
  root elements, defined nowhere. Only `.oas-progression-panel` existed.

None of the copies set space *below* the panel, so the gap before the table came from whatever
the next element happened to bring. The shared rule sets `margin-bottom` explicitly.

**The rule for new pages:** put the class on the markup and stop. Do not redeclare it locally
"to be sure" — a local copy is how this broke. A genuinely page-specific difference (Present
Awards overrides `.oas-heatmap-controls`, because it has one checkbox group rather than a full
filter row) stays local and says why in a comment.

Guarded by `tests/unit/components/istatement-matches-oas-progression.spec.ts`, which fails if any
page redeclares the class.

## A shared *component* beats a shared *class*

**Added 2026-09-29**, building `src/components/SummitLoadingState.vue`.

The section above says a shared class belongs in `index.css`, declared once. That is right, but
it is the weaker of two options. When the thing being shared is a whole piece of UI — markup plus
its styling — make it a **component** and let its styles stay in its own scoped `<style>` block.

The difference is that a class can be copied and a component cannot. `.oas-vue-filter-panel` drifted
precisely because each page *could* redeclare it; two did, with different gaps, and a third declared
it not at all. A component imported from `src/components/` has exactly one definition by construction,
and there is no "declare it locally to be sure" mistake available to make.

So:

- **Shared markup + styling** → a component in `src/components/`, styles scoped to it.
- **A shared class applied to page-specific markup** (`.oas-vue-filter-panel`, the panel classes)
  → `index.css`, declared once, per the section above.

Pages still differ in *when* they show a shared component. The three Vue pages all use
`SummitLoadingState`, but OAS Progression shows it alongside partial content while the other two
replace their body with it — its nine skills stream in one at a time, so hiding everything until
all nine land would feel slower. That is a real behavioural difference, argued in
`.claude/SharedLoading/PLAN.md`, not drift. Consistency means the same component and the same
look, not identical conditions.

**Note for tests:** Jest cannot parse an SFC, so a `.vue` import in a component under test needs a
`jest.mock(..., { virtual: true })` stub — see the top of
`tests/unit/pages/PresentAwardsVue/PresentAwardsVueContent.spec.ts`. This applies to relative and
`@/`-aliased imports alike; neither resolves to the sibling `.ts` on its own.

Guarded by `tests/unit/components/shared-loading-state.spec.ts`, which fails if any page
reintroduces its own `<v-progress-linear>`.

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

## Sticky table cells need an opaque background *stated*, not inherited

When a table drops a coloured header (as both heat maps did, since Terrain does not style
table headers), any `position: sticky` cell loses the background that colour was silently
providing. A sticky cell with no background of its own is **transparent**, so scrolled content
passes visibly underneath it.

Two things to state explicitly whenever a cell is sticky:

- **An opaque `background`.** Use `var(--color-white, #fff)` to match Terrain's table frame.
  On a frozen first column this also has to survive zebra striping, so the stripe rule needs a
  matching selector for the sticky column or that column becomes a solid block beside striped rows.
- **`border-collapse: separate`** on the table. Collapsed borders detach sticky cells' backgrounds
  and break every frozen edge at once — and Vuetify's own table does not set this.

**The specificity trap underneath this**, which is how it goes wrong quietly: a blanket
`::v-deep thead th` rule compiles to `[data-v-*] thead th` — a class *and* an element, `(0,1,1)`.
A per-cell rule written as a bare `.my-stage-header` is only `(0,1,0)` and **loses**, so its
background is replaced by the blanket one and a sub-header row disappears into the row above it.
No error, no warning, just a header that looks wrong.

Write every rule in such a block at the same shape (`::v-deep thead th.my-class`) so they resolve
by source order rather than by an accident of specificity. `IStatementHeatMap.vue` does this and
says so in a comment covering the whole block.

## Verification

No build step needed to check this file — it's documentation. When adding new shared
styles, sanity-check by running `npm run build` and loading `dist/` as an unpacked
extension (see `.claude/DEVENV.md`) to confirm the new classes render as expected
against the real Terrain page.

**Test a Vuetify page with a hard refresh directly onto its own URL**, not just by
navigating to it from Summit home — see the cascade section above for why those two
paths can render differently.

## Archive — superseded history

This section keeps a record of decisions this file used to document differently, for
anyone cross-referencing old commits/plans against current guidance. Nothing here is
current advice.

- **"Summit does NOT use a component library."** Until the OAS Progression Vuetify
  rebuild (`.claude/OASProgression/PLAN_VUE.md`), this file said Summit was plain
  React with hand-written CSS and explicitly argued against adopting Vuetify. That
  rebuild proved out well enough that Vuetify became the default for new pages — see
  the top of this file for current guidance. The original reasoning (Summit has its
  own established green-branded look; don't import a component library just to chase
  Terrain's Material Design look) still holds for the React pages that remain, it's
  just no longer a blanket rule for the whole codebase.
