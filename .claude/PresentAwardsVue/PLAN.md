# Present Awards (Vue) — overview plan

**Status:** Complete, promoted and verified live, 2026-09-28. The Vue page owns
`/summit/tools/PresentAwards`; the React original is archived at
`/summit/tools/presentawards-legacy`. Grouping by member, a badge-icon column and
concurrent-save merging were added on top of the planned five stages. Nothing outstanding —
see **Outcome** at the foot of this file.

## Context

`Present Awards` (`/summit/tools/PresentAwards`) is one of the last React-in-Vue hybrid pages
in Summit: a Vue SFC shell that manually mounts a React 18 root, which renders
`components/PresentAwards.tsx` on top of the generic `src/components/DataGrid.tsx`.

The OAS Progression page has since been rebuilt as a pure Vue 2.7 + Vuetify 2 page
(`src/pages/OasProgressionVue/`), and its **Table view** (`OASProgressionTableVue`) is now the
house style for a data table: a `v-data-table` with a per-column filter row, dropdown filters for
low-cardinality columns, Clear-filters, filter-aware Excel/PDF export, and a pill-button header
row. A second page (`src/pages/IStatements/`) has already proved the pattern is repeatable.

The user wants Present Awards brought up to that same style and feature set, written against the
new Vue standard rather than React — built as a **new replica page alongside the existing one**,
exactly as `OasProgressionVue` was built alongside the React `OasProgression`.

**Intended outcome:** a `/summit/tools/presentawards-vue` page that renders the same award data,
supports the same save-to-hidden-calendar-event workflow, and gains the OAS table's filtering,
export and persistence — with the React page left untouched for side-by-side comparison on live
unit data.

## Decisions confirmed with the user (2026-09-25)

| Question | Decision |
|---|---|
| Interactive cells | **Vuetify native** — `v-simple-checkbox` for Present, `v-menu` + `v-date-picker` for the Presented date. No React components on the new page. |
| Features to carry across | **All four** — per-column filter row + Clear filters, Excel + PDF export over filtered rows, Refresh button, saved filter state in localStorage. |
| Existing React page | **Keep both.** New route + new nav entry; React page untouched. Archiving/promotion is a separate later decision, mirroring how OAS Progression was eventually promoted. |

## Scope

