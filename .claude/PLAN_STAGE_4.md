<!-- @format -->

# Stage 4 — Filter/Display Features

See [PLAN.md](PLAN.md) for full context and [PLAN_STAGE_3.md](PLAN_STAGE_3.md)
for the heat-map component these filters layer onto. Depends on Stage 3 being
complete.

## Goal

Implement the four filter/display requirements from `.claude/INITIAL_SPECS.md`'s
"## GUI" section, each as additive, independently-togglable UI state layered
onto Stage 3's `OASHeatMap` component. Each is backed by a small pure helper
function (independently unit-testable) and persisted via localStorage, per
PLAN.md's confirmed persistence decision — matching the existing
`SummitCalendarDraftPersistence.ts` pattern (try/catch-wrapped, JSON
round-trip, module-level key constants).

## Features

### 1. Hide surname

Trivial display toggle: when active, render only `memberName.split(" ")[0]`
(or equivalent first-name extraction) instead of the full name, wherever
member names are rendered in `OASHeatMap.tsx`.

### 2. Codename obfuscation

```typescript
export function getCodename(memberId: string): string;
```

Deterministic hash of `memberId` into a word from a fixed list (per PLAN.md's
codename decision: same member always gets the same codename across
sessions/screenshots — not randomized per session). A simple approach: hash
the `memberId` string to an integer (e.g. a basic string hash function), mod
into a fixed array of ~50-100 simple codewords (animal names, NATO alphabet,
or similar — pick something recognizably a placeholder, not accidentally
meaningful). Keep the word list and hash function together in one new file,
e.g. `src/pages/OasProgression/services/getCodename.ts`.

When active, this replaces the member-name display entirely (interacts with
"hide surname" — decide interaction: codename mode likely supersedes/disables
the surname toggle rather than combining, since a codename already fully
replaces the name; confirm this makes sense visually during implementation).

### 3. Patrol filter / break

Two related behaviors, both keyed off `member.patrol?.name` (the verified-
correct field — **not** `member.groups`, see PLAN.md's codebase-facts
section):

