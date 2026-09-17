<!-- @format -->

# Plan Index: OAS Progression Heat-Map Feature

## Context

The Summit extension currently has an "OAS Summary" report (`/summit/reports/oas`)
that shows each member's _highest stage reached_ per OAS stream — but it never
reads the `answers` field on an achievement record, so it can't show progress at
individual i-statement granularity. `.claude/INITIAL_SPECS.md` specifies a new
"OAS Progression" heat-map report that closes this gap: a leader-facing view
showing, per unit member, exactly which i-statements are ticked within each
stage of each OAS stream — mirroring what Topo-Blazor's "OAS Worksheet (PDF)"
already does, but as an in-extension aggregate/chart rather than a per-stage PDF.

**The existing "OAS Summary" page is untouched** — this is a new, separate page
at `/summit/reports/oasprogression`.

## Stages

- [x] [PLAN_STAGE_1.md](PLAN_STAGE_1.md) — Data layer: services, join algorithm, caching. Fully headless, unit-tested.
- [x] [PLAN_STAGE_2.md](PLAN_STAGE_2.md) — Page scaffolding + naive flat-table render, wired to live Terrain APIs. Verified against a real unit's live data, including forked branches (e.g. Bushcraft → Pioneering / Survival Skills).
- [x] [PLAN_STAGE_3.md](PLAN_STAGE_3.md) — Heat-map visual layout matching the GUI sketch. Branches within a forked stream (e.g. Bushcraft → Pioneering / Survival Skills) render as visibly separate rows, never merged — see "Branch separation" note below.
- [x] [PLAN_STAGE_4.md](PLAN_STAGE_4.md) — Filter/display features (surname hide, codename, patrol, stream deselect, zoom). All implemented and unit-tested; pending user manual verification in-browser.

Each stage is independently checkable — see its own file for detail,
acceptance criteria, and tests. Work through them in order; later stages
depend on earlier ones.

## Decisions confirmed with user

