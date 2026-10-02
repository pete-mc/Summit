<!-- @format -->

# PLAN_STAGE_1.md — Data layer

No UI in this stage. Pure functions only, fully unit-testable without a browser.

New file: `src/pages/OasProgressionVue/services/buildWorksheetPages.ts`
New file: `tests/unit/pages/OasProgressionVue/buildWorksheetPages.spec.ts`

## 1. No new fetching — the data is already loaded

Verified 2026-10-01 by reading
[`buildOASProgressionRows.ts`](../../src/pages/OasProgression/services/buildOASProgressionRows.ts):
`OASProgressionRow` (line 15) already carries every field a worksheet page needs.

| Worksheet element | `OASProgressionRow` field | Note |
| ----------------- | ------------------------- | ---- |
| Page's Skill | `stream` | Terrain's field name for what the UI calls **Skill**. |
| Page's Stream | `branch` | Terrain's `branch`; the UI calls this **Stream**. Equals `stream` on the trunk. |
| Page's Stage | `stage` | 1–9. |
| Row group band | `inputGroup` | `Plan` / `Do` / `Review` / `Verify`. |
| Row text | `iStatement` | |
| Column | `memberId`, `memberName`, `patrolName` | |
| Cell | `answered`, `awarded`, `date` | `date` is `YYYY-MM-DD` or a raw passthrough. |

**The stream/branch naming trap.** `row.stream` is the *Skill* and `row.branch` is the
*Stream*. This is Terrain's naming, not the UI's, and it is backwards from what the
words suggest. `filterHeatMapSections.ts` has a comment on `OAS_SKILLS` (line 10)
warning about exactly this. Name the worksheet's own fields `skill` and `stream`
after the **UI** meaning and map once at the boundary, so the confusion stops here.

So this stage imports types and reuses existing helpers. It fetches nothing.

## 2. Reuse, don't duplicate

`displayName(memberName, memberId, hideLastName, useCodenames)` already exists at
[`OASHeatMapVue.ts:64`](../../src/pages/OasProgressionVue/components/OASHeatMapVue.ts#L64)
but is **module-private**. The worksheet needs identical behaviour — the same member
must get the same codename on the heat map and on the worksheet, or the two views
contradict each other.

**Extract it** to a new shared service
`src/pages/OasProgression/services/getMemberDisplayName.ts`, and have
`OASHeatMapVue.ts` import it rather than keeping its own copy. It is four lines; the
point is that there is one of them. `getCodename` already lives in that folder, so
this is where its caller belongs too.

Also reuse, all already exported from
[`filterHeatMapSections.ts`](../../src/pages/OasProgression/services/filterHeatMapSections.ts):

| Symbol | Line | Use |
| ------ | ---- | --- |
| `OAS_SKILLS` | 15 | Skill ordering and the "all skills" default. |
| `sliceStagesToRange` | 72 | Stage from/to filtering. |
| `filterMembersByPatrol` | 18 | Patrol filtering. |
| `groupMembersByPatrol` | 33 | "Break by patrol". |
| `sortMembers` | 213 | — **see the caveat below.** |

⚠️ **`sortMembers` takes `SectionMemberRow[]`, not a worksheet member.** It is built
around the heat map's own per-stage cell structure (its `stageProgress` mode reads
`member.stages`). The worksheet's member list is a flat `(memberId, memberName,
patrolName)` triple with no stage structure, so **do not** try to reshape worksheet
members into `SectionMemberRow` to reuse it.

Write a small local sort instead, supporting only `firstName` / `lastName` — the
`stageProgress` mode is meaningless here, because a worksheet page is already fixed
to one stage. Lift `lastNameOf`/`firstNameOf` (currently module-private at
`filterHeatMapSections.ts:160-167`) into exports and reuse those two, so name-splitting
rules stay in one place.

## 3. Types

```ts
/** A member's column on every page of the set. Same members, same order, every page. */
export interface WorksheetMember {
  memberId: string;
  /** Already resolved through codenames / hide-last-name — the string to print. */
  displayName: string;
  patrolName: string | null;
}