**Reused as-is — no behaviour changes** (mirrors PLAN_VUE.md's "only the rendering layer is new"):

- `src/pages/PresentAwards/models/SummitAchievement.ts` — the row view-model, already covered by
  `tests/unit/models/SummitAchievement.spec.ts`
- The data-fetch orchestration in `PresentAwards.ts` (`getAwardData`) and the save pipeline
  (`handleUpdate`) — **extracted verbatim into a shared service** so both pages call one copy
  rather than the logic being duplicated (see Stage 1)
- `src/services/*` — `fetchMemberEvents`, `fetchActivity`, `fetchUnitAchievementsFilterd`,
  `fetchUnitMembers`, `updateEvent`, `createNewEvent`
- `src/helpers/CompressGuids.ts`, `src/helpers/TerrainState.ts`, `src/helpers/Logger.ts`
- `src/components/gridExport.ts` — `exportGridToExcel`, `exportGridToPdf`
- `src/vuetifySetup.ts` — already global, already in `sideEffects`, no change

**New:**

```
src/pages/PresentAwardsVue/
  PresentAwardsVue.vue            shell rendered by Terrain's Vue
  PresentAwardsVue.ts             data load, save, second-Vue-instance mount, breadcrumbs
  components/
    PresentAwardsVueContent.vue   <v-app> root, .oas-vue-content scale, header button row, state
    PresentAwardsVueContent.ts
    PresentAwardsTableVue.vue     the v-data-table replica
    PresentAwardsTableVue.ts
  services/
    PresentAwardsVueFilterPersistence.ts    localStorage: summit.presentAwardsVue.filters
```

Plus a shared extraction from the React page:

```
src/pages/PresentAwards/services/
  awardStorageEvent.ts            loadPresentedAwards() / buildStorageEventPayload() / savePresentedAwards()
```

**Out of scope** (explicitly, unless the user asks):

- The `DEV_NOTES.md` wishes — grouping by member, a "Badger" badge icon, and a save checksum to
  stop concurrent leaders clobbering each other. `DEV_NOTES.md` is marked developer-only and the
  AI is not to act on it unprompted. The concurrent-save limitation is **carried forward as-is**;
  this build must not make it worse, but does not fix it.
- Any change to the React page's rendering or route.
- Playwright coverage — consistent with the OAS Vue pages, verification is manual against the
  live site plus Jest unit tests.

## Stages

| Stage | File | Outcome |
|---|---|---|
| 1 | `PLAN_STAGE_1.md` | Extract the storage-event service; scaffold page/route/nav/breadcrumbs; naive `v-data-table` renders real rows |
| 2 | `PLAN_STAGE_2.md` | Interactive cells — `v-simple-checkbox` + `v-menu`/`v-date-picker`, Save Changes, save feedback |
| 3 | `PLAN_STAGE_3.md` | Per-column filter row, Clear filters, Show/Hide Previously Presented |
| 4 | `PLAN_STAGE_4.md` | Excel/PDF export over filtered rows, Refresh, filter persistence |
| 5 | `PLAN_STAGE_5.md` | Polish, CSS mechanics, tests, live verification |

Each stage ends at a state that builds and is loadable in Edge, so the user can look at it before
the next stage starts.

## Standing verification baseline (every stage)

- `npm run build` succeeds
- `npx tsc --noEmit` — no **new** errors (4 known pre-existing, one of them in
  `PresentAwards.tsx` itself)
- `npm test` — no regressions; the single UNC-path failure in
  `tests/unit/smoke/lint_stack_loads.spec.ts` is expected on this network drive
- `npm run lint` — ~40 pre-existing upstream errors; don't fix them here, don't add to them
- Manual: load `dist/` unpacked in Edge against real live unit data

## Outcome (2026-09-26)

Stages 1–4 shipped and were verified live against real unit data in Edge. Member grouping, a
badge-icon column, and a round of layout fixes were then asked for directly and added on top.
The page has since been **promoted** to the primary route. Stage 5's CSS polish pass was never
run as a discrete stage — its three hard-won CSS mechanics were pulled forward into Stage 3, and
the live-verification pass it describes happened piecemeal as each change landed.

**Commits:** `9707038` (extraction), `c527162` (scaffold), `bc2dde1` (editing), `7e0f6cd`
(filters), `c275164` (export/refresh/persistence), `eb2f7d6` (grouping), `4e06bda` (badge column,
filter-box toggles, group-count fix), `ec03b43` (promotion, alignment and padding fixes).

**Test count:** 579 unit tests, 578 passing — the one failure is the pre-existing UNC-path
`lint_stack_loads.spec.ts`, unchanged from the project baseline. 108 of those tests are new.

### Routes after promotion

| Route | Page | In nav? |
|---|---|---|
| `/summit/tools/PresentAwards` | Vue rebuild | Yes, under Tools |
| `/summit/tools/presentawards-legacy` | React original | No — linked from Home under "Development tools" |

The Vue page deliberately took over the **original** URL so existing bookmarks land on it, the
same as the OAS Progression promotion (`16c4ada`). Both pages read and write the same storage
event, so switching between them is safe and the legacy banner says so.

### Divergences from the React page, all deliberate

| Behaviour | React page | Vue page | Why |
|---|---|---|---|
| Date sorting | Lexical — 01/12/2025 sorts before 02/01/2024 | Chronological | The columns hold `DD/MM/YYYY` strings; `compareDisplayDates` parses before comparing |
| Date format at the picker | `DD/MM/YY` while the save path parses `DD/MM/YYYY` | `DD/MM/YYYY` throughout | The original only works because moment is lenient about 2-digit years |
| Failed save | Silent — the promise is never held | Reports the failure | `savePresentedAwards` awaits and returns its `SaveEventResult` |
| After saving | No reload; `previouslyPresented` goes stale | Reloads | Closes the gap the commented-out block at `PresentAwards.ts:177-182` left |
| Export scope | Everything visible; ignores column filters | Only the filtered rows | Matches the OAS Vue table |
| Export values | The stored value | The on-screen value | Exporting before saving otherwise disagrees with the screen |
| Grouping | Flat | Grouped by member, toggleable | `DEV_NOTES.md` wish, asked for directly |

### Bugs found during the build, and what they cost

1. **Unticking left a stale date.** Unticking clears the pending date, after which the display
   fell back to `item.presented` and reported the very date just cleared. Invisible on screen
   (the checkbox drives what you see) but the export and the Presented filter both read it.
   Fixed by making the selection the source of truth in both `presentedValue` (table) and
   `presentedValueFor` (content). Caught by a test, not by eye.
2. **Persisting from a Vue watcher loses writes.** Watchers fire on the next tick, so setting a
   filter and immediately navigating away dropped it. Now persisted synchronously from each
   handler. A test pins this.
3. **A test fixture that lied.** `makeItem` ignored its `name` option, so two "different" members
   both rendered as "Alex Scout" and a filter assertion passed for the wrong reason. Worth noting
   as a class of problem: the fixture, not the code, was wrong.
4. **The group count only counted the current page.** `VData` paginates *before* it groups
   (`computedItems` slices, then `groupedItems` groups the slice — `VData.js:156-164`), so the
   `group.header` slot's own `items` is only that page's share of a member's awards: 30
   outstanding on a 25-row page read "25 not presented". The count now comes from a
   component-level tally over every filtered row, and `groupLabel` takes only the group *name* so
   it cannot regress to the paginated items. Reported by the user, not caught by a test.
5. **The filter row was one cell too wide while grouped.** Vuetify removes the grouped column
   from its own header row (`computedHeaders` filters it out — `VDataTable.js:126`), but the
   `#body.prepend` filter row iterated the raw `headers`, so every filter box sat one column left
   of its header. Both the filter row and the group header's `colspan` now derive from a
   `renderedHeaders` computed that mirrors Vuetify's own filtering. Reported with a screenshot.

### The CSS cascade finding (applies beyond this page)

Table cell padding was correct when navigating in from Summit home but wrong on a hard refresh —
first column flush against the table edge. Not a padding value problem at all.

Vuetify does supply `padding: 0 16px` for its table cells, but our copy of that rule ships inside
`summit.css`, which `manifest.json` injects as a **content-script stylesheet**. Chrome places
those in a lower-precedence cascade origin than the page's own stylesheets, so on a cold load
Terrain's ambient CSS can win. Arriving from another Summit page only looked correct because the
styles had already settled — the classic signature of a load-order race rather than a wrong value.

Both Vue data tables now restate the padding themselves, scoped and reaching through `::v-deep`,
so the layout no longer depends on which stylesheet won.

**This is not specific to padding.** Any Vuetify styling Summit relies on *inheriting* rather than
stating is exposed to the same race. Layout that is right sometimes and wrong on a cold load
should be suspected as this before anyone starts adjusting values.

### Things deliberately NOT done

- **Concurrent-save clobbering is unchanged.** The save still replaces the whole `schedule_items`
  list, so two leaders saving at once still means last-write-wins. `DEV_NOTES.md` records the
  wish for a checksum; it is a storage-format change and was out of scope here.
- **The React page's UX is untouched.** It still saves fire-and-forget. Fixing that there would
  have been a behaviour change beyond the service extraction.
- **No Playwright coverage**, consistent with the OAS Vue pages.

### Badge artwork — current state

The badge column ships with the **nine existing OAS skill PNGs** wired up; every other award type
renders a neutral dashed placeholder. `SummitAchievement.badgeKey` resolves to the OAS *branch*
for OAS awards (artwork is per skill) and to the achievement type otherwise.

To add artwork: drop a file into `src/images/badges/` and add one line to
`BADGE_ICON_FILENAMES` in `src/pages/PresentAwardsVue/services/getBadgeIconUrl.ts`. Nothing else
needs to change — `manifest.json` already exposes the image directories.

**Terrain's own SVG icons were evaluated and rejected** (e.g.
`_nuxt/img/icon--oas-bushwalking.--329572d.svg`). Three reasons, all verified against the
captured bundle in `docs/terrain.scouts.com.au/`:

