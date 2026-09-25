<!-- @format -->

# PLAN_STAGE_2.md — Page shell, route, nav, loading UX

Goal: a reachable page that crawls the data and shows the progress bar, then
reports what it loaded. No table yet (Stage 3) and no filters yet (Stage 4) —
this stage hardcodes "all 9 Skills, stages 1–9".

## Files

Mirror the `OasProgressionVue` structure exactly — each component is a `.vue`
template plus a sibling `.ts` referenced via `<script lang="ts" src="./X.ts">`:

```
src/pages/IStatements/
  IStatements.vue            + IStatements.ts            <- route component / Vue instance host
  components/
    IStatementsContent.vue   + IStatementsContent.ts     <- owns state, defines the type scale
```

Read [`OasProgressionVue.ts`](../../src/pages/OasProgressionVue/OasProgressionVue.ts)
and [`OasProgressionVueContent.ts`](../../src/pages/OasProgressionVue/components/OasProgressionVueContent.ts)
first and follow whatever they do for mounting the second Vue instance and
Vuetify — **do not** invent a different mounting approach. `.claude/OASProgression/PLAN_VUE.md`
explains why a second Vue instance is required; that reasoning applies here
unchanged.

## Type scale

`IStatementsContent.vue` defines the same custom properties on its root element
that `OasProgressionVueContent.vue` does:

```css
--oas-vue-font-size-heading: 18px;
--oas-vue-font-size-body: 14px;
--oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
```

Reuse the **same `--oas-vue-*` names** rather than inventing `--istmt-*`
equivalents — per `.claude/DESIGN.md` the whole reason the scale exists is to
stop near-identical elements drifting apart, and these two pages are visually
siblings. Child components reference `var(--oas-vue-font-size-body)` and
inherit through scoped-CSS boundaries.

## Route + nav

In [`SummitRouter.ts`](../../src/router/SummitRouter.ts):

- `this.router.addRoute({ path: "/summit/reports/istatements", component: IStatements })`,
  placed next to the `oasprogression` route.
- A nav item `{ title: "I Statements", to: "/summit/reports/istatements", items: [], locked: false, roles: [true, false] }`
  in the `Reports` group in `initNavMenu()`, directly after "OAS Progression".

Also export the page from `src/pages/index.ts` alongside the others.

## Loading UX (agreed: determinate progress with running count)

State machine on `IStatementsContent`:

| State | Shows |
| ----- | ----- |
| `idle` → immediately `loading` on mount | — |
| `loading` | Vuetify `v-progress-linear` (determinate) + "Loading templates 47/180…" |
| `ready` | the table (Stage 3); for now, a placeholder line: row count, group count |
| `error` | message + a Retry button |

Wire `buildIStatementMatrix`'s `onProgress(done, total)` straight to the bar.
Before the trees resolve, `total` is unknown — show an **indeterminate** bar with
"Loading skill trees…", then switch to determinate once counting starts. This
avoids a bar that sits at 0% or jumps backwards as the denominator grows.

If `failedTemplates > 0`, show a non-blocking warning line above the content:
"12 of 180 templates could not be loaded — some squares may be missing."
Don't treat partial failure as a fatal error; a mostly-complete matrix is still
useful.

## Caching note

Because templates share the `template.<link>` cache keys with the OAS
Progression page, a user who has already opened that page will see a much faster
first load here. Conversely this page warms the cache for that one. Worth a
one-line comment in the service; don't build a separate cache.

## Verification

Per `.claude/DESIGN.md` and the standing "verify, don't guess" rule — build and
check in the real browser, not just tests:

1. `npm run build`
2. Reload the unpacked extension from `dist/` in Edge.
3. On Terrain, confirm "I Statements" appears in the Summit Reports nav.
4. Click it: the progress bar runs, the count climbs to its total, and the
   placeholder reports a plausible row/group count (expect very roughly 1000+
   raw inputs collapsing to a few hundred rows, and ~15–25 Skill+Stream groups —
   treat these as sanity ranges, not assertions).
5. Reload the page: second load should be near-instant from cache.
6. DevTools Network tab: confirm concurrency is bounded (no burst of ~180
   simultaneous template requests).