/** One row: an I-Statement, plus one cell per member in `WorksheetPageSet.members` order. */
export interface WorksheetRow {
  inputId: string;
  iStatement: string;
  /** Same length and order as `WorksheetPageSet.members`. */
  cells: WorksheetCell[];
}

export interface WorksheetCell {
  /** Terrain's completion date as `YYYY-MM-DD`, or null when there is nothing to show. */
  date: string | null;
  answered: boolean;
  awarded: boolean;
}

/** A Plan/Do/Review/Verify band. Only emitted when it has at least one row. */
export interface WorksheetGroup {
  /** "Plan" | "Do" | "Review" | "Verify", or whatever the template actually used. */
  title: string;
  rows: WorksheetRow[];
}

/** One printed page: one Skill × Stream × Stage. */
export interface WorksheetPage {
  key: string;
  /** UI meaning: Terrain's `row.stream`. e.g. "bushwalking". */
  skill: string;
  /** UI meaning: Terrain's `row.branch`. Equals `skill` on the trunk. */
  stream: string;
  stage: number;
  /** "Stage 5 - Bushwalking", or "Stage 4 - Pioneering" for a named stream. */
  title: string;
  groups: WorksheetGroup[];
  /**
   * This page's own member columns, index-aligned with every `WorksheetRow.cells` on
   * this page. Normally identical to `WorksheetPageSet.members`; narrower only when
   * "Hide completed" has dropped someone from this page. See §4a.
   */
  members: WorksheetMember[];
}

export interface WorksheetPageSet {
  /** The full column set before any per-page "Hide completed" narrowing. */
  members: WorksheetMember[];
  /** Present only when "break by patrol" is on; same members, grouped. */
  patrolGroups: WorksheetPatrolGroup[] | null;
  pages: WorksheetPage[];
}
```

`cells` as a positional array parallel to `members` (rather than a map keyed by
`memberId`) is deliberate: the template renders a `<td>` per member per row, and
index-aligned iteration is both cheaper and impossible to get subtly out of order.
`OASHeatMapVue.ts` already uses this idiom for its stage cells — see the comment at
its `MemberRowView.cells` (line 158).

## 4. The builder

```ts
export interface BuildWorksheetPagesOptions {
  visibleSkills: string[];
  stageRange: [number, number];
  selectedPatrols: string[];
  memberFilter: string;
  hideLastName: boolean;
  useCodenames: boolean;
  breakByPatrol: boolean;
  /** Drops a member's column from pages where they have completed that Skill/Stage. See §4a. */
  hideCompleted: boolean;
  sortBy: "firstName" | "lastName";
}