- **Loading/caching**: Terrain data changes only every few days in practice.
  Fetch all 9 streams up front, but **cache achievement + template + tree
  responses for a day** (not just templates). Provide an explicit **"Reload"**
  control — both a full reload and a **per-stream reload** (important for
  testing and for a leader who knows one stream's data just changed). With
  daily caching, the ~80-call burst only happens once a day (or on manual
  reload) per leader, not on every page visit — and the existing codebase
  already fires unthrottled `Promise.all` batches of achievement calls
  elsewhere (`PeakAward.ts`, `PresentAwards.ts`) with no rate-limiting
  precedent, so this is consistent with how the extension already treats the
  Terrain API. A small concurrency cap (batches of ~6 concurrent requests) is
  added as a cheap safety margin, not because there's evidence Terrain needs
  it.
- **Codenames**: deterministic per member (stable hash of `memberId` → word
  from a fixed list), so the same member always gets the same codename across
  sessions/screenshots.
- **Filter persistence**: deselected streams, patrol filter, zoom range, and
  hide-surname/codename toggle all persist via localStorage, matching the
  existing `SummitCalendarDraftPersistence.ts` pattern.
- **Flat table**: the Stage-2 plain tidy-row table (built on the existing
  `DataGrid`, which already has Excel/PDF export) stays in the finished page
  as a secondary "view as table" toggle alongside the heat-map, not removed.
- **Branch separation**: when a stream forks into multiple named branches at
  a given stage (confirmed live: Bushcraft → `pioneering` / `survival-skills`
  both starting at stage 4), each branch gets its own row per member in the
  heat-map — never merged into one shared column/row. This was corrected
  mid-implementation after an initial by-stage-only grouping merged forked
  branches together, which would have hidden real per-branch differences
  (e.g. strong in Pioneering, not started in Survival Skills).
- **Trunk merging (round 2 revision)**: shared pre-fork stages (e.g. Bushcraft
  1-3) render as ONE row spanning every branch sub-row (`rowSpan`), not
  repeated per branch — matches a reference table image the user provided.
  The trunk/branch column split point must come from the OAS tree's fixed
  structure (`getTrunkStageCount`, in `buildOASProgressionRows.ts`), not from
  any individual member's own progress — a real alignment bug was caught and
  fixed here (see PLAN_STAGE_3.md's "Post-review revision" section for detail).
- **Shared sticky header, single continuous table**: all 9 streams share one
  `<table>`/`<thead>` (sticky, not per-stream) rather than 9 separate mini
  tables, so column widths must be consistent across every stream (padded
  with blank trailing cells for streams shorter than the unit-wide max).
- **Hide empty branches**: a branch with zero progress across the whole unit
  is hidden by default per stream, with a toggle to reveal it.
- **No wrap, horizontal scroll only**: i-statement squares never wrap; the
  table scrolls horizontally instead. No zoom control, per explicit user
  preference.

## Codebase facts (verified against source)

- `TerrainUnitMember.patrol: {id, name, duty} | null` (`src/types/terrainTypes.d.ts:330-356`)
  is the correct field for "filter/break by patrol" — distinct from
  `member.groups: {id,name}[]`, which is what the existing grouped-multiselect
  helper (`buildGroupedMemberOptions` in `SummitCalendarValidation.ts`)
  actually groups by. Imitate that helper's _pattern_ (native
  `<select multiple>` + `<optgroup>`), not its grouping key — group by
  `member.patrol?.name` directly.
- `TerrainAchievements.answers`, `.achievement_meta.{stream,branch,stage}`,
  `.imported.date_awarded`, `.status` are already typed
  (`src/types/terrainTypes.d.ts:190-229`) — no new achievement types needed.
- `SIATemplate`/`Document`/`InputGroup`/`Input` (same file, ~line 385+) already
  match the OAS template JSON shape — reuse directly, don't clone
  OAS-specific duplicates.
- `fetchUnitAchievementsFilterd(filterString)` already accepts an arbitrary
  query string — just call it with `type=outdoor_adventure_skill&stream=...&branch=...&stage=...`.
- `fetchSIATemplate.ts` hits the wrong endpoint shape for OAS — new sibling
  services needed, not an extension of this file.
- Page pattern (confirmed via `OasReport.ts`/`.vue`, cross-checked against
  `MilestoneReport.ts`/`.vue`): `PageName.vue` (shell + `<div ref="reactRoot">`),
  `PageName.ts` (Vue `defineComponent`; `mounted()` fetches + mounts React +
  sets breadcrumbs; `watch.items` re-renders; `beforeDestroy()` unmounts),
  `components/PageName.tsx` (React), `models/` (only where real transform
  logic exists).
- Routing (`src/router/SummitRouter.ts`): `initRoutes()` registers via
  `this.router.addRoute({path, component})`; `initNavMenu()`'s "Reports"
  section takes a new `{title, to, items: [], locked: false, roles: [true, false]}`
  entry. Component comes from the `@/pages` barrel (`src/pages/index.ts`).
- `DataGrid.tsx` (TanStack Table v8) is flat/tabular only — fine for the
  Stage-2/secondary flat view, not suitable for the heat-map matrix itself.
- No existing rate-limiting/throttling pattern anywhere in `src/`.
- `moment` is already a project dependency — use it for the AU/US
  date-parsing heuristic via strict-mode parsing.
- Test conventions: models → `tests/unit/models/*.spec.ts` with hand-built
  fixture factories; services → `tests/unit/services/*.spec.ts` using shared
  `tests/unit/services/mocks/fetchMock.ts` and `mocks/terrainStateMock.ts`;
  components → `tests/unit/components/*.spec.ts`, sometimes asserting
  structural contracts by reading `.tsx` source text directly.

## Verification (end-to-end, after all 4 stages)

- `npm test` — all new unit tests pass alongside the existing suite (baseline:
  178/179 passing; the 1 pre-existing failure is an unrelated UNC-path smoke
  test issue on this network-share checkout, not something this feature
  should regress or need to fix).
- `npm run lint` — new files clean (existing pre-existing lint debt elsewhere
  is out of scope).
- `npm run build` — succeeds, `dist/` updated.
- Manual: reload the unpacked extension in Edge, navigate to Reports → OAS
  Progression, confirm: page loads against a real unit's live Terrain data,
  heat-map renders per stream/member/level/i-statement, reload (full and
  per-stream) refetches and updates the cache, all four Stage-4 filters work
  and persist across a page reload, flat-table toggle shows the same data as
  the heat-map in tidy-row form.

## Real API shapes (confirmed against live Terrain data — supersedes INITIAL_SPECS.md's example JSON)

The tree endpoint's actual response shape differs from `INITIAL_SPECS.md`'s
example and from this plan's original assumption. This caused a real Stage 2
bug (zero rows ever loaded — silently, no console errors) that's now fixed;
recorded here so Stage 3/4 don't repeat the mistake.

- **`GET /oas/{stream}/tree.json`** returns a wrapper object, not a list:
  ```jsonc
  {
    "title": "Bushcraft",
    "stream_id": "bushcraft",
    "description": "...",
    "tree": {
      // single ROOT node, not an array
      "branch_id": "bushcraft",
      "title": "Bushcraft",
      "stage": 1,
      "template_link": "oas/bushcraft/1/latest.json",
      "children": [ /* recurse */ ]
    }
  }
  ```
- The tree is walked from `tree.tree` as a single root, recursing through
  `children`. **Every node** (not just leaves) is a real, queryable
  `(branch, stage)` combination — confirmed live: Bushcraft stages 1-3 share
  `branch_id: "bushcraft"`, then **forks** at stage 4 into named branches
  (`pioneering`, `survival-skills`) that each continue independently to
  stage 9. Both forked branches were confirmed present in real loaded data.
- **Each node carries its own `template_link`** (e.g.
  `"oas/bushcraft/pioneering/4/latest.json"`) — there is no single shared
  "latest" template per stream. `fetchOASTemplate` takes this `templateLink`
  directly (relative to `https://templates.terrain.scouts.com.au/`), not a
  bare stream name, and the template cache is keyed by `templateLink`, not
  by `stream` alone.
- Types updated in `src/types/terrainTypes.d.ts`: `OASTree` is now
  `{title, stream_id, description, achievement_type?, tree: OASTreeNode}`;
  `OASTreeNode` gained nothing new but `template_link` is now load-bearing,
  not just descriptive.

## Open items to verify (Stage 3 / Stage 4)

- Check for an existing semantic color-token convention before choosing the
  heat-map's answered/awarded/blank cell palette — see Stage 3.

## Related: codebase-wide code review

[PLAN_CODE_REVIEW.md](PLAN_CODE_REVIEW.md) — a general security/robustness/
modularity/standards review of the whole codebase (not scoped to the OAS
Progression feature above) and the fixes applied as a direct follow-up:
removed PII-dumping debug console logs, untracked a stray committed
test-output artifact, made `deleteEvent`/`updateMemberCalendars` error
handling consistent with the rest of `src/services/`, introduced a shared
`src/helpers/Logger.ts` to replace 31 inconsistent `console.*` call sites
across the codebase, and added input validation to `fetchOASTemplate.ts`
so it no longer builds a fetch URL from an unvalidated string.
