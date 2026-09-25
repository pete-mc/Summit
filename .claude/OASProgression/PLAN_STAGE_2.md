<!-- @format -->

# Stage 2 — Page Scaffolding + Naive Render

See [PLAN.md](PLAN.md) for full context and [PLAN_STAGE_1.md](PLAN_STAGE_1.md)
for the data layer this stage wires up to. Depends on Stage 1 being complete.

## Goal

A real, clickable page in the extension, working end-to-end against live
Terrain APIs, before any heat-map styling investment. This de-risks the
Vue/React boundary and real-API integration early, and gives the user a
working page to look at quickly.

## New files

`src/pages/OasProgression/`, mirroring `src/pages/OasReport/` exactly:

- **`OasProgression.vue`** — heading, one-line description,
  `<div ref="reactRoot"></div>`. No chart-canvas cruft (unlike
  `MilestoneReport.vue`, which has legacy unused chart elements — don't
  imitate that part).
- **`OasProgression.ts`** — Vue `defineComponent` wrapper:
  - `data()` → `{ items: OASProgressionRow[], root: Root | undefined, loadingStreams: Set<string> }` (the `loadingStreams` set backs progressive per-stream rendering)
  - `mounted()`:
    - drives the fetch orchestration: for each of the 9 OAS streams, in
      batches of ~6 concurrent (not all 9 at once — a cheap safety margin,
      see PLAN.md's loading-strategy decision), call `fetchOASTree(stream)`
      → `flattenOASTree(tree)` → for each discovered `(branch, stage)`, call
      `fetchOASProgressionForStage(...)` from Stage 1
    - accumulate rows into `this.items`, appending/re-rendering as each
      stream's data resolves (progressive render, not one big wait)
    - sets `window.$nuxt.$store.state.global.breadcrumbs` to
      `Summit → Reports → OAS Progression` (path `/summit/reports/oasprogression`)
    - mounts the React root
  - `watch.items` → re-renders the React component
  - `beforeDestroy()` → unmounts the React root
  - a `reloadAll()` method and a `reloadStream(stream: string)` method, both
    calling `clearCache(...)` (Stage 1's cache helper) then re-running the
    relevant part of the fetch orchestration — needed now for testing
    correctness against live data, and stays in the final UI as the "Reload"
    control described in PLAN.md.
- **`components/OasProgression.tsx`** — Stage-2 version: a literal flat table
  using the existing `DataGrid` component (see `OasReport.tsx` for the usage
  pattern), one row per tidy `OASProgressionRow`. Columns: memberName,
  stream, branch, stage, inputGroup, iStatement, answered, awarded, date.
  This is **not** throwaway scaffolding — per PLAN.md's flat-table decision,
  this becomes the permanent "view as table" secondary view once Stage 3
  adds the heat-map as the primary view.
- Render a simple loading indicator per stream while `loadingStreams` still
  contains that stream's name (exact styling is not load-bearing here —
  keep it minimal, Stage 3 can improve it).
- Render Reload buttons (one "Reload all", one per-stream — a simple
  dropdown or button row is fine, exact UI polish belongs to Stage 3/4).

## Routing

`src/router/SummitRouter.ts`:

```typescript
// Add OasProgression to the existing @/pages import line
import { Home, DisplayOptions, MilestoneReport, OasReport, OasProgression, Topo, SummitCalendar, PeakAward } from "@/pages";

// In initRoutes():
this.router.addRoute({
  path: "/summit/reports/oasprogression",
  component: OasProgression,
});

// In initNavMenu()'s "Reports" items array, alongside the existing "OAS Summary" entry:
{
  title: "OAS Progression",
  to: "/summit/reports/oasprogression",
  items: [],
  locked: false,
  roles: [true, false],
},
```

Add the corresponding export to `src/pages/index.ts`'s barrel, matching the
existing style for `OasReport`.

## Tests

- Component contract test (`tests/unit/components/oas-progression-render-contract.spec.ts`
  or similar) — render `OasProgression.tsx` with fixture `OASProgressionRow[]`
  data, assert expected table cells appear (member names, stream/stage
  values, i-statement text).
- No route/nav-registration test is required — `SummitRouter.ts` itself has
  no existing test coverage in this codebase, and this stage should match
  existing depth rather than introduce new testing surface unprompted.

## Acceptance criteria

- [ ] `OasProgression.vue`, `.ts`, `components/OasProgression.tsx` created, following the `OasReport` pattern
- [ ] Route registered at `/summit/reports/oasprogression`, nav menu entry "OAS Progression" added under Reports
- [ ] Fetch orchestration loops all 9 streams with ~6-concurrent batching, using Stage 1's tree/template/achievement services and cache
- [ ] Progressive per-stream rendering works (data appears incrementally, not all-or-nothing)
- [ ] Full "Reload" and per-stream "Reload" controls work, correctly clearing and refetching cache
- [ ] Flat table renders correctly via `DataGrid`, one row per tidy row
- [ ] Component contract test passes
- [ ] Manual check: unpacked extension in Edge, navigate to Reports → OAS Progression, confirm the page loads real data from a live unit and the reload controls work
- [ ] `npm run build` succeeds, `npm run lint` clean on new files