export function buildWorksheetPages(
  rows: OASProgressionRow[],
  options: BuildWorksheetPagesOptions,
): WorksheetPageSet;
```

Steps, in this order — the order matters:

1. **Build the member list first, from the whole unfiltered row set**, then apply the
   member-name filter, patrol filter, and sort. This is what makes "every filtered
   member gets a column on every page" true: the columns are decided once for the
   set, not per page. Deriving them per page would reintroduce the varying-columns
   behaviour that was explicitly rejected (see PLAN.md).
2. Resolve each member's `displayName` through the extracted
   `getMemberDisplayName` — once, here, not in the template.
3. Filter rows to `visibleSkills` and to `sliceStagesToRange`.
4. Group the surviving rows into pages by `(stream, branch, stage)` — i.e. by
   `(skill, stream, stage)` in UI terms.
5. Within a page, group by `inputGroup`, preserving **template order, not alphabetical**.
   `fetchOASProgressionForStage` already returns rows sorted by the template's own
   `sortIndex` (line 294–295), so first-seen order is the template's order. Sorting
   the group titles would put `Do` before `Plan`. **Emit no group that has no rows.**
6. Within a group, one `WorksheetRow` per distinct `inputId`, cells in `members` order.
7. **Apply "Hide completed" per page** (see §4a). Do this last, after the page's rows
   and cells are fully built — it is a column-dropping pass over a finished page, not a
   filter threaded through the earlier steps.
8. Sort pages by Skill in `OAS_SKILLS` order (not alphabetical — matches the heat map),
   then by stage ascending, then trunk stream before named streams, then stream name.

## 4a. "Hide completed" — the one per-page column exception

PLAN.md decision 1 says every filtered member gets a column on every page. **"Hide
completed" is the single deliberate exception**, and it is opt-in and off by default,
so the default behaviour still matches decision 1 exactly.

The option exists because a page whose whole point is "what is left to check off"
should not waste a column on someone with nothing left. A member who has finished a
Stage does not need a column on that Stage's sheet.

```ts
/** A member has completed this page when every cell in its every row is awarded. */
```

**Use `awarded`, not `answered`.** `answered` means an in-progress submission has
touched the statement — often every statement of a stage sitting in `pending_review` —
so keying off `answered` would hide members who have submitted but not been approved,
which is exactly who a leader is still chasing. `awarded` means the Unit Council
approved it. Per `applyAchievementsToMatrix` (line 192–198) an awarded stage stamps
every cell `awarded`, so this check is reliable: it is true for a genuinely finished
stage and false otherwise.

Consequences to handle, not work around:

- **`WorksheetPage.members` can be narrower than `WorksheetPageSet.members`**, and
  `WorksheetRow.cells` must be narrowed in lockstep. The cells array is positional, so
  dropping a column means splicing the same index out of every row on that page. Build
  the keep-list of indices once per page and map every row through it — do not
  recompute per row, and do not leave the arrays different lengths. This is the main
  thing that can go subtly wrong in this stage.
- **A page can empty out completely.** If every member has the stage awarded, the page
  has no columns left. **Drop the whole page** rather than printing an empty grid — a
  sheet with statements and no columns to tick is not useful. Note this means a leader
  who turns the option on may see fewer pages, which is the intent.
- **Stage 3 must read columns from `page.members`**, never from `pageSet.members`, or a
  narrowed page renders its cells against the wrong headers. `pageSet.members` is for
  the "break by patrol" grouping and nothing else.

When `hideCompleted` is false, set `page.members = pageSet.members` by reference and
skip the pass entirely — same behaviour as today, no narrowing code in the path.

### Page titles

`"Stage " + stage + " - " + title`, where `title` is the title-cased Skill when
`branch === stream` (trunk), and the title-cased **Stream** otherwise. This reproduces
the sample's own sheet names: `Stage 1 - Bushcraft` (trunk) and `Stage 4 - Pioneering`
(named stream of Bushcraft).

Title-casing: reuse the heat map's existing helpers rather than inventing a casing rule.
Verified 2026-10-01 in `OASHeatMapVue.ts` — both are **module-private, so export them**:

| Helper | Line | Behaviour |
| ------ | ---- | --------- |
| `skillTitle(skill)` | 42 | Looks up `SKILL_TITLES` (line 22), falls back to the raw id. |
| `formatStream(stream)` | 46 | Splits on `-`, upper-cases each word's first letter. |

⚠️ **Known cosmetic discrepancy, don't "fix" it silently.** `formatStream` produces
Title Case, so `survival-skills` → `Survival Skills`, while the xlsx sheet is named
`Survival skills` (sentence case). Match the **heat map**, not the spreadsheet: the same
stream must be labelled identically on both Summit views, and Topo's casing is not
authoritative over our own page. Mention it to the user if they notice; do not add a
second casing function to match the reference.

### Cell dates

Pass `row.date` through unchanged — it is already `YYYY-MM-DD` from
`applyAchievementsToMatrix`, or a raw string when parsing failed. **Do not format it
here.** Display formatting is the component's job in Stage 3; keeping the service's
output ISO-ish keeps the tests readable and locale-independent.

A cell is "complete" when `answered || awarded`. Note from
`applyAchievementsToMatrix` (line 192–198) that an awarded stage stamps *every* cell
answered+awarded with a fallback date, deliberately — so a fully awarded stage prints
as a fully dated page. That is correct, not a bug to work around.

### Awarded cells are a distinct visual state

`awarded` is kept separate from `answered` on `WorksheetCell` specifically so the
component can paint it. **An awarded cell renders as a light green box, the same green
the heat map uses for its complete state** (`--summit-color-status-awarded`, `#b3c9b3`)
— see Stage 3 for the rendering. Three states, not two:

