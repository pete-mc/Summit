# Plan — Peak Award progression Summary tab

**Date:** 2026-10-07 (investigation) / 2026-10-08 (plan). **Status:** ready to implement.

## Background: why this was blocked, and how it got unblocked

The first pass at this plan (now folded into the "Investigation" section below) found that no
codebase — not Summit, not the Topo-Blazor reference, not Terrain's own shipped JS bundle —
encodes the actual Scouts Australia program rule for Peak Award eligibility. Every existing tool
(Topo's `ProgressService.GetPeakAwardSummary()`, Summit's own `PeakAward.tsx` report) just reads
Terrain's own `peak_award` achievement record's `status` field, or dumps raw counts for a human to
eyeball — neither computes the rule itself. That rule had to come from the user directly. It has
now been supplied (see "The rule" below), so this plan is for implementation.

### Investigation (2026-10-07, preserved for context)

- Achieved progress is already fully available: `fetchAllOASProgression` /
  `buildOASProgressionRows.ts` loops all 9 streams and joins templates with achievements into
  `OASProgressionRow[]` (`memberId`, `stream`, `branch`, `stage`, `answered`, `awarded`, `date`),
  and `groupRowsForHeatMap`/`groupSectionsByMember` already regroup that by member. This plan reuses
  that plumbing unchanged — no new API calls.
- `OASProgressionRow` does NOT carry `achievement.section` — turned out not to matter. A Terrain
  "unit" is a single section (one Cub unit, one Scout unit, etc.), so every member returned by
  `fetchUnitMembers()` shares the same current section, available once via
  `TerrainState.getSectionName()` (`src/helpers/TerrainState.ts`), returning one of
  `TerrainAchievementsSection`'s values: `"cub" | "joey" | "rover" | "scout" | "venturer"`. No
  per-member section lookup is needed.
- Bushcraft's "Pioneering and/or Survival Skills" split (as worded in the rule) is a `branch`
  distinction inside the single `stream: "bushcraft"`, not two separate streams — confirmed via
  `getTrunkStageCount`'s own comment ("Bushcraft stages 1-3 before splitting into
  Pioneering/Survival Skills at stage 4") and `OAS_STREAMS` (`buildOASProgressionRows.ts:338`),
  which lists `bushcraft` once. So "Stage 5 in Bushcraft (Pioneering and/or Survival Skills)" is
  satisfied by `stream === "bushcraft" && stage >= 5 && awarded`, full stop — the branch taken to
  get there doesn't matter and needs no special-casing.

## The rule (supplied by user, 2026-10-08)

Per current section (one section applies per unit — see above), a member's Peak Award eligibility
has three parts, confirmed to compose as follows:

- **Core Skills** requirement counts *toward* the Progressions total (not on top of it).
- **Special** (where it exists) is a subset of Progressions too — the same stage-4+ achievements,
  called out separately because of their *stage*, not a separate achievement pool.
- So: Progressions = total awarded OAS stage-completions, across all 9 streams, needed to reach
  the peak award. Core Skills and Special are both "must include" constraints on which of those
  progressions were earned, not additional counts.

| Section  | Progressions (total) | Core Skills (Bushcraft/Bushwalking/Camping, each) | Special |
|----------|----------------------:|----------------------------------------------------|---------|
| Joey     | 3                     | Stage 1                                             | none |
| Cub      | 8                     | Stage 3                                             | none |
| Scout    | 10                    | Stage 5                                             | none |
| Venturer | 12                    | Stage 5                                             | ≥4 progressions at Stage 4 or higher (any stream) |
| Rover    | 14                    | Stage 5                                             | ≥6 progressions at Stage 4 or higher (any stream) |

"A progression" = one awarded OAS stage, in any of the 9 streams (bushcraft, bushwalking, camping,
aquatics, boating, paddling, alpine, cycling, vertical) — i.e. one row where
`OASProgressionRow.stage` is the highest **awarded** stage reached in that member+stream (matching
how the heat map already defines "highest stage" — see `highestStageOf()` in
`groupRowsForHeatMap.ts`, which requires every i-statement in a stage to be awarded). A member who
has reached stage 5 in bushwalking has earned 5 progressions in that one stream (stages 1-5), not
1 — "how many stages have you climbed" is the plain reading of "twelve progressions in the OAS,"
and it's also the only reading under which Core Skills (3 single-stage achievements) could ever be
a subset of a 12/14 total alongside 6 other streams.

## Data model

### `src/pages/OasProgression/data/peakAwardRequirements.ts` (new)