- **Filter**: a multi-select (imitate the native `<select multiple>` +
  `<optgroup>` pattern from `buildGroupedMemberOptions` in
  `SummitCalendarValidation.ts` for the control's *shape*, but group by
  `patrolName` instead of that helper's `groups` field) that hides members
  not in the selected patrol(s) from all stream sections.
- **Break**: when active, sub-groups each stream section's rows by
  `patrolName` (an extra grouping level within `groupRowsForHeatMap`'s
  output, or a wrapper around it), rendering a patrol sub-heading between
  groups of member rows.

`patrolName` is already threaded through in `OASProgressionRow` from Stage 1
— no additional data join needed at render time.

### 4. Deselect OAS streams

A checkbox list or multi-select over the 9 stream names
(`TerrainAchievementsStream` enum values), filtering which stream sections
`OASHeatMap` renders. Simple state array of "visible streams," defaulting to
all 9 selected.

### 5. Horizontal zoom to level range

```typescript
// component-local state, e.g.:
const [levelRange, setLevelRange] = useState<[number, number]>([1, maxLevelAcrossAllStreams]);
```

Slices which stage/level column-groups render per stream section. Must
handle streams with different maximum levels gracefully — e.g. if the range
is `[3, 5]` and a stream only has levels 1-3, that stream shows only level 3;
don't render empty/broken column-groups for out-of-range levels. A simple
two-handle range slider or two number inputs (min/max) is sufficient UI;
exact control choice is not load-bearing.

## Persistence

All of the above (hide-surname toggle, codename toggle, patrol filter
selection, break-by-patrol toggle, stream deselect selection, level range) are
saved to localStorage on change and restored on page mount, following
`SummitCalendarDraftPersistence.ts`'s style. Suggest one consolidated
persisted object (e.g. `summit.oasProgression.filters`) rather than one
localStorage key per filter, to keep load/save simple:

```typescript
interface OASProgressionFilterState {
  hideSurname: boolean;
  useCodenames: boolean;
  selectedPatrols: string[]; // empty = no filter (show all)
  breakByPatrol: boolean;
  visibleStreams: string[]; // which of the 9 streams to show
  levelRange: [number, number];
  viewMode: "heatmap" | "table"; // carried over from Stage 3 if not already wired there
}
```

## Tests

- Pure-function tests: `getCodename` (same input → same output, different
  inputs → different outputs across a reasonable sample, no crash on
  empty/unusual member IDs), patrol grouping/filtering logic, stream
  filtering logic, level-range slicing logic (including the
  different-max-level-per-stream edge case).
- Component tests: `OASHeatMap` (or its wrapping filter-aware component)
  rendering correctly filtered/obfuscated/sliced output given fixture data +
  various filter-state combinations — at minimum, one test per feature
  showing it actually changes the rendered output when toggled.
- Persistence test: filter state round-trips through localStorage save/load
  correctly, matching `SummitCalendarDraftPersistence.spec.ts`'s conventions
  if that file exists (confirm during implementation), otherwise following
  the general localStorage-mock testing approach used elsewhere in this
  codebase's test suite.

## Acceptance criteria

- [x] Hide-surname toggle implemented and working
- [x] `getCodename` implemented, deterministic, unit-tested; codename toggle wired into the heat-map's name rendering
- [x] Patrol filter (multi-select, keyed off `member.patrol?.name`) and break-by-patrol both implemented and working
- [x] Stream deselect (checkbox/multi-select over the 9 streams) implemented and working
- [x] Horizontal level-range zoom implemented, correctly handling streams with differing max levels
- [x] All filter state persists via localStorage across a page reload
- [x] Pure-function and component tests pass for every feature above
- [ ] Manual check: unpacked extension in Edge — toggle each filter individually and in combination, confirm expected behavior and that state survives a page reload (pending user verification)
- [x] `npm run build` succeeds, `npm run lint` clean on new files
- [ ] Full end-to-end verification from [PLAN.md](PLAN.md)'s "Verification" section completed (pending user verification)

## Implementation notes

Built on top of Stage 3's already-existing pieces rather than duplicating them:
the heat-map/table view-mode toggle, `patrolName` threading, and the Skill/Member
text filters (added during Stage 3's rounds 3-5) were reused as-is, not
rebuilt. This stage's real additions:

- **`src/pages/OasProgression/services/getCodename.ts`** — deterministic
  `memberId` → animal-name hash (80-word list), pure and independently tested.
- **`src/pages/OasProgression/services/filterHeatMapSections.ts`** — pure
  helpers: `filterMembersByPatrol`, `groupMembersByPatrol` (patrol break, with
  a same-decision-as-user edge case: if *no* member in a section has a patrol,
  grouping is skipped entirely rather than showing a pointless single
  "Unassigned" heading), `collectPatrolNames`, `sliceStagesToRange`.
- **`src/pages/OasProgression/services/OASProgressionFilterPersistence.ts`** —
  single consolidated `summit.oasProgression.filters` localStorage key,
  matching `SummitCalendarDraftPersistence.ts`'s try/catch JSON round-trip
  style. Folds in Stage 3's `viewMode`/`skillFilter`/`memberFilter` (previously
  unpersisted) alongside the five new Stage 4 fields into one
  `OASProgressionFilterState` object.
- **`OASHeatMap.tsx` restructured from state-owner to fully controlled** — it
  used to own `showEmptySections`/`skillFilter`/`memberFilter` as internal
  `useState`; now every filter is a prop, and `OasProgressionTable` (in
  `OasProgression.tsx`) is the single owner of `OASProgressionFilterState`,
  loading it once on mount and saving on every change via a `useEffect`. This
  was necessary so one persisted object could drive both the heat-map and
  (already-existing) the flat-table toggle.
- **Codename supersedes hide-surname** (per user decision): the hide-surname
  checkbox is `disabled` whenever "Use codenames" is checked, rather than
  letting both apply at once.
- **Patrol break UI only appears when at least one member has a patrol** at
  all (`availablePatrols.length > 0` gates both the "Break by patrol"
  checkbox and the patrol checkbox list) — avoids showing dead controls for
  units that don't use Terrain's patrol field.
- **Level range** uses two plain number inputs (min/max, 1-9) rather than a
  slider, per the plan's "exact control choice is not load-bearing" note.

11 new/changed test files, 43 new tests across pure-function specs
(`getCodename.spec.ts`, `filterHeatMapSections.spec.ts`,
`OASProgressionFilterPersistence.spec.ts`) and component specs
(`oas-heatmap-render-contract.spec.ts` rewritten for the new controlled-prop
contract, `oas-progression-render-contract.spec.ts` extended with
persistence/toggle/filter coverage). Full suite: 287/288 passing (the 1
failure is the pre-existing, unrelated UNC-path smoke test). Build and
targeted lint clean.

**Still pending**: user manual verification in the unpacked Edge extension
against live unit data.

## Post-review fix — awarded status must override stale per-cell answer matching

User-reported (via `.claude/DEV_NOTES.md`, example: Alba Survival Stage 4):
a level already Awarded to a member sometimes rendered as individual
i-statement squares (some grey/unanswered) instead of the solid green
"complete" bar.

**Root cause**: `applyAchievementsToMatrix` (`buildOASProgressionRows.ts`), in
its "awarded + populated `answers`" branch, only marked a row `answered`/
`awarded` if that row's current `inputId` had a matching key in the
achievement's stored `answers` object. OAS templates get edited over time
(wording changes, added/removed i-statements); a member awarded under an
older template version has `answers` keyed by the *old* `inputId`s, which no
longer match the current template's `inputId`s used to build the row matrix.
Any row whose i-statement changed after the award was silently left
`answered: false, awarded: false`, even though the achievement's own
`status` was unambiguously `"awarded"`.

**Fix**: once an achievement's status is awarded, every row for that
`(member, stream, branch, stage)` is now unconditionally stamped
`answered: true, awarded: true` — matched cells still get their real
per-answer date via `applyAnswersToMemberRows`; unmatched cells fall back to
`achievement.status_updated`. The achievement's overall status is treated as
authoritative and is never second-guessed by a per-cell key match. This also
removed a now-redundant separate "empty answers" branch, since the unified
logic handles both cases (`applyAnswersToMemberRows` is a safe no-op on an
empty/missing `answers` object).

This fix sits in Stage 1's data layer (`buildOASProgressionRows.ts`) rather
than Stage 3's heat-map rendering, since `HeatMapLevel.complete` (Stage 3)
already correctly derives from `cells.every(c => c.awarded)` — the bug was
purely in upstream data, not in the heat-map's own logic. It also improves
LVL accuracy from Stage 3 round 6 (`highestStageOf`/
`highestAwardedStageAcrossBranches`), since those also depend on `awarded`
being correct per cell.

One test updated (its old assertion encoded the bug as expected behavior)
and one new regression test added in `buildOASProgressionRows.spec.ts`,
reproducing the exact stale-inputId-with-awarded-status scenario. Full
suite: 288/289 passing (the 1 failure is the pre-existing, unrelated
UNC-path smoke test). Build and lint clean.

## Post-review polish — section title size, LVL renamed to Stage, next-stage progress indicator

Three more `.claude/DEV_NOTES.md` items, resolved one at a time:

1. **Section title bars now render at 16px** (`--summit-font-size-lg`, new
   token) instead of 14px, matching member-name text size; stayed bold
   (`font-weight-semibold`, unchanged). `.oas-heatmap-member-name` also now
   explicitly sets 16px rather than relying on implicit inheritance.
2. **"LVL" renamed to "Stage" everywhere user-visible**: the heat-map's
   highest-level column header, and the level-range filter's "Levels" label
   (now "Stages"). Internal code identifiers (`HeatMapLevel`, `buildLevels`,
   `LevelCell`, `highestStageOf`, `data-oas-level` attributes, the `level`/
   `levels` field names) were deliberately left as-is per "maintain core
   summit/terrain naming" — only user-facing text changed, not the data
   model or test/code selectors.
3. **Next-stage progress indicator** (`formatStageProgress`, new pure
   function in `filterHeatMapSections.ts`): the Stage column now shows e.g.
   "5" with a smaller trailing ".02" when the member has 2 i-statements
   ticked (answered or awarded — confirmed with user) in the stage
   immediately above their highest AWARDED stage. Scoped **per section**,
   not per whole skill: it looks for `highestStage + 1` only within that
   section's own `levels` list (confirmed with user), so a shorter forked
   stream that doesn't reach that stage number simply shows the plain stage
   number with no suffix, rather than a wrong or borrowed progress count.
   Zero-padded to at least 2 digits (`String(count).padStart(2, "0")`); not
   shown at all when there's no next stage in this section, the next stage
   has zero progress, or `highestStage` is null. Rendered as a separate
   `<span className="oas-heatmap-stage-progress">` styled at
   `--summit-font-size-sm` (12px) so it reads visually smaller than the main
   stage number, per user request.

7 new tests added (`formatStageProgress` pure-function cases in
`filterHeatMapSections.spec.ts`); existing render-contract tests needed no
changes (fixture data used in the affected test happened to have zero
progress in the next stage, so no `.xx` suffix was expected either way).
Full suite: 293/294 passing (the 1 failure is the pre-existing, unrelated
UNC-path smoke test). Build and lint clean.

## Post-review cleanup — "level" fully renamed to "stage" in generated code

Follow-up to the previous entry's user-facing-only rename: user asked
whether the underlying code itself (not just visible labels) still used
"level," pointing out that Terrain's own API/data model never uses that
word anywhere — the raw OAS tree endpoint's field is literally `"stage"`
(see PLAN.md's recorded live API shape), and the existing OAS Summary
report is built entirely around `stage` too. Confirmed "level" was purely a
naming choice introduced within this feature's own code, not something
inherited from Terrain — so there was no deeper API terminology being
contradicted, just internal inconsistency to clean up.

Renamed throughout `src/pages/OasProgression/` and its tests: type
`HeatMapLevel`→`HeatMapStage`; function `buildLevels`→`buildStages`;
component `LevelCell`→`StageCell`; field `SectionMemberRow.levels`→`.stages`
(and every call site: `member.levels`→`member.stages`,
`buildSection`'s `l.stage`→`s.stage`, etc.); prop/state `levelRange`→
`stageRange` (`OASHeatMapProps`, `OASProgressionFilterState`,
`OasProgressionTable`'s `MAX_LEVEL`→`MAX_STAGE`); CSS classes
`.oas-heatmap-level-*`→`.oas-heatmap-stage-*`,
`.oas-heatmap-highest-level(-header)`→`.oas-heatmap-highest-stage(-header)`,
`.oas-heatmap-level-range`→`.oas-heatmap-stage-range`; DOM test-selector
attributes `data-oas-level-range`→`data-oas-stage-range`,
`data-oas-level="min"/"max"`→`data-oas-stage="min"/"max"`,
`oas-heatmap-level-min`/`-max` element ids→`oas-heatmap-stage-min`/`-max`.
Also tidied the one remaining prose mention in `OasProgression.vue`'s
on-page description ("i-statement level" → "i-statement detail").

`stageRange` in `OASProgressionFilterPersistence.ts` is a renamed field in
the persisted localStorage shape — safe with no migration needed since this
feature is still pre-release (no real users have the old `levelRange` key
saved).

All test fixtures/assertions updated to match (`.levels`→`.stages` in
`groupRowsForHeatMap.spec.ts` and `filterHeatMapSections.spec.ts`,
`data-oas-level`→`data-oas-stage` selectors in both render-contract specs).
Full suite: 293/294 passing (the 1 failure is the pre-existing, unrelated
UNC-path smoke test). `tsc --noEmit`, lint, and build all clean — the only
remaining `tsc`/lint output is the same pre-existing, unrelated errors in
`DataGrid.tsx`/`PresentAwards.tsx` that predate this feature.

## Post-review additions — member sort-by, Plan/Do/Review grouping, patrol-break confirmed

Three more `.claude/DEV_NOTES.md` items:

1. **"Group by Patrols, off by default" confirmed already satisfied** — no
   code change needed. `breakByPatrol` already defaults to `false`
   (`DEFAULT_FILTERS`), and the whole patrol UI (checkbox list + "Break by
   patrol" toggle) is gated behind `availablePatrols.length > 0`, so a unit
   that has never assigned patrols never even sees the controls — exactly
   "initialised off if never used."
2. **Member sort-by**, confirmed with user as one global control (not
   per-section) applied everywhere: `sortMembers(members, sortBy)`, new pure
   function in `filterHeatMapSections.ts`, with `MemberSortBy = "surname" |
   "firstName" | "stageProgress"`. Surname/first-name sorts fall back to the
   other name field on a tie. `"stageProgress"` (the "Stage.xx" option)
   sorts by `highestStage` descending first, then by the Stage.xx
   next-stage-progress count descending as a tiebreaker within the same
   stage — confirmed with user (a "5.08" ranks above "5.02", both above a
   plain "5"); a null `highestStage` always sorts last. Applied inside
   `SectionRows` in `OASHeatMap.tsx`, before the existing patrol-filter/
   patrol-break logic, so patrol sub-groups also respect the chosen sort
   order. New `sortBy` field added to `OASProgressionFilterState`
   (persisted, defaults to `"firstName"`) and a `<select>` control
   (`data-oas-sort-select`) added to `OasProgression.tsx`'s filter bar.
3. **Plan/Do/Review visual identification** — discussed three options with
   the user (letter-in-square, tinted-shade-per-group, grouped-gap+hover);
   user chose the grouped-gap + hover-label approach as cheapest and
   cleanest at the heat-map's small (16px) square size. Required first
   threading `inputGroup` (already present on `OASProgressionRow`, just not
   previously copied through) into `HeatMapCell` via `buildStages()`.
   `StageCell` in `OASHeatMap.tsx` now adds an `.oas-heatmap-square-group-start`
   class (extra left margin, new CSS rule) to the first square of each new
   consecutive `inputGroup` run within a stage — safe to rely on cells
   already being Plan→Do→Review ordered, since `fetchOASProgressionForStage`
   sorts by the template's `sortIndex` before reaching the heat-map. Hover
   tooltips now read `"Plan: I can pack appropriate gear..."` instead of
   just the bare i-statement text. A `data-oas-cell-group` attribute was
   also added per square for testability.

10 new tests added (`sortMembers` pure-function cases in
`filterHeatMapSections.spec.ts`; Plan/Do/Review grouping, tooltip prefix,
and sortBy-affects-render-order in `oas-heatmap-render-contract.spec.ts`;
the sort `<select>` control's default and re-sort behavior in
`oas-progression-render-contract.spec.ts`). Full suite: 303/304 passing
(the 1 failure is the pre-existing, unrelated UNC-path smoke test). `tsc
--noEmit`, lint, and build all clean.

## Post-review fix — removed the bounded vertical scroll box

User feedback: the heat-map felt wrong sitting in its own scrollable "frame"
inside the page. Root cause: Stage 3 round 3 gave `.oas-heatmap-scroll` a
`max-height: 70vh; overflow: auto` specifically so `position: sticky` on the
`<thead>` had a bounded scrolling ancestor to stick within (`position:
sticky` only pins relative to its nearest actual scrolling ancestor) — that
was flagged at the time as a deliberate tradeoff ("spreadsheet pane" rather
than "grows with the page"), not a bug, but the user now wants the natural
page-scroll behavior instead.

**Fix**: `.oas-heatmap-scroll` no longer sets a vertical `max-height`/
`overflow: auto` — only `overflow-x: auto` (horizontal scroll for wide
tables is kept) and `overflow-y: visible`. The table now grows to its full
natural height and the outer Summit/Terrain page scrolls normally; the
`<thead>`'s existing `position: sticky; top: 0` now sticks relative to
whatever actually scrolls (the page), so the header stays pinned to the top
of the browser viewport while scrolling the page, rather than being pinned
inside a bounded box. No JS changes — purely a two-line CSS change. If
Terrain's own page chrome (nav bar, etc.) turns out to overlap the sticky
header once tested live, the fix is a small `top` offset, not a structural
change.

CSS-only change, no test suite impact. Build clean.

## Post-review fix — sticky header hidden underneath Terrain's fixed app bar

Exactly the "small top offset" caveat flagged above turned out to be
needed. User reported the header "isn't really sticky" after the previous
fix — the whole page (table + header) just scrolled together. Confirmed via
the live page's rendered HTML (`header.v-app-bar--fixed` with `style="height:
80px"`, and `main.v-main` with `style="padding: 80px 0px 49px"` to clear
it) that Terrain's own Vuetify app bar is `position: fixed` at the very top
of the viewport, 80px tall. Our `<thead>`'s `position: sticky; top: 0` WAS
sticking correctly — but at `top: 0`, which is directly underneath
Terrain's fixed 80px header, so the sticky effect was invisible: the header
row scrolled up until it hit the top of the viewport, then disappeared
behind Terrain's own app bar instead of resting visibly just below it.

**Fix**: `.oas-heatmap-thead th`'s `top: 0` → `top: 80px`, matching
Terrain's app bar height exactly, so our sticky header now rests just below
it instead of hiding behind it.

**Known fragility, flagged to user, not fixed here**: 80px is read directly
off Terrain's currently-rendered app bar height and hardcoded — if Terrain
changes that header's height in a future update (or it varies by
viewport/responsive breakpint, e.g. on mobile), this offset would need
updating too. No dynamic measurement (e.g. reading the app bar's actual
height at runtime via `getBoundingClientRect()`) was implemented, since
that would add real complexity (a ResizeObserver or mount-time
measurement) for a value that's been stable so far — flagged as a possible
future improvement if Terrain's header height turns out to change.

CSS-only change, no test suite impact. Build clean.

## Post-review revert — sticky header abandoned, plain fixed header row instead

The `top: 80px` fix did not work as intended: the user's screenshot showed
the header row stuck partway down the page, overlapping the Bushwalking
section's rows underneath it, rather than cleanly pinning below Terrain's
app bar during scroll. Sticky positioning inside a real, unpredictable
Terrain/Vuetify page layout (fixed app bar, animated/scroll-responsive
height, unknown ancestor stacking contexts) proved too fragile to get right
without more back-and-forth live testing than the feature is worth.

**Decision (user-directed): drop `position: sticky` entirely.**
`.oas-heatmap-thead th` is now a plain (non-sticky, non-positioned) header
row — it renders once at the top of the table and then scrolls away with
the rest of the page like any normal table header, exactly as it would
without any of the sticky-related CSS from the last three rounds. The
table still grows to its full natural height (from the earlier
"remove the bounded vertical scroll box" round) and the page scrolls
normally.

**Net effect across all three of the last rounds**: the heat-map is now a
plain table — full natural height, no inner scrollbar, no sticky anything
vertically. Horizontal scroll (`.oas-heatmap-scroll { overflow-x: auto }`)
and the horizontal-sticky skill-title column (`left: 0`, unaffected by any
of this) are unchanged. If a "header stays visible while scrolling" want
resurfaces later, it would need a genuinely different approach (e.g. a
small floating/duplicate header bar with its own JS-driven visibility, not
CSS `position: sticky` against Terrain's page chrome) — not attempted here,
flagged as an abandoned want rather than silently dropped.

CSS-only change, no test suite impact. Build clean.

## Post-review redesign — filter bar cleanup, per a reference mockup

User provided a mockup image and a written punch list, saying the filter
bar had become "all over the place" (accumulated across many rounds).
Planned via plan mode (`start-by-reading-the-prancy-noodle.md`), with
several rounds of clarifying questions answered before implementation.

**Changes made**:
1. **Reload**: removed all 9 per-stream reload buttons; kept a single
   icon-only "Reload all" button (Unicode `↻` glyph — no icon library
   exists in this project) with `title="Refresh data"`. `onReloadStream`
   stays on `OasProgressionTableProps`/wired in the Vue layer
   (`OasProgression.ts`'s `reloadStream` method is untouched, still a
   valid capability) — only its 9 UI buttons were removed here.
2. **View toggle**: replaced the two separate `Heat map`/`Table` buttons
   with a small page-scoped sliding two-segment control
   (`.oas-slide-toggle`) — no reusable/generic Toggle component exists in
   this codebase, so this was built new and kept local to this file.
   Same `data-action`/`aria-pressed` semantics preserved, so most existing
   view-toggle test selectors needed no changes.
3. **Skill filter box removed entirely** — the text input, `skillFilter`
   field on `OASProgressionFilterState`, and the corresponding prop/filter
   line in `OASHeatMap.tsx`. Skill filtering is now handled solely by the
   Skills dropdown (below), which already existed as `visibleStreams`.
4. **`.oas-heatmap-filter-label`** font-size: 12px → 16px, matching table
   text size (same token, `--summit-font-size-lg`, introduced in an
   earlier round).
5. **"Streams" renamed to "Skills"** (correct Terrain terminology — see
   PLAN.md) and converted from a row of 9 checkboxes to a collapsed
   dropdown multi-select ("All skills (9)" / "N selected").
6. **Stage range**: the two `type="number"` inputs became two
   `<select>` dropdowns (1–9), matching the existing `sortBy` select and
   `DataGrid.tsx`'s "Rows per page" select convention.
7. **Patrol control** (confirmed with user): same dropdown-multi-select
   treatment as Skills, still gated behind `availablePatrols.length > 0`.
8. **Full mockup match** (confirmed with user, beyond the written list):
   added a **Reset filters** button (`data-action="reset-filters"`) that
   restores `DEFAULT_FILTERS` while preserving the current `viewMode` (so
   resetting doesn't kick the user out of Table view); grouped **Use
   codenames** / **Hide surname** / **Break by patrol** under a labeled
   `<fieldset>` **"Display"** group; added a 🔍 search-icon affordance to
   the Member search input.

**New component**: `DropdownMultiSelect` (local to `OasProgression.tsx`,
not extracted to `src/components/` — no existing multi-select-dropdown
precedent in this codebase to build on, and this is currently only needed
in two places within one file). Closes on outside-click or Escape.
Important semantic nuance handled carefully: `visibleStreams` (Skills) is
a literal allowlist where empty means "show nothing" (existing
`.includes()` check in `OASHeatMap.tsx`), while `selectedPatrols` is
"empty means no filter / show all" (existing `filterMembersByPatrol`
semantics) — the shared dropdown component itself stays a dumb literal-
selection renderer; the "empty means all" resolution for Patrol is handled
at the call site (`selected={filters.selectedPatrols.length === 0 ?
availablePatrols : filters.selectedPatrols}` and the matching
`togglePatrol` logic), not baked into the shared component, so Skills and
Patrol keep their correct, different semantics without a leaky abstraction.

**New file, `src/pages/OasProgression/services/getSkillIconUrl.ts`** —
mid-session addition: the user added 9 skill icon PNGs to
`resources/GUI...`-adjacent files (`Alpine.png`, `Aquatic.png` — note
singular vs. the code's plural `aquatics` key, `Boating.png`,
`Bushcraft.png`, `Bushwalking.png`, `Camping.png`, `Cycling.png`,
`Paddling.png`, `Vertical.png`) and asked for them rendered next to each
section title. This required more than an `<img>` tag:
- Copied into `src/images/oas-skills/` (this extension's existing
  `CopyPlugin` config already copies all of `src/images` → `dist/images`
  wholesale, so no webpack change was needed).
- **`manifest.json` required a real change**: this is a content script
  injected into `terrain.scouts.com.au`, not an extension-owned page, so a
  plain relative image path would not resolve. `chrome.runtime.getURL()`
  is required (same pattern already used by `summitloader.js` for the
  main script) — and MV3 additionally requires the resource path to be
  explicitly listed in `web_accessible_resources`, or the browser silently
  blocks the page from loading it. Added a second entry to that array:
  `{"resources": ["images/oas-skills/*"], "matches":
  ["https://terrain.scouts.com.au/*"]}`.
- **New ambient type declaration**: no `@types/chrome` package exists in
  this project (confirmed) and adding it for one function felt heavier
  than needed. Added a minimal `declare const chrome: { runtime: {
  getURL(path: string): string } }` to the existing `src/types/Global.d.ts`
  (already the home for this project's other ambient browser-global
  declarations, e.g. `window.$nuxt`).
- `OASHeatMap.tsx`'s skill-title cell renders the icon (20×20px,
  `alt=""`, `data-oas-skill-icon={skill}`) via `getSkillIconUrl(section.skill)`
  before the title text — returns `null` (renders nothing) for an
  unmapped key rather than a broken image.
- Test approach: `chrome.runtime.getURL` doesn't exist in Jest/jsdom (no
  existing `chrome.*` mock anywhere in this codebase) — added a minimal
  inline mock (`(global as ...).chrome = { runtime: { getURL: (p) =>
  \`chrome-extension://test/${p}\` } }`) directly in both render-contract
  spec files, consistent with this project's existing practice of mocking
  browser/DOM APIs inline in spec files rather than adding a new shared
  mock file for one function.

18 new/changed tests across `oas-heatmap-render-contract.spec.ts` (skill
icon rendering, `skillFilter` prop/test removed) and
`oas-progression-render-contract.spec.ts` (icon-only reload button +
single-reload-control assertion, per-stream-reload test removed, Patrol/
Skills dropdown interactions replacing checkbox-row tests, stage `<select>`
dropdowns replacing number-input tests, Reset filters, Skills dropdown
default summary text, search-icon presence). Full suite: 305/306 passing
(the 1 failure is the pre-existing, unrelated UNC-path smoke test). `tsc
--noEmit`, lint, and build all clean; confirmed the 9 icon files and the
updated `web_accessible_resources` entry are present in `dist/`.

**Not built** (explicitly confirmed out of scope with user): the mockup's
"Active filters" removable-chip row, and mobile-responsive layout (the
mockup's phone views were a style reference only).

## Post-review fix — chrome.runtime.getURL is not reachable from where the icon code actually runs

User-reported live error: `Uncaught TypeError: Cannot read properties of
undefined (reading 'getURL')` thrown from `OASHeatMap`, plus a second
identical error outside the component.

**Root cause — a real architectural gap missed during planning**:
`summitloader.js` (the actual Manifest V3 content script, which DOES run
in the isolated content-script world with `chrome.runtime` available)
does not run the React app itself. It only creates a `<script>` tag
pointing at `scripts/summit.js` and injects it into the *page's own*
`<head>`. Once injected that way, `summit.js` — the whole bundled React/
Vue app, including `OASHeatMap` — executes in the **page's main world**,
which is a completely different JS execution context than the content
script. MV3 does not expose `chrome.runtime` to the main world at all, by
design (security boundary between "code the extension trusts" and "code
running on behalf of the page"). Confirmed by re-reading
`src/index.ts` (`window.$nuxt.$store...` — only reachable from the main
world, since Nuxt's own instance is a page global) and
`summitloader.js` itself. The previous round's `getSkillIconUrl()` (and
its `Global.d.ts` ambient `chrome` type) assumed `chrome.runtime` was
reachable from wherever TypeScript-compiled code ran — true for
`summitloader.js`, never true for anything in `summit.js`, which is
where `getSkillIconUrl` actually lives and runs.

**Fix**: moved the one `chrome.runtime.getURL()` call needed into
`summitloader.js` (the correct, isolated-world context for it) — it now
computes the extension's base URL once (`chrome.runtime.getURL("")`) and
stamps it onto `<html data-summit-extension-url="...">` *before*
injecting `summit.js`, since a JS global set in the isolated world is
NOT visible to the page/main-world script — a DOM attribute is the
bridge between the two worlds. `getSkillIconUrl()` (in `summit.js`,
main-world) now reads that attribute via
`document.documentElement.getAttribute("data-summit-extension-url")`
and string-concatenates the icon path onto it, returning `null` (render
nothing) if the attribute isn't present yet or the skill key is
unmapped — no more `chrome.*` call from page-world code at all. Removed
the now-unused ambient `chrome` type declaration from `Global.d.ts`
(added in the previous round, no longer needed anywhere).

Both render-contract specs' inline `chrome.runtime.getURL` mocks were
replaced with a plain `document.documentElement.setAttribute(...)` call,
matching the new mechanism. Added a new dedicated pure-function test file,
`getSkillIconUrl.spec.ts` (5 tests: no-attribute → null, unmapped skill →
null, correct URL-joining, the aquatics/Aquatic.png filename mismatch
case, all 9 skills mapped) — this function is now genuinely
unit-testable in isolation, unlike the previous `chrome.runtime`-calling
version, which could only be verified via an inline mock inside component
tests.

**Takeaway for future changes touching `summitloader.js`/`summit.js`**:
anything needing a real `chrome.*` API must be resolved in
`summitloader.js` (isolated world) and handed across to `summit.js`
(main world) via the DOM (an attribute, as done here, or similar) — never
assume `chrome` is reachable from component/service code, since almost
all of this extension's own code (everything under `src/pages`,
`src/components`, `src/services`, etc.) is bundled into `summit.js` and
runs in the page's main world, not the content-script world.

24 tests changed/added across `getSkillIconUrl.spec.ts` (new, 5 tests),
`oas-heatmap-render-contract.spec.ts`, and
`oas-progression-render-contract.spec.ts` (mock mechanism swapped in
both). Full suite: 310/311 passing (the 1 failure is the pre-existing,
unrelated UNC-path smoke test). `tsc --noEmit`, lint, and build all
clean; confirmed the `data-summit-extension-url` stamping code is present
in the built `dist/scripts/summitloader.js`.

## Post-review CSS polish — filter bar layout, per a second reference image

User reported the redesigned filter bar still looked "clunky" compared to
the reference mockup (`ChatGPT Control Image.png`), even after the
previous round's rebuild of it. Re-examined the mockup at full resolution
and found the actual structural difference: each filter (Member, Streams,
Stage, Sort by, Display) is its own small bordered box sitting side by
side in one row — not, as built in the previous round, a flat unbordered
row of label-over-control pairs. The "View" row above it (View label +
slide toggle + reload icon + Reset filters, right-aligned) has no
box/border at all — it sits directly on the page.

**Fix**: `.oas-field` (the label+control wrapper already introduced last
round for each filter) now has its own `border`, `border-radius`, and
padding — a real per-filter box matching the mockup — while the outer
`.oas-progression-panel` wrapper had its border/background/padding
**removed** (it's now just a plain vertical flex stack for spacing
between the View row and the filter row, not a card). `DropdownMultiSelect`
was updated to emit its label+button inside the shared `.oas-field`
wrapper rather than its own separate flex row, so Skills/Patrol get the
same boxed treatment as Member/Stage/Sort by/Display for free.

**Limitation, disclosed rather than glossed over**: this session has no
way to render a screenshot of the actual page — the `Artifact` tool's
`read` action returns raw HTML source, not a visual capture, and there is
no other rendering tool available. Verification here was done by
re-reading the mockup image carefully, reasoning through the CSS/flexbox
layout by hand, confirming the build compiles and all 40 component tests
still pass (pure CSS change, no markup selectors broken), and rebuilding
`dist/`. **This has not been visually confirmed against the live page**
— unlike previous rounds in this stage, where the user's own screenshot
let concrete pixel-level problems be diagnosed, this round is a best-
effort match from image inspection alone and may need another round of
adjustment once seen live.

CSS-only change (plus the `DropdownMultiSelect` JSX wrapper adjustment
in `OasProgression.tsx`). Tests: 40/40 passing in the two affected
component spec files. Build clean.

## Post-review fix round 2 — three concrete issues from a live screenshot

User sent a live screenshot after the previous round; three real bugs
identified, one request explicitly declined:

1. **Filter row should be ONE full-width box, not five separate boxed
   fields.** Misread of the mockup in the previous round — each field
   (Member, Skills, Stage, Sort by, Display) had gotten its own bordered
   `.oas-field` box. Moved the border/background/padding from `.oas-field`
   up to the shared `.oas-heatmap-controls` row instead — `.oas-field`
   is back to being just an unstyled label+control stack, and the whole
   row is one bordered card. Also added explicit `width: 100%; box-sizing:
   border-box` to `.oas-heatmap-controls`, since it was shrink-wrapping to
   content width instead of spanning the page/table width as shown in the
   screenshot (a plain `display: flex` block-level div should stretch to
   its parent's width by default, but wasn't — made it explicit rather
   than continuing to rely on unverified ancestor flex behavior).
2. **Display checkboxes were stacking vertically instead of horizontally**
   — a real CSS bug, not a mockup-matching judgment call. Root cause: the
   `<fieldset>` carries both `.oas-field` (from the shared field-wrapper
   pattern, `flex-direction: column`) and `.oas-heatmap-display-group`
   classes; `.oas-heatmap-display-group` never explicitly set its own
   `flex-direction`, so `.oas-field`'s `column` value silently won by
   source order (both rules have equal specificity — one class each — so
   whichever appears later in the file only wins for properties it
   actually declares). Fixed by adding `flex-direction: row` explicitly
   to `.oas-heatmap-display-group`. **Takeaway for future changes to this
   file**: whenever two classes are combined on one element and both come
   from different "concerns" (a shared layout utility class like
   `.oas-field` plus a component-specific class), any property the
   shared utility sets must be explicitly re-declared on the specific
   class if it needs a different value — it will NOT be naturally
   "overridden" just because the specific class is semantically more
   relevant.
3. **Dark-blue Terrain color (#253642) for the table header/toggle,
   replacing the dark green** — asked whether this should be scoped to
   OAS Progression only or replace the shared `--summit-color-bg-primary`
   token everywhere (that token also drives buttons, focus rings, and the
   Calendar page elsewhere in the extension). **User declined this
   change entirely** ("Don't do this change") — left as dark green,
   unchanged, not implemented in any scope.

CSS-only change. 40/40 tests still passing in the two OasProgression
component spec files (no markup/selectors touched). Build clean.

## Post-review fix round 3 — vertical alignment, separators, single-switch toggle, Reset filters placement

Four items from the user, closer visual iteration on the live screenshot:

1. **Display checkboxes vertically centered, not top-aligned** —
   `.oas-heatmap-controls`'s `align-items: flex-start` → `center`, so the
   taller Display fieldset (label + wrapped checkbox row) centers against
   the row's shorter single-line fields instead of hugging the top.
2. **Partial vertical line separators between filter items**, matching
   the mockup. Added a `::after` pseudo-element on `.oas-field` (fixed
   28px height, centered via `top: 50%; transform: translateY(-50%)`) —
   deliberately NOT a full-height border, since field heights vary
   (Display is taller than a single input) and a full-height line would
   look uneven; a short centered line reads as a clean "partial" divider
   regardless of the tallest neighbor. Applied to `:not(:last-child)`
   only, so nothing trails after Reset filters.
3. **View toggle is now a single switch, not two independent buttons**
   — "any click on it flips the state, like on most phones." Restructured
   `.oas-slide-toggle` from a `role="radiogroup"` wrapping two `<button>`s
   (each with its own `onClick`) into one native `<button role="switch"
   aria-checked={viewMode === "table"}>` wrapping two non-interactive
   `<span data-action="...">` halves — a single `onClick` on the outer
   button flips between `"heatmap"`/`"table"` regardless of which half
   (or the gap between them) was clicked. `data-action="view-heatmap"`/
   `"view-table"` attributes were kept on the inner spans (now for
   styling/testing hooks and `aria-pressed` visual state only, not
   separate click targets) — existing tests that dispatch a click at
   those elements kept working unchanged, since a bubbling click event
   reaches the real handler on the parent button either way.
4. **Reset filters moved inside the filter box, right-aligned** — was
   living in the top "View" row; moved to be the last child of
   `.oas-heatmap-controls` (after the Display fieldset), using its
   existing `margin-left: auto` to push it to the far right within that
   same bordered row. Consequence: Reset filters is now only rendered in
   Heat map view (inside the `filters.viewMode === "heatmap"` branch,
   same as the rest of the filter row) — previously it was visible in
   both views. Not flagged as a problem since Reset filters resets
   heat-map-specific filters that don't apply to the flat Table view
   anyway; the "resets filters" test was rewritten to click it while in
   Heat map view (its only reachable location) rather than switching to
   Table first.

One existing test needed rewriting (`resets filters...`, since Reset
filters' location changed) and one new test was added specifically for
item 3's new interaction contract (single-switch click-anywhere-flips
behavior, both directions, asserting `aria-checked`). Full suite:
311/312 passing (the 1 failure is the pre-existing, unrelated UNC-path
smoke test). `tsc --noEmit`, lint, and build all clean.