| `answered` | `awarded` | Renders as |
| ---------- | --------- | ---------- |
| `false` | `false` | Empty bordered box, for a handwritten tick |
| `true` | `false` | The date, on a plain background |
| `true` | `true` | The date, on a light green box |

Because an awarded stage stamps the whole stage, an awarded page prints as a solid
block of green — which is the intended signal: the leader can see at a glance there is
nothing left to check off on that sheet. The service's job is only to carry the
`awarded` flag through faithfully; it decides nothing about colour.

## 5. ES5 trap — no `Set` spread

`[...new Set(x)]` silently yields `[]` in this repo's build target. Use a
`filter`/`indexOf` dedupe, or `Array.from`. This has bitten this codebase before.

## 6. Tests

`tests/unit/pages/OasProgressionVue/buildWorksheetPages.spec.ts`. Hand-written
fixtures, small — not captured real data. Cover:

- One page per `(skill, stream, stage)`; a stream fixture (Bushcraft trunk stages 1–3
  plus Pioneering stage 4) produces the sample's own page split.
- **A member with no progress in a Skill/Stage still gets a column on that page**,
  with all-null cells. This is decision 1 from PLAN.md — the test is the guard.
- Members are identical, and in identical order, across every page in the set.
- Group bands appear in template order (`Plan`, `Do`, `Review`, `Verify`), and a
  group with no rows is absent entirely — fixture it on the sample's own
  `Stage 1 - Bushcraft`, which has a one-row `Review` and no further `Verify`.
- `cells` is index-aligned with `members` — a fixture where member 2 of 3 is the only
  one with a date asserts the date lands at `cells[1]`.
- Stage range and visible-skill filters drop whole pages, not rows within a page.
- `useCodenames` produces the same codename `getCodename` gives for that `memberId`;
  `hideLastName` yields the first name; `useCodenames` wins when both are set
  (matching the heat map's own precedence).
- `breakByPatrol` populates `patrolGroups`, and leaves it `null` when off.
- Page order follows `OAS_SKILLS`, not alphabetical.
- An awarded stage yields dated cells across the whole page (the line 192 behaviour),
  each flagged `awarded: true` so Stage 3 can paint it green.
- A cell that is `answered` but not `awarded` keeps `awarded: false` — the three-state
  table above depends on these not being conflated.

"Hide completed" (§4a) — these are the guards for the trickiest part of the stage:

- Off by default: with `hideCompleted: false`, every page's `members` equals
  `pageSet.members` (decision 1 still holds).
- On, with one of three members fully awarded on one page only: that page has two
  columns, the other pages still have three.
- **`cells` stays index-aligned after narrowing.** Fixture three members where the
  *middle* one is awarded, assert the surviving cells are members 1 and 3's values in
  that order. An off-by-one here is the failure mode most likely to ship unnoticed.
- A member who is `answered` but not `awarded` is **not** hidden — the pending-review
  case the §4a note calls out.
- A page where every member is awarded is dropped from `pages` entirely.
- `pageSet.members` is unchanged by the option — only per-page `members` narrow.

## Verification

`npm test` passes including the new spec. `npx tsc --noEmit` adds no new errors
beyond the known pre-existing ones (DataGrid generics ×3, OASHeatMap ref,
PresentAwards ref) — diff against `git stash` to be sure.

The one existing-behaviour risk in this stage is the `displayName` extraction.
Confirm the heat map still renders codenames and hidden last names correctly after
it — that is a live-browser check, not a test.
