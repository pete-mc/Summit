<!-- @format -->

# Stage 3 — Heat-Map Visual Layout

See [PLAN.md](PLAN.md) for full context and [PLAN_STAGE_2.md](PLAN_STAGE_2.md)
for the page this stage adds visualization to. Depends on Stage 2 being
complete (the page must already fetch and render tidy rows correctly).

## Goal

Replace the flat table as the **primary** view with the heat-map matrix
layout from the GUI sketch (`resources/GUI sketch heatmap.jpeg`, described in
`.claude/INITIAL_SPECS.md`'s "## GUI" section):

- Vertically, the page shows one section per OAS stream.
- Each stream section has one row per youth member.
- Horizontally: first a "highest level obtained" column, then one
  column-group per progression level, each containing one colored square per
  i-statement in that level.

The Stage-2 flat table (`DataGrid`-based) does **not** get removed — per
PLAN.md's flat-table decision, it becomes a toggle-able secondary "view as
table" alongside this new primary heat-map view.

## New component

`src/pages/OasProgression/components/OASHeatMap.tsx`, fed by pure
`useMemo`-derived grouping from the tidy rows (no extra state-management
library needed):

```typescript
interface MemberStreamProgress {
  memberId: string;
  memberName: string;
  patrolName: string | null;
  highestStage: number | null;
  highestBranch: string | null;
  stages: Array<{
    stage: number;
    branch: string;
    cells: Array<{
      inputId: string;
      iStatement: string;
      answered: boolean;
      awarded: boolean;
      date: string | null;
    }>;
  }>;
}

function groupRowsForHeatMap(rows: OASProgressionRow[]): Record<string /* stream */, MemberStreamProgress[]>;
// Group by stream -> by member -> by stage, deriving highestStage/highestBranch
// per member (the branch/stage combo with the greatest stage number that has
// at least one answered or awarded cell — confirm exact "highest" semantics
// against the sketch/spec intent during implementation if ambiguous).
```

## Visual design

- **Cell color mapping**: unanswered = neutral/grey, answered (in-progress) =
  amber/blue, awarded = green. Before inventing a new palette, check for an
  existing semantic color-token convention in the codebase (e.g. search for a
  `design-token-contract.spec.ts` or similar) — reuse tokens if they exist
  rather than hardcoding new hex values.
- **Layout**: CSS grid is the natural fit for variable-width level
  column-groups (each stream can have a different number of levels, each
  level a different number of i-statements). Check whether the codebase
  leans heavily on table-based layouts elsewhere (e.g. `DataGrid.tsx`'s CSS
  conventions) before deciding definitively — but CSS grid is the default
  recommendation here unless that check reveals a strong reason to match
  table-based conventions instead.
- **"Highest level obtained" column**: shows the member's furthest-reached
  stage number per stream, as a simple leading column before the per-level
  column-groups (matching the sketch's "LVL" column).
- Exact pixel sizing, spacing, and typography are not load-bearing for this
  plan — iterate visually against the sketch during implementation; the
  structural requirements above are what must be correct.

## Wiring into the page

`OasProgression.tsx` (from Stage 2) gains a view-mode toggle
(`"heatmap" | "table"`, defaulting to `"heatmap"`) that switches between
rendering `OASHeatMap` (new, primary) and the existing flat `DataGrid` table
(Stage 2, now secondary). This toggle's chosen state should persist via
localStorage per PLAN.md's persistence decision (can be wired now or left for
Stage 4 alongside the other persisted filters — either is fine, but note
which was done in the Stage 3 completion notes).

## Tests

Structural/contract tests (React Testing Library, matching the style of
`calendar-render-contract.spec.ts` if that component test reads rendered DOM
structure — confirm its exact approach during implementation) for
`OASHeatMap.tsx`, asserting against fixture `OASProgressionRow[]` data:

- one section rendered per distinct stream present in the data
- one row rendered per distinct member within a stream section
- the "highest level obtained" value is correct for a constructed fixture
  case with known expected output
- the count of i-statement squares rendered per level matches the flattened
  template length for that level (i.e. no cells silently dropped or
  duplicated)
- correct color/class applied per cell state: unanswered vs. answered vs.
  awarded, using constructed fixture rows covering all three states

## Acceptance criteria

- [x] `groupRowsForHeatMap` implemented and unit-tested independently of rendering (pure function, testable with plain fixture arrays)
- [x] `OASHeatMap.tsx` renders the full sketch-matching structure: per-stream sections, per-member(+branch) rows, highest-level column, per-level column-groups, per-i-statement colored squares. Fully-awarded levels render as a solid bar (matching the sketch), not individual squares.
- [x] View-mode toggle added to `OasProgression.tsx`, switching between heat-map (primary, default) and flat table (secondary). Component-local state for now; persistence deferred to Stage 4 alongside the other filter state, per the plan's original either-is-fine note.
- [x] Structural contract tests pass, covering section/row/cell counts, branch-separation, trunk/branch column-split correctness, and color-state correctness
- [x] `npm run build` succeeds, `npm run lint` clean on new files
- [x] Manual check: unpacked extension in Edge — first pass confirmed against real unit data (solid-bar-vs-squares, separate branch rows both correct); second round of user feedback drove the layout revision below

## Post-review revision (round 2)

After the first working version, user feedback requested a structural rework
beyond the original spec above. **This superseded the original
`groupRowsForHeatMap`/`OASHeatMap.tsx` design** (member+branch flat rows) with:

1. **One shared table, one sticky header** — all 9 streams live in one
   continuous `<table>` (one `<thead>`, `position: sticky; top: 0`), not 9
   separate per-stream tables. Stream sections became `<tbody>` groups with a
   title row. This requires every stream to share the same column count
   (`allStages` = 1..maxStage across the whole unit, not per-stream), with
   trailing columns past a shorter stream's own max simply left blank.
2. **Trunk/branch row merging** — a member's shared pre-fork stages (e.g.
   Bushcraft 1-3, identical regardless of which branch you're looking at)
   render as ONE row with `rowSpan` across every branch sub-row, matching the
   reference table image the user provided. Only the post-fork stages split
   into separate branch rows.
3. **Fork point must come from the tree structure, not member progress** —
   a real alignment bug was caught during implementation: an initial version
   derived the trunk/branch column split from each member's own
   `trunkLevels.length`, which is WRONG because two members at different
   points of progress would split their columns at different points,
   misaligning the shared table. Fixed by adding
   `getTrunkStageCount(tree): number` to `buildOASProgressionRows.ts` — walks
   the tree counting stages that share the stream's own `branch_id` before
   the first fork, a fixed structural property of the stream, independent of
   any member's progress. This is threaded through:
   `fetchOASProgressionForStream` now returns `{rows, trunkStageCount}`
   (`StreamProgressionResult`) → `OasProgression.ts` accumulates
   `trunkStageCounts: Record<string, number>` per stream → passed as a prop
   through `OasProgressionTable` → `OASHeatMap` → `groupRowsForHeatMap(rows,
   trunkStageCounts)`.
4. **Hide-empty-branches toggle** — a branch (e.g. Survival Skills) with zero
   unit-wide progress is hidden by default per stream; a "Show empty
   branches" button reveals it. Computed in `groupRowsForHeatMap` as
   `emptyBranches: string[]` per stream, filtered at render time in
   `OASHeatMap.tsx` (member's underlying data is unaffected — only visibility).
5. **No wrapping, horizontal scroll instead of stacking** — i-statement
   squares never wrap (`flex-wrap: nowrap`); the whole table can be wider
   than the viewport and scrolls horizontally inside `.oas-heatmap-scroll`
   rather than trying to fit narrow columns. No zoom control — scroll only,
   per user's explicit preference.

**Data shape changes**: `MemberBranchProgress` (flat, one row per
member+branch) → `MemberStreamProgress` (one entry per member, holding both
`trunkLevels: HeatMapLevel[]` and `forkedBranches: HeatMapBranch[]`).
`StreamHeatMapData` is the new per-stream return shape:
`{members, emptyBranches, maxStage, trunkStageCount}`.

Tests were rewritten to match (49 tests total across
`buildOASProgressionRows.spec.ts` [+`getTrunkStageCount` cases],
`groupRowsForHeatMap.spec.ts`, `oas-heatmap-render-contract.spec.ts`,
`oas-progression-render-contract.spec.ts`). Full suite: 244/245 passing (the
1 failure is the pre-existing, unrelated UNC-path smoke test).

**Round 2 was superseded by round 3 below** after the user reviewed a
screenshot of this layout against a live-data render and requested further
structural changes.

## Post-review revision (round 3) — section-based layout

Round 2's trunk-merging/rowSpan design was itself replaced after further user
feedback. Key terminology correction first: in Terrain's domain, "Skill" =
the top-level OAS category (Bushcraft, Bushwalking...) and "Stream" = what
this codebase's data layer calls `branch` (Pioneering, Survival Skills) —
**not** what `OASProgressionRow.stream` means (that field is Terrain's own
API name for Skill, kept as-is to avoid an unrelated Stage-1 rename; only the
UI-facing labels/CSS/component names were renamed branch→stream).

Changes in this round:

1. **No more rowSpan/trunk-merging.** Every `(skill, stream)` pair is now an
   independent "section" with its own full title bar and its own complete
   member list — including members with zero progress in that specific
   section (previously the shared-trunk-then-split design tried to be
   clever about de-duplicating rows; the user found this harder to scan than
   just repeating the roster per section).
2. **Stream name postfixed onto the skill title.** Section titles now read
   "Bushcraft" for the base section and "Bushcraft — Pioneering" /
   "Bushcraft — Survival Skills" for forked sections (previously the stream
   name was a separate label cell next to each member row).
3. **Same LVL value across every section of a skill.** `highestStage` is
   computed once per member across the WHOLE skill (base + every stream),
   not per-section, so a member's "5" in the Bushcraft section matches their
   "5" in the Bushcraft — Pioneering section.
4. **Dark grey section title bars** (`#3b3a39`) instead of green, so only the
   progress cells themselves carry color, per user request.
5. **Core skills pinned first.** Bushwalking, Bushcraft, Camping always
   appear before other skills (which sort alphabetically after).
6. **Empty-section toggle moved outside the scrollable table**, renamed
   "Show/Hide empty streams" (previously inside the table's own scroll
   region, labeled "branches").
7. **Not-started levels render as one full-width neutral bar** (same shape
   as the completed bar, different color) instead of a row of empty squares
   — matches the visual economy of the original sketch more closely.
8. **Sticky header is now genuinely pinned**: `.oas-heatmap-scroll` has
   `max-height: 70vh` with `overflow: auto`, so the `<thead>` stays visible
   while scrolling through sections. Tradeoff: the table becomes its own
   bounded scroll region (like a spreadsheet pane) rather than growing the
   whole page — flagged to the user as a deliberate tradeoff of "always
   visible," not a bug.

**Data shape** (replacing round 2's `MemberStreamProgress`/`HeatMapStream`):
`groupRowsForHeatMap(rows, trunkStageCounts, members)` — now takes the full
unit member roster as a third argument (needed to list every member per
section, not just those with rows) — returns
`Record<string, SkillHeatMapData>` where `SkillHeatMapData = {sections:
HeatMapSection[], maxStage}` and `HeatMapSection = {skill, stream: string |
null, isEmpty, members: SectionMemberRow[]}`. `stream: null` marks the base
section. `SectionMemberRow.highestStage` is the whole-skill value described
above, not scoped to the section.

This required threading `members: TerrainUnitMember[]` further down the
prop chain: `OasProgression.ts` (already fetches members) → stores in
component `data()` → passed to `OasProgressionTable` → `OASHeatMap`.

Tests rewritten again to match (51 tests across `groupRowsForHeatMap.spec.ts`,
`oas-heatmap-render-contract.spec.ts`, `oas-progression-render-contract.spec.ts`).
Full suite: 246/247 passing (the 1 failure is the pre-existing, unrelated
UNC-path smoke test).

**Still pending**: user visual confirmation of this round-3 layout against
the reference image and live data.

## Post-review revision (round 4) — GUI polish

Small visual/UX fixes requested after round 3 was reviewed live:

1. **Title bars lightened** to `--summit-color-status-unanswered` (the same
   light grey as the incomplete i-statement squares' fill), with title text
   in the standard dark text color — replaces round 3's darker
   `--summit-color-border-default` fill, which the user felt was too dark.
2. **Sticky/duplicate scrollbar removed.** Round 3 briefly added a
   JS-synced "mirror" scrollbar above the table (two scrollable elements
   syncing `scrollLeft` on each other's `onScroll`), which the user reported
   as jittery and fighting itself when dragged — exactly the failure mode
   you'd expect from two-way scroll-sync loops. Replaced with a **pure-CSS
   flip trick**: `.oas-heatmap-scroll` and `.oas-heatmap-table` both get
   `transform: scaleY(-1)`, which moves the browser's native horizontal
   scrollbar to the top of the scroll container while rendering the table
   content right-side up again. No JS, no sync, one real scrollbar.
3. **No border on awarded (green) i-statement squares** and **unstarted
   level bars now carry the same grey border as the small incomplete
   squares** — both carried over/reconfirmed from the round-3.5 GUI-only
   pass alongside this round.
4. **Auto-hide empty trailing level columns.** `trimEmptyTrailingStages()`
   (new, in `OASHeatMap.tsx`) scans stage columns from the highest down;
   a column is hidden only if zero members have any answered/awarded cell
   in it AND every column above it is also empty (so hiding never leaves a
   gap) AND the column is above stage 4 — stages 1-4 always stay visible
   even if empty, per explicit user instruction. Recomputed per current
   filter state (hides using only currently-visible sections/members).
5. **Three text filters added** (Skill, Member, LVL), styled with the same
   `summit-form-input` convention as `DataGrid.tsx`'s per-column filter
   inputs. Skill filter matches against the rendered section title (so
   "pioneering" matches "Bushcraft — Pioneering"); Member filter matches
   member name substring; LVL filter matches the highest-stage number as a
   substring. Skill filtering hides whole sections; Member/LVL filtering
   hides individual member rows within a still-visible section (a section
   with zero matching members after filtering will look empty rather than
   disappearing — matches the same "always show all members" spirit as the
   rest of the section-based design).

6 new tests added to `oas-heatmap-render-contract.spec.ts` covering column
trimming (both the "hide empty above 4" and "never hide a non-empty column"
cases) and all three filters. Full targeted suite: 16/16 passing. Build and
lint clean.

## Post-review revision (round 5) — sticky header fix, LVL filter removed

Round 4's `scaleY(-1)` flip trick (used to move the horizontal scrollbar to
the top without JS syncing) turned out to be incompatible with
`position: sticky`: flipping the container also flips which edge "top: 0"
sticks to in the flipped coordinate space, so the header detached from the
table and scrolled independently instead of staying pinned. **Reverted** —
`.oas-heatmap-scroll`/`.oas-heatmap-table` no longer have any transform;
back to a single native scrollbar at the bottom of the (still
`max-height: 70vh`) scroll pane, which is the one configuration that keeps
sticky-header behavior correct. No further attempt at a top-positioned
scrollbar was made in this round — flagged as a known open want, not solved.

Also removed the **LVL filter box** entirely per explicit request (its
`data-oas-filter="level"` input, backing `levelFilter` state, and its test
were deleted from `OASHeatMap.tsx`/`oas-heatmap-render-contract.spec.ts`).
The LVL **column** in the table itself is unchanged — only the filter
control was removed. Skill and Member filters remain.

Separately investigated: the user asked why `member-agenda` fires
repeatedly (~every 15s) while the page is open. Confirmed via source search
that this is **not** Summit code — no `setInterval`/polling exists anywhere
in `src/`, including the OAS Progression feature. `member-agenda` is a
Terrain-native (the host Nuxt app Summit is injected into) background
refresh, unrelated to this extension.

Targeted suite after this round: 21/21 passing. Build and lint clean.

## Post-review revision (round 6) — LVL correctness fix, closing notes

**Bug found and fixed**: LVL was counting a level as "reached" if it merely
had any `answered` (in-progress) cell, not only when fully `awarded`. This
diverged from the existing OAS Summary report's semantics, where "highest
level" is unambiguously **highest awarded level** — confirmed by reading
`OasReport.ts`, which filters achievements to `status === "awarded"` before
`OasReportItem` ever computes a per-branch highest stage; an in-progress
achievement is invisible to that report entirely. Fixed `highestStageOf` in
`groupRowsForHeatMap.ts` to only count a level where `level.complete` is
true (i.e. every i-statement in it awarded), matching that precedent.

**A second, deeper bug surfaced while fixing the first one**: the
whole-skill `highestStage` (computed once per member across every section
of a skill, per round 3's "same LVL everywhere" design) grouped a member's
rows into levels **by stage number alone**, not by `(branch, stage)`. Two
different forked streams can legitimately share a stage number (e.g. both
Pioneering and Survival Skills have their own "stage 4") — grouping by
stage alone silently merged their i-statement cells into one combined
"level," so an awarded Pioneering stage 4 got dragged back down to
"incomplete" by an unrelated, unawarded Survival Skills stage 4. This bug
existed since round 3 but was masked by the original (wrong) "any progress
counts" logic, which never checked per-level completeness in the first
place. Fixed by adding `highestAwardedStageAcrossBranches()`, which groups
by branch first, computes each branch's own highest-awarded-stage
independently, then takes the max across branches — so a stage awarded in
one stream is never suppressed by a same-numbered stage in a sibling
stream.

**Takeaway for future changes to this file**: any code that aggregates
`OASProgressionRow[]` into "levels" must group by `(branch, stage)`, not
`stage` alone, whenever the rows being combined could span more than one
branch/stream — `buildLevels()` itself is safe to call on rows already
scoped to a single branch (as `buildSection` does per-section), but is
NOT safe to call directly on a whole skill's mixed-branch rows, which is
exactly the mistake this round fixed.

3 tests added/adjusted in `groupRowsForHeatMap.spec.ts` (one proving
in-progress-only no longer counts, one proving a same-numbered sibling
stream doesn't suppress an awarded stage). Full project test suite: 252/253
passing (only the pre-existing, unrelated UNC-path smoke test fails). Build
and lint clean.

**Stage 3 is now considered complete** pending any further user-driven
visual/functional feedback; no outstanding known issues.