```ts
export interface PeakAwardRequirement {
  totalProgressions: number;
  coreSkillStage: number; // same stage number across bushcraft/bushwalking/camping for every section
  special: { minCount: number; minStage: number } | null; // null = no Special column content for this section
}

export const PEAK_AWARD_REQUIREMENTS: Record<TerrainAchievementsSection, PeakAwardRequirement> = {
  joey:     { totalProgressions: 3,  coreSkillStage: 1, special: null },
  cub:      { totalProgressions: 8,  coreSkillStage: 3, special: null },
  scout:    { totalProgressions: 10, coreSkillStage: 5, special: null },
  venturer: { totalProgressions: 12, coreSkillStage: 5, special: { minCount: 4, minStage: 4 } },
  rover:    { totalProgressions: 14, coreSkillStage: 5, special: { minCount: 6, minStage: 4 } },
};
```

`TerrainAchievementsSection` is imported as a runtime VALUE here (used as the Record's key type
AND to build it), so it must come from `@/shared` (`src/shared/TerrainAchievementSection.ts`, a
new file mirroring the existing `TerrainAchievementType.ts` pattern), not from
`@/types/terrainTypes` — that file is a pure ambient `.d.ts`, so its own copy of this `enum`
erases to nothing at runtime (confirmed the hard way: Jest's moduleNameMapper can't resolve a
`.d.ts` as a real module when something tries to import a value, not just a type, from it. Every
existing runtime use of a terrainTypes.d.ts enum, e.g. `TerrainAchievementsType`, already goes
through its own `@/shared` duplicate for exactly this reason — `TerrainAchievementsSection` just
didn't have one yet because nothing needed it as a value before now).

Kept as a plain constant, separate from every other OAS Progression file, exactly as the
investigation recommended — easy to correct in isolation if Scouts Australia changes the numbers.

### `src/pages/OasProgression/services/buildPeakAwardSummaryRows.ts` (new)

Pure function, no fetching — takes data already in memory (same inputs `groupRowsForHeatMap`
already takes):

```ts
export interface PeakAwardCoreSkill {
  skill: "bushcraft" | "bushwalking" | "camping";
  requiredStage: number;     // from the section's requirement
  highestAwardedStage: number; // 0 if none
  boxes: boolean[];          // length = requiredStage, boxes[i] = (i+1) <= highestAwardedStage
  met: boolean;              // highestAwardedStage >= requiredStage
}

export interface PeakAwardMemberRow {
  memberId: string;
  memberName: string;
  firstName: string;
  lastName: string;
  patrolName: string | null;
  coreSkills: PeakAwardCoreSkill[];      // always 3, order: bushcraft, bushwalking, camping
  totalProgressions: number;             // sum of per-stream highest-awarded-stage, across all 9 streams
  requiredProgressions: number;          // from requirement
  progressionBoxes: boolean[];           // length = requiredProgressions, filled left-to-right by totalProgressions (capped)
  special: {                             // null when the section has no Special rule
    count: number;                       // number of (stream, stage) progressions at stage >= minStage, across all streams
    required: number;
    boxes: boolean[];                    // length = required
    met: boolean;
  } | null;
}

export function buildPeakAwardSummaryRows(
  rows: OASProgressionRow[],
  members: TerrainUnitMember[],
  requirement: PeakAwardRequirement,
): PeakAwardMemberRow[]
```

Computation per member, reusing the existing per-(member, stream) "highest awarded stage" concept
(`highestStageOf`, already proven against the same row shape):

1. Group `rows` by `(memberId, stream)`, reuse `buildStages`-style logic (or call
   `groupRowsForHeatMap` and read `highestStage` straight off its sections — **preferred**, since
   it means this function never re-implements "what counts as awarded," just reads the same
   derived numbers the heat map already trusts) to get `highestAwardedStage(memberId, stream)` for
   all 9 streams.
2. **Core Skills**: for bushcraft/bushwalking/camping, `highestAwardedStage` directly;
   `boxes[i] = i < highestAwardedStage`, `met = highestAwardedStage >= requirement.coreSkillStage`.
3. **Progressions total**: `sum(highestAwardedStage(stream) for stream in OAS_STREAMS)`. Capped
   display at `requiredProgressions` boxes (a member who has overshot still shows all boxes green
   plus the "X of Y" text showing the true, possibly-larger X — see UI section).
4. **Special** (only when `requirement.special` is set): count of *stages* across all 9 streams
   that are `>= special.minStage` and awarded — i.e. for a stream with highest awarded stage 6 and
   `minStage = 4`, that contributes 3 (stages 4, 5, 6), not 1. This matches "4 stages above 4"
   read the same granular way as Progressions itself (see rule note above) and keeps Special
   count self-consistent as a subset of the Progressions total, not a different unit of counting.

   `special.count = sum(max(0, highestAwardedStage(stream) - (minStage - 1)) for stream in OAS_STREAMS)`,
   `met = count >= minCount`.

   Display text uses `minStage - 1` as the printed threshold (confirmed with user: "4 above 3",
   not "4 above 4" — an exclusive lower bound, "strictly greater than 3", even though the user's
   own prose example said "4 stages above 4"). So Venturer Special text reads `"{count} above 3"`,
   Rover reads `"{count} above 3"` too (same `minStage = 4` for both sections per the rule table).

This file gets its own `buildPeakAwardSummaryRows.spec.ts` (co-located under
`tests/unit/pages/OasProgression/services/`, matching this directory's existing test layout) —
cases: a member below every threshold, exactly at threshold, above threshold (overshoot display),
a section with `special: null` (Joey/Cub/Scout — no Special column content at all, see UI), and
one worked example per section using the rule table above.

## UI

### New component: `src/pages/OasProgressionVue/components/OASPeakAwardSummaryVue.vue` + `.ts`

Modeled directly on `OASHeatMapVue` — same `v-data-table` shell (`disable-sort`,
`disable-filtering`, `disable-pagination`, `hide-default-header`, `hide-default-footer`, `dense`,
hand-written `<thead>`/`<tbody>`), same square markup/classes (`oas-heatmap-squares` /
`oas-heatmap-square` / `oas-heatmap-square-awarded` / `oas-heatmap-square-unanswered` — reused
verbatim, not reinvented, since the user asked for "the exact same style of table as the heatmap,
including coloured squares").

Columns (flat, no patrol/skill section grouping the way the heat map has — one row per member):

| Member | Bushcraft | Bushwalking | Camping | Progressions | Special |
|--------|-----------|-------------|---------|---------------|---------|

- **Member**: `getMemberDisplayName(...)`, same as heat map.
- **Core Skills** group header spans the three skill sub-columns (colspan, same trick the heat
  map's stage-group header row already uses). Each sub-column renders `requiredStage` boxes
  (green = `oas-heatmap-square-awarded`, grey = `oas-heatmap-square-unanswered`), title tooltip
  "Stage N — Awarded/Not yet".
- **Progressions**: `requiredProgressions` boxes, green for the first `min(totalProgressions,
  requiredProgressions)` of them, plus trailing text `" {totalProgressions} of {requiredProgressions}"`
  (per spec: "Additional text ... so user doesn't have to count boxes"). If `totalProgressions >
  requiredProgressions`, all boxes are green and the X in "X of Y" shows the true (larger) X —
  this surfaces overshoot honestly rather than clamping it invisibly.
- **Special**: the whole column is omitted entirely (not shown as a dash/placeholder — confirmed
  with user) for sections where `requirement.special` is null (Joey, Cub, Scout). The `<thead>`'s
  colspan math and the per-row `<td>` count must both account for this: the table has 5 data
  columns (Member, Core Skills ×3, Progressions, Special) for Venturer/Rover but only 4 for
  Joey/Cub/Scout. When present: `required` boxes, green for the first `min(count, required)`,
  trailing text `"{count} above {minStage - 1}"` (confirmed with user: "4 above 3" for Venturer,
  "6 above 3" for Rover — an exclusive lower bound, not the minStage value itself).

No skill icons needed here (the heat map's per-section icon doesn't apply to a flat per-member
table) — row grouping is member-only, matching the spec's single flat table.

### Filters

The spec says "follow heatmap functionality" for Member / Patrol / SortBy / Name, but the heat
map's full `OASProgressionFiltersVue` also includes Skills/Stages/Show-dropdown/Group-by/Break-by-
patrol controls that don't apply to this summary (there's no stage range or skill visibility to
narrow — the table always shows all 3 core skills + Progressions + Special). Building a new, small
filters component rather than reusing `OASProgressionFiltersVue` wholesale:

**New component**: `src/pages/OasProgressionVue/components/OASPeakAwardSummaryFiltersVue.vue` +
`.ts` — four controls only:
  - Member (text search) — reuses the same substring-match convention as the heat map's
    `memberFilter`.
  - Patrol (multi-select) — reuses `filterMembersByPatrol`/`collectPatrolNames`/
    `hasUnassignedMembers`/`UNASSIGNED_PATROL` from `filterHeatMapSections.ts` unchanged; same
    "empty selection = nothing shown" convention as the Heat Map tab (not Worksheets' "empty =
    show everyone") for consistency within this page.
  - Sort By: First Name / Last Name only (no "Stage" option — a Peak Award summary row has no
    single "current stage," unlike the heat map, so "stageProgress" is dropped entirely rather
    than included-but-meaningless). Reuses `sortMembers()` (it already supports exactly
    `"firstName" | "lastName"`).
  - Name (display format dropdown) — reuses `NameFormatSelect.vue` / `getMemberDisplayName`
    unchanged.

### Filter state & persistence

Extend `OASProgressionVueFilterState` (`OASProgressionVueFilterPersistence.ts`) with a `"summary"`
view mode and its own filter keys, independent of the heat map's (matching how Worksheets keeps
`worksheetVisibleSkills` etc. separate from the heat map's `visibleStreams` — same reasoning:
narrowing one view must not silently narrow another):

```ts
viewMode: "summary" | "heatmap" | "table" | "worksheets"; // "summary" added, and made the DEFAULT / first tab
summaryMemberFilter: string;
summaryNameFormat: NameFormat;
summarySelectedPatrols: string[] | null; // same null-until-resolved sentinel as selectedPatrols
summarySortBy: "firstName" | "lastName";
```

`DEFAULT_FILTERS.viewMode` changes from `"heatmap"` to `"summary"` (spec: "Make it the first
tab") — this also changes the page's default landing tab for any user who has never customized
their filters; a returning user's own saved `viewMode` is unaffected since `loadInitialFilters`
spreads stored values over the defaults. `VALID_VIEW_MODES` gains `"summary"`.

### Wiring into `OasProgressionVueContent`

- `.vue`: add `<v-tab tab-value="summary">Summary</v-tab>` as the **first** `<v-tab>` (before
  Heatmap), and a new `<template v-if="hasContent && filters.viewMode === 'summary'">` block
  (placed first, before the Heatmap block) containing `OASPeakAwardSummaryFiltersVue` +
  `OASPeakAwardSummaryVue`.
- `.ts`: needs the unit's current section to pick the right `PeakAwardRequirement` row. Threaded
  as a new required prop `section: TerrainAchievementsSection | undefined` on
  `OasProgressionVueContent` (and from there down to `OASPeakAwardSummaryVue`), sourced from
  `TerrainState.getSectionName()` — read once in `OasProgressionVue.ts`'s `loadOasProgressionData`
  alongside `TerrainState.getUnitID()` (same file that already imports `TerrainState`), stored in
  `data()` as `section`, and passed through `mountContentComponent`/`renderContent` the same way
  `members`/`trunkStageCounts` already are. If `section` is undefined (not yet resolved, or an
  adult-leader-only profile with no section) the Summary tab's table renders a single "Could not
  determine this unit's section" message instead of a table — no silent fallback to a guessed
  section, since picking the wrong row would show a confidently wrong Peak Award gap to a leader.
- No PDF/Excel export wired up for this tab in this pass — the spec doesn't ask for one, and the
  export row's `v-if="filters.viewMode === 'heatmap' | 'table' | 'worksheets'"` branches already
  have no `else` case, so Summary simply shows no export button (same as how a brand new tab with
  no export arm defaults today). Can be added later as its own small follow-up if asked for.

## Post-implementation correction (2026-10-08, user feedback on first build)

Two issues found once the Summary tab was first visible against real data:

1. **Layout**: the Progressions/Special trailing text ("X of Y" / "X above Y") was wrapping onto
   its own line below the boxes instead of sitting beside them, and the two-row `<thead>` had no
   bottom border. Fixed by wrapping each cell's boxes + text in a `display: flex; flex-wrap:
   nowrap` row, and adding explicit header border/centering CSS (OASPeakAwardSummaryVue.vue) —
   the heat map has no equivalent two-row header, so there was no existing shared rule to reuse.

2. **Data bug — cross-section counting**: Progressions was summing a member's highest-ever-awarded
   stage per stream across their WHOLE OAS history, not just their current section. A member who
   had progressed through Cub and Scout before becoming a Venturer showed inflated counts (e.g.
   "32 of 12") because stages earned years earlier, in lower sections, were being counted toward
   the current section's own requirement. User's instruction: "Progressions must be made in the
   unit they are currently in. At this point in time, don't count stages made in lower sections.
   But in the future there is such things as rollover progressions" — i.e. the fix for now is a
   hard cutoff (only count achievements recorded against the CURRENT section), with the door left
   open for a future "rollover" concept that would let some earlier-section progress count.

   Fixed by threading `achievement.section` through onto `OASProgressionRow.section` (previously
   dropped — this was the exact gap the original investigation (top of this plan) had already
   flagged but left unaddressed since nothing needed it yet). `buildPeakAwardSummaryRows` now
   takes a `currentSection` argument and counts Progressions/Special as DISTINCT (stream, stage)
   pairs whose own achievement `section` matches it — not the cumulative "highest stage reached"
   used for Core Skills. This is a deliberate split: Core Skills ("has this member ever reached
   stage 5 in Bushcraft") is correctly a lifetime check and is UNCHANGED by this fix — only
   Progressions/Special became current-section-scoped. See
   `progressionsInCurrentSectionByMember()`'s own comment in buildPeakAwardSummaryRows.ts.

   The heat map itself is NOT affected — `section` is additive to `OASProgressionRow`, and the
   heat map continues to show a member's whole OAS history regardless of section, which is correct
   for that view (it's a progress-tracking tool across a member's whole Scouting life, not scoped
   to one section's requirement).

## Second round of polish (2026-10-08, after seeing real data)

Four more refinements once the current-section fix was visible against real data:

1. **Special's condition text in the header**: added a second header row under "Special" (only
   when `hasSpecial`), showing e.g. "4 above Stage 3" — the condition itself, mirroring how Core
   Skills shows "Bushcraft"/"Bushwalking"/"Camping" under its own group header. Sourced from a new
   `specialConditionText` computed in OasProgressionVueContent.ts.
2. **Member-cell Special wording changed to "X of Y"**, matching Progressions' own wording, instead
   of the earlier "X above Y" — the condition/threshold text now lives only in the header (above),
   so the per-member cell just needed to say how many of the total a member has, consistently with
   Progressions.
3. **Tooltips** on every box: Core Skills boxes show "Awarded - {Section} - (Date)"; Progressions/
   Special boxes show "Awarded - {Skill/Stream} - (Date)". This needed `OASProgressionRow.section`
   (already threaded through for the current-section fix) and `date` to flow further than before —
   `buildPeakAwardSummaryRows.ts` was reshaped so every box carries its own `StageAward` (`{stream,
   stage, section, date}` or null when unmet) instead of a bare boolean, replacing the earlier
   `boolean[]` box arrays with `PeakAwardBox[]` (`{met, award}`).
4. **Box coloring to match the heat map**: an individual met box is now purple
   (`oas-heatmap-square-answered`, not `-awarded`) rather than green — green is reserved for the
   collapsed state. Once EVERY box in a cell (Core Skills skill / Progressions / Special) is met,
   the whole cell collapses into one wide green bar (`oas-heatmap-stage-bar-complete`) sized to
   exactly match the combined width of the boxes it replaces (`barWidthPx()` in
   OASPeakAwardSummaryVue.ts: `count * 18px + (count-1) * 1px`, mirroring `.oas-heatmap-square`'s
   own dimensions), with its own single tooltip "Awarded - Stage {x} - (Date)" using the last
   award's date. This mirrors the heat map's own bar-complete/squares split in
   OASHeatMapVue.ts's `buildStageCellView`.

`buildPeakAwardSummaryRows.ts`'s internal computation was also simplified in this pass: rather than
going through `groupRowsForHeatMap` (which only surfaces a stage NUMBER, not its own section/date),
it now computes `StageAward[]` directly from the raw `OASProgressionRow[]`, grouping cells by
`(memberId, stream, stage)` and keeping a stage's award only once every cell in it is awarded —
same rule as `highestStageOf()` in groupRowsForHeatMap.ts, just inlined so section/date survive
alongside the stage number for the new tooltips.

## Build order

1. `peakAwardRequirements.ts` (data) + its own trivial spec (shape/lookup sanity).
2. `buildPeakAwardSummaryRows.ts` (pure logic) + spec — the riskiest part to get right, so tested
   in isolation before any UI exists.
3. Thread `section` prop from `OasProgressionVue.ts` down through `OasProgressionVueContent`
   (no visible change yet — verify via existing tests/a quick console log that the right section
   string arrives).
4. `OASPeakAwardSummaryVue.vue`/`.ts` (table), built against fixture data first (no live Terrain
   needed to check layout/box math).
5. `OASPeakAwardSummaryFiltersVue.vue`/`.ts` (filter bar).
6. Wire both into `OasProgressionVueContent`, flip the default tab, extend filter persistence.
7. Manual verification in the live extension (per `.claude/DESIGN.md`/project convention: build,
   load unpacked, check the Summary tab against a real unit's data) before calling this done.
