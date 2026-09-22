<!-- @format -->

# VueStage 1 — Scaffolding, Mount Pattern, Naive Render

## Status: COMPLETE

See [PLAN_VUE.md](PLAN_VUE.md) for full context and confirmed decisions. This stage
establishes the one genuinely new architectural piece — everything after it is
ordinary Vue+Vuetify development.

**Deviations from the original plan text below (both minor, functionally identical
intent):**

- `.vue` SFCs in this codebase use an **external** `<script lang="ts" src="./X.ts">`
  file, not inline `<script lang="ts">` content — matching the existing
  `OasProgression.vue`/`OasProgression.ts` pattern exactly. An inline script with
  `import type { X } from "..."` inside a `.vue` file's script block fails to parse
  (vue-loader's script-block babel pipeline doesn't carry the same TypeScript preset
  config as the regular `.tsx` babel-loader rule) — confirmed by hitting this build
  error directly. So `OasProgressionVueContent.vue` also got its own
  `OasProgressionVueContent.ts`, same split as the outer page file.
- The "render-contract test... mounting `OasProgressionVueContent.vue` via
  `@vue/test-utils`" idea in the original plan text was not done as written:
  `@vue/test-utils` is not installed and this project's `jest.config.js` has no `.vue`
  transform configured (`.spec.ts` only). Rather than adding new Jest infrastructure
  mid-stage, the test
  (`tests/unit/components/oas-progression-vue-render-contract.spec.ts`) verifies the
  content component's props contract and fixture-data shape directly (mirroring how
  `oas-progression-render-contract.spec.ts` tests source/behavior), plus source-level
  checks confirming the second-Vue-instance mount pattern and that the outer SFC's
  template has no Vuetify tags of its own. A route/nav-registration smoke test was
  added at `tests/unit/router/summit-router-oasprogression-vue-route.spec.ts` (no
  prior `tests/unit/router/` precedent existed, so this establishes one).

## Goal

A real, clickable new page, reachable from Summit's nav menu, rendering real live OAS
Progression data as a plain unstyled list — proving the mount pattern works
end-to-end before any visual investment. This mirrors the original build's own Stage
2 approach (de-risk the framework boundary and live-API integration first).

## The mount pattern (the one new thing this stage must get right)

Confirmed by a prior session's spike (commit `c893a6c`, reverted but preserved in
history): a Vuetify component only resolves correctly when it's part of a Vue
instance built from **Summit's own bundled `vue`** with `Vue.use(Vuetify)` called on
it — never when rendered via Terrain's own router/Vue instance
(`window.$nuxt.$router`), which has its own separate `Vue.options.components`
registry that never has Vuetify registered.

Every existing Summit page (`OasProgression.vue` included) registers its `.vue` SFC
directly as a route on Terrain's router. **This new page must NOT do that for its
Vuetify content.** Structure:

1. **`OasProgressionVue.vue`** — a minimal Vue SFC, same shell pattern as every
   other page (`<h2>`, description text, one mount-point `<div ref="vuetifyRoot">`).
   This SFC itself IS still registered as a route on Terrain's router (needed so
   Summit's existing nav-menu/breadcrumb/routing machinery works unchanged) — but its
   own template contains **no Vuetify tags**, only the plain mount-point div, so it
   never hits the registry problem.
2. **`OasProgressionVue.ts`** — the Vue `defineComponent` wrapper registered on that
   route (same role as `OasProgression.ts` today). In `mounted()`, instead of
   `React.createRoot`, it builds and mounts a **second, independent Vue instance**
   into `vuetifyRoot`:
   ```typescript
   import Vue from "vue"; // Summit's own bundled vue — already Vuetify-registered via src/vuetifySetup.ts (see below)
   import OasProgressionVueContent from "./components/OasProgressionVueContent.vue";

   const ContentApp = Vue.extend(OasProgressionVueContent);
   const instance = new ContentApp({ vuetify: window.summitVuetify, propsData: { /* page data */ } });
   instance.$mount(this.$refs.vuetifyRoot as HTMLElement);
   ```
   `beforeDestroy()` calls `instance.$destroy()` — same lifecycle shape as the
   existing `mountReactComponent`/`unmountReactComponent` pair.