- **The hashes move.** The live URL carries `--329572d`; the captured copy is `--5455e66`. Those
  are Nuxt cache-busting fingerprints, regenerated on every deploy — a hard-coded URL silently
  404s the next time Terrain ships.
- **The set is incomplete.** Terrain exposes 6 OAS icons; the page needs 9 (no camping, cycling
  or vertical). One is even named `oas-padding--unselected`, a typo in their own asset name.
- **It is not a public API.** These are internal build artifacts with no stability contract.

SVG *is* the better format, so the upgrade worth making is **local SVGs** — same reliability as
today, sharper rendering. That would only change if Terrain turns out to serve a stable unhashed
path.

### Concurrent saves — resolved

Built 2026-09-27, see `PLAN_STAGE_8_CONCURRENT_SAVE.md`. Saves now re-read immediately before
writing, detect another leader's changes via a content hash, and merge rather than overwrite —
comparing each save against the base that user loaded, so only their deliberate changes apply.

This **narrows** the loss window from minutes to a single round trip; it does not close it, since
Terrain offers no conditional write. Two leaders saving within the same few hundred milliseconds,
on the same award, in opposite directions, still resolves last-write-wins. Do not describe this
as making concurrent saves safe.

### Still open

Nothing blocking. Two optional follow-ups:

- **Local SVG badge artwork.** The nine OAS skill icons are PNGs. Local SVGs would render sharper
  at any size for smaller files, with the same reliability — unlike Terrain's own hashed SVG URLs,
  which were evaluated and rejected (see "Badge artwork" above). Needs the artwork exported into
  `resources/`; the wiring is one line per file in `BADGE_ICON_FILENAMES`.
- **`.claude/DEV_NOTES.md` is out of date.** Its Present Awards entries — grouping by member, and
  the concurrent-save checksum — are both now done, and the "Badger" badge icon is partly done
  (the column exists; non-OAS types show a placeholder until artwork is added). That file is
  developer-only, so it is the user's to update rather than the agent's.

## Key references

- `.claude/OASProgression/PLAN_VUE.md` — why the second Vue instance is required
- `.claude/OASProgression/PLAN_VUESTAGE_5.md` — the Table view build, including the three CSS
  mechanics (`::v-deep`, the two 20px global overrides, the `#body.prepend` hover leak)
- `.claude/I_Statement/PLAN_STAGE_2.md` — the "second time we did this" page recipe
- `.claude/DESIGN.md` — the `--summit-*` tokens and the `--oas-vue-*` scale rule