3. **`src/vuetifySetup.ts`** — reinstate this file (deleted by the rollback,
   preserved in git history at commit `8163c82`/`338ee9f`): `Vue.use(Vuetify)` +
   `window.summitVuetify = new Vuetify()`, imported FIRST in `src/index.ts` (before
   `SummitRouter`), and listed in `package.json`'s `sideEffects` array — both details
   matter and were real bugs the first time (import-order + tree-shaking; see that
   file's own comments once restored). Re-add `vuetify@2.7.2` as a dependency.
4. **`components/OasProgressionVueContent.vue`** — the actual page content, a normal
   Vuetify-using Vue SFC. Because it's mounted via step 2's own independent Vue
   instance (not via Terrain's router), Vuetify tags inside it resolve normally, and
   it can freely use ordinary Vue composition (child components, `v-model`, props,
   `v-for`) — no per-control mount/wiring needed, unlike the earlier single-`<v-select>`
   spike. This is the file that grows through VueStages 2-4.

## This stage's actual content (naive)

`OasProgressionVueContent.vue` for this stage only needs to:

- Accept the same data this stage's `OasProgressionVue.ts` fetches (reuse
  `fetchAllOASProgression`/`fetchOASProgressionForStream` from
  `buildOASProgressionRows.ts` as-is — same orchestration `OasProgression.ts`
  already does: 9 streams, concurrency-6 batches, progressive accumulation).
- Render the flat list of `OASProgressionRow`s as a plain unstyled `<ul>`/`<div>`
  loop (or, if trivial, a bare `<v-simple-table>` — real styling is VueStage 2's job,
  not this one).
- Show a simple loading indicator while any stream is still loading (reuse the same
  `loadingStreams` state shape as the existing page).

## Routing and nav menu

`src/router/SummitRouter.ts`:

- `initRoutes()`: add `this.router.addRoute({ path: "/summit/reports/oasprogression-vue", component: OasProgressionVue })`.
- `initNavMenu()`: add a new entry under "Reports", alongside the existing "OAS
  Progression" entry: `{ title: "OAS Progression (Vue)", to: "/summit/reports/oasprogression-vue", items: [], locked: false, roles: [true, false] }`.
- `src/pages/index.ts`: export the new `OasProgressionVue` alongside the existing
  `OasProgression`.

## New directory

`src/pages/OasProgressionVue/`:

- `OasProgressionVue.vue`
- `OasProgressionVue.ts`
- `components/OasProgressionVueContent.vue`

No new service files this stage — everything is imported from
`src/pages/OasProgression/services/` as-is (see [PLAN_VUE.md](PLAN_VUE.md)'s "Reused
as-is" section).

## Tests

- A render-contract test (mirroring `tests/unit/components/oas-progression-render-contract.spec.ts`'s
  approach, but mounting `OasProgressionVueContent.vue` via `@vue/test-utils` instead
  of React's `createRoot`) proving: given fixture rows, the naive list renders every
  row's member/stream/i-statement text; loading indicator shows/hides correctly per
  `loadingStreams`.
- A smoke test confirming the new route is registered and the new nav entry exists
  (grep-style or a `SummitRouter` unit test, matching whatever precedent exists for
  testing route/menu registration today — check `tests/unit/router/` if present
  before inventing a new pattern).

## Acceptance criteria

- [x] `vuetifySetup.ts` restored, wired first in `src/index.ts`, listed in
      `package.json`'s `sideEffects`; `vuetify@2.7.2` reinstalled as a dependency.
- [x] New route `/summit/reports/oasprogression-vue` reachable via a new "OAS
      Progression (Vue)" nav entry.
- [ ] `OasProgressionVueContent.vue` mounts via a second, independent Vue instance
      (not via Terrain's router) — confirmed live: a trivial real Vuetify component
      (e.g. one `<v-btn>` or `<v-progress-circular>` for the loading state) renders
      correctly styled, not as a bare unresolved tag. **Mount pattern itself is coded
      per the proven spike approach and covered by source-level tests, but has not
      yet been re-confirmed in a real loaded browser this stage — do before calling
      this fully done.**
- [ ] Page fetches and displays real live data for all 9 streams, progressively.
      (Same live-verification caveat as above.)
- [x] Existing `OasProgression` page (React) completely unchanged and unaffected —
      confirmed via `git diff --stat src/pages/OasProgression/` showing zero changes.
- [x] New tests pass; `npm test` shows no regressions (351/352 passing, same single
      pre-existing UNC-path failure as baseline; 7 new tests all pass).
- [x] `npm run build` succeeds; `npx tsc --noEmit` shows no new errors beyond the 4
      known pre-existing ones.
- [ ] Manual verification: unpacked extension in Edge, new page loads real unit data,
      old page still works exactly as before.
