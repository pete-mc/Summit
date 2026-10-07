# Names dropdown + Hide dropdown + heat map styling fixes

Source: `.claude/DEV_NOTES.md` "Heat Map" / "Worksheets" sections (read-only; never edited
by an agent — this file is the durable record of the work instead).

## Decisions made via collaborative dialog

- **Names dropdown**: single-select, options Full Name / First Name / FirstName.L /
  F.LastName / Code Name. Replaces "Use codenames" + "Hide last name" entirely on both the
  Heat Map and Worksheets filter bars.
  - Single-word names (no last name to abbreviate) show the literal string `"Scout"` for the
    two initial-style formats, rather than a malformed trailing/leading dot.
  - Built as **one shared component**, `src/components/NameFormatSelect.vue` (+ `.ts`),
    following the `SummitLoadingState.vue` precedent in `.claude/DESIGN.md` ("a shared
    component beats a shared class") — so future pages can reuse it.
  - Each view keeps its **own separate state field** (`nameFormat` for the heat map,
    `worksheetNameFormat` for worksheets) — matches the existing
    `useCodenames`/`worksheetUseCodenames` split; a leader can want codenames on screen but
    full names on a printed worksheet.
- **Hide dropdown** (Heat Map only — Worksheets has no equivalent): multi-select checklist
  with 5 fully independent options: Empty skills rows, Empty top stages, Awarded, Not
  started, Answered. The existing `onlyInProgress` boolean (which hid "complete" and
  "not started" together) is **split** into two independent booleans, `hideAwarded` and
  `hideNotStarted`, so all 5 are independent. `hideEmptyStreams`/`hideEmptyTopColumns`/
  `hideAnswered` already existed as independent booleans and are unchanged, just re-homed
  under the new dropdown's UI instead of individual checkboxes.
- **"Complete" → "Awarded"**: renamed everywhere that state is labelled to a user — the
  heat map's collapsed "stage bar" tooltip text, specifically (`OASHeatMapVue.ts`'s
  `buildStageCellView`). The CSS state class `oas-heatmap-square-awarded` already used this
  name; no class rename needed, only the tooltip string.
- Skills chips control (both Heat Map and Worksheets filter bars) is **hidden from the UI
  only** — `visibleStreams`/`worksheetVisibleSkills` state and filtering logic are untouched,
  so nothing downstream needs to change; the control just doesn't render.

## Why

The two name-display checkboxes and the four-separate hide-ish checkboxes had grown
organically (see `OASProgressionFiltersVue.vue`'s git history) and the "Skills" chip-select
duplicated functionality already available via the heat map's structure (skills are already
visually grouped). Consolidating into two dropdowns reduces the filter bar's visual weight
without removing any filtering capability.

## Where things live post-change

- `src/components/NameFormatSelect.vue` / `.ts` — new shared component.
- `src/pages/OasProgression/services/getMemberDisplayName.ts` — extended with the
  `NameFormat` union and the two new initial-style formats + `"Scout"` fallback.
- `src/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence.ts` — filter
  state shape: `nameFormat`, `worksheetNameFormat` replace the four old booleans;
  `hideEmptySkillRows`/`hideEmptyTopStages`/`hideAwarded`/`hideNotStarted`/`hideAnswered`
  replace `hideEmptyStreams`/`hideEmptyTopColumns`/`onlyInProgress`/`hideAnswered`.
- No localStorage migration shim — stale keys are simply unread; defaults backfill missing
  fields the same way any other shape change has always been handled on this page.

## Explicitly out of scope

- `src/pages/IStatements/components/IStatementHeatMap.vue` (parallel heat map, kept in sync
  via `.claude/I_Statement/PLAN_STAGE_6_MATCH_OAS.md`) is **not** touched by this change. If
  it should mirror these controls too, that's a separate, deliberate follow-up.

## Revision (after first live Edge test)

Testing the above in Edge surfaced three corrections, applied in the same working session:

- **Skills select was wrongly removed entirely** instead of just hiding its selected-skill
  chip row. Restored the `v-select` itself on both Heat Map and Worksheets filter bars; the
  chips stay gone (that part of the original request was correct).
- **"Hide" dropdown inverted to "Show"**: double-negative framing replaced with positive,
  all-on-by-default selections. Filter-state fields renamed `hideX` → `showX` (and
  `worksheetHideCompleted` → `worksheetShowCompleted`), all defaulting `true`. No migration
  of old saved values — old keys are simply unread, same as every prior rename here.
- **Bug fix**: "Not started" (`showNotStarted`) had wrongly suppressed individual unanswered
  squares inside an in-progress stage, not just whole not-started stages. Per the user: a
  "Not Started" stage is any single stage, for any single member, for any single skill, with
  zero answered/awarded I-Statements — i.e. only the existing `bar-unstarted` case.
  `showNotStarted` now has no effect once a stage reaches the `squares` branch in
  `buildStageCellView()` (`OASHeatMapVue.ts`).
- **Visual grouping**: the Show dropdown's items are grouped under Vuetify subheaders —
  "Skills" (Empty skills, Empty top stages), "I Statements" (Awarded, Not started, Answered),
  "Grouping" (Break by patrol) — using Vuetify 2's native `{ header }`/`{ divider: true }`
  item entries, no custom slot needed.
- **"Empty Skills rows" renamed to "Empty skills"**.
- **Display fieldset removed entirely** from both filter bars. Its sole remaining item,
  "Break by patrol", moved into the Show dropdown (Heat Map: conditionally present via a
  computed `showOptions`, same `availablePatrols.length > 0 && groupBy !== "member"` gating
  the old checkbox had). Worksheets' Display fieldset (Break by patrol, Hide completed)
  became its own smaller Show dropdown the same way.
- The now-dead `.oas-heatmap-display-group`/legend-measurement CSS (and its own test file,
  `oas-filters-display-heading-size.spec.ts`) was removed along with the fieldset — that CSS
  existed solely to work around a `<legend>` not sharing Vuetify's label-scaling transform,
  which no longer applies once the `<legend>` is gone.

## Second revision (after a further live Edge test)

- **Row vertical-align bug, finally located**: "all row content middle" had one silent
  exception — `.oas-heatmap-highest-stage` (the Stage progress cell, e.g. "3.2b") explicitly
  overrode the table-wide `vertical-align: middle` default back to `top`. That override was
  added in an earlier round on a mistaken reading of `.claude/DEV_NOTES.md`'s "(Stage values,
  eg x.yy, are NOT!)" as describing the *target* state rather than the *bug being reported*.
  Removed the override; checked the rest of the heat map CSS and confirmed it was the only
  cell class overriding the table default, so no other hidden exceptions exist.
- **Show dropdown's subheader/divider sizing**: Vuetify's `v-select` renders its dropdown menu
  detached to `<body>` via `v-menu` (`attach` not set), so scoped `::v-deep` CSS in the `.vue`
  file cannot reach `v-subheader`/`v-divider` inside it — confirmed by checking `v-select`'s
  own `attach` handling and that no prior Vuetify-overlay styling in this codebase goes
  through scoped CSS (the one precedent, Terrain's nav menu, is in the global stylesheet).
  Fixed via `:menu-props="{ contentClass: 'oas-vue-show-menu' }"` on the Heat Map's Show
  select, with matching rules added to `src/styles/index.css` (shrinks `v-subheader`'s default
  fixed 48px height and padding, removes `v-divider`'s visible border) — scoped to that one
  class so no other dropdown on the page is affected.
- **Stage from/Stage to combined into one "Stages" multi-select**, matching the Show
  dropdown's own pattern (chips-free, "N selected" summary). True multi-select, not a
  contiguous range — selecting stages 2 and 5 shows only those two. This changed the
  underlying data shape: `stageRange: [number, number]` → `visibleStages: number[]` in
  `OASProgressionVueFilterState` (and `worksheetStageRange` → `worksheetVisibleStages`).
  `filterHeatMapSections.ts`'s `sliceStagesToRange()` (range-based) was kept as-is because
  the legacy React OAS Progression page (`OASHeatMap.tsx`) still uses it with its own
  `stageRange` prop — a new `sliceStagesToVisible()` (set-membership based) was added
  alongside it for the Vue page and `buildWorksheetPages.ts` to use instead. The two
  functions now serve two different consumers; this is not a stray duplication.
- **Worksheets "Completed" renamed to "Awarded"** — matches what the underlying
  `worksheetShowCompleted`/`hideCompleted` option actually keys on (`buildWorksheetPages.ts`'s
  own docstring: "keyed on `awarded`, not `answered`"), so the new label is more accurate to
  the real behaviour, not just a cosmetic rename.

## Known bug, noted but not fixed (out of scope for this round)

**The Patrol filter (`OASProgressionFiltersVue.vue`/`.ts`) is unusable when the unit has
exactly one patrol.** Not introduced by this work — pre-existing — but found while answering
a question about how the Patrol filter relates to "Break by patrol."

Root cause: `selectedPatrolsForDisplay` (`OASProgressionFiltersVue.ts` lines 82-88) substitutes
the full `availablePatrols` list for display whenever the real stored state (`selectedPatrols`)
is empty — because `filterMembersByPatrol` treats an empty array as "no filter, show
everyone," the checkbox needs to *look* fully checked when nothing is actually filtered.
The `@change` handler (`OASProgressionFiltersVue.vue` line 25) is a raw passthrough,
`patch({ selectedPatrols: $event })`, with no reconciliation against this substitution — a
comment on line 86 references a method, `onPatrolsChange`, that would presumably do that
reconciliation, but it does not exist anywhere in the file. It looks like a fix was planned
and never finished.

With 2+ patrols this mostly works (unchecking one from the substituted full list leaves a
real, non-empty subset, which is a legitimate filtered state). With exactly 1 patrol it
cannot work: the single checkbox always starts "checked" via substitution, and toggling the
only item off reproduces `[]` — the same empty/substituted/all-shown state — every time.
There is no click sequence that reaches `selectedPatrols: ["OnlyPatrolName"]`; the real
single-patrol-filtered state is unreachable through the UI.

Fix sketch for whenever this gets picked up: `onPatrolsChange` needs to detect the N=1 case
specifically (or more generally, detect when the emitted array still equals
`availablePatrols` after a toggle meant to remove the last-remaining displayed item) and
write the real narrowed selection rather than `[]`. Not attempted here — flagged per the
user's instruction to note it, not fix it, during this unrelated session.

## Patrol filter bug: fixed

Picked up and fixed in a later session. Root cause confirmed as described above — `onPatrolsChange`
genuinely didn't exist; the comment referencing it predated the method. The fix is **not** a
clever reconciliation trick inside the N=1 case (that's structurally impossible: with one
patrol, "select it" and "select everything" are the same array, so no amount of math inside
the `@change` handler can tell them apart). Instead:

- **`hasUnassignedMembers(sections)`** added to `filterHeatMapSections.ts`, alongside
  `collectPatrolNames` — true if any member in the given sections has `patrolName === null`.
- **`canFilterByPatrol`** computed added to `OasProgressionVueContent.ts`: false when there
  are zero named patrols, or exactly one named patrol *and* no unassigned members (everyone's
  already in that one patrol — nothing to narrow between). True otherwise. Passed down to
  `OASProgressionFiltersVue` as a new `canFilterByPatrol` prop, which now gates the Patrol
  `v-select`'s `v-if` instead of the old bare `availablePatrols.length > 0`.
- **`onPatrolsChange`** was also written (it's still useful for N≥2 and for the N=1-with-
  unassigned case, where the filter IS meaningful): reconciles the emitted "display space"
  selection (see `selectedPatrolsForDisplay`) back to real storage — re-selecting everything
  collapses to `[]` (no filter), anything else is the real filtered subset.
- New tests: `filterHeatMapSections.spec.ts` (`hasUnassignedMembers`),
  `OasProgressionVueContent.spec.ts` (`canFilterByPatrol`'s four cases),
  `OASProgressionFiltersVue.spec.ts` (new file — `onPatrolsChange`'s reconciliation math,
  including documenting why N=1 reconciliation alone can't distinguish the two states, which
  is exactly why the gate was the real fix).

## Third revision: Stages range became a true multi-select; Patrol filter fixed

Also in this pass: the earlier "second revision" work (Stage from/to combined into one
"Stages" dropdown) required renaming `stageRange`/`worksheetStageRange` throughout the Vue
filter state. A number of test fixtures across the test suite still referenced the old field
names from before that rename — these were all old field names surviving in test fixtures,
not functional bugs, and have now been brought in line (`tests/unit/components/
oas-progression-vue-render-contract.spec.ts`, `oas-heatmap-vue-render-contract.spec.ts`,
`OASWorksheetsVue.spec.ts`, `OASProgressionVueFilterPersistence.spec.ts`,
`buildWorksheetPages.spec.ts`). A genuine new regression test was also added confirming
non-contiguous stage selection (e.g. stages 1 and 5, skipping 2-4) actually works as a true
multi-select, not a silently-contiguous range.

## Patrol filter bug: the real, final fix

The earlier "Patrol filter bug: fixed" section above was **incomplete** — `canFilterByPatrol`
correctly hid the control when there was truly nothing to filter by, but for the reported
real-world case (1 named patrol + unassigned members, where `canFilterByPatrol` is correctly
`true`) the underlying `selectedPatrolsForDisplay`/`onPatrolsChange` machinery was untouched
and still broken: the "substitute the full list for display when storage is empty" trick
breaks for **any** one-item list, not just "exactly one patrol total." With one named patrol
and unassigned members previously having no selectable representation at all, the dropdown's
only real item was still a single item, hitting the same wall.

The actual fix removes the display/storage split entirely rather than patching around it:

- **`UNASSIGNED_PATROL`** (`filterHeatMapSections.ts`) is now exported, and
  **`filterMembersByPatrol`** matches it against `patrolName === null` — so "Unassigned" can be
  a real, selectable filter value, not just an internal grouping label.
- **`patrolFilterOptions`** (new computed, `OasProgressionVueContent.ts`): named patrols plus
  `UNASSIGNED_PATROL` when `hasUnassignedMembers` is true. Deliberately **separate** from
  `availablePatrols`, which stays patrol-names-only since it's also used to gate "Break by
  patrol" elsewhere — a unit with zero named patrols and every member unassigned has nothing
  to *group* by, even though it would have one real Patrol-*filter* option ("Unassigned").
- **`canFilterByPatrol`** simplified to `patrolFilterOptions.length > 1` — no more special
  N=1 case to reason about separately.
- **`selectedPatrolsForDisplay`** and **`onPatrolsChange`** are both deleted entirely. The
  Patrol `v-select` now binds directly to `filters.selectedPatrols` and emits straight into
  `patch({ selectedPatrols: $event })`, same as every other filter control on the page — no
  reconciliation step, because there is no longer a display/storage mismatch to reconcile.
- Consequence (confirmed as acceptable): on first load, the Patrol dropdown shows **nothing
  checked** even though every member is shown — "0 selected" was replaced with a plain "All"
  label in that state so it doesn't read as "showing nobody."
- `filterMembersByPatrol`'s own `[] = show everyone` contract is untouched (Worksheets still
  hardcodes `selectedPatrols: []` and is unaffected — it has no Patrol filter UI of its own).

## Fourth revision: Patrol semantics reversed again, Group-by-Member bugs, several defaults

After more live testing, the user changed their mind on Patrol semantics, and found three real
bugs specific to "Group by Member" that don't happen in "Group by Skill," plus several default
values to change. All from `.claude/DEV_NOTES.md`'s "Heat Map"/"Worksheets" sections (read-only;
never edited by an agent).

**Patrol filter reversed to "empty = show nothing," defaulting to all-on:**
- `filterMembersByPatrol`'s own shared contract (`[] = show everyone`) is kept **unchanged** —
  it's still relied on by Worksheets (`selectedPatrols: []` hardcoded, no Patrol UI of its own)
  and the legacy React page. The reversal is scoped to the Heat Map's own two computeds
  (`sections`/`memberSections` in `OASHeatMapVue.ts`), which now short-circuit to an empty
  result when `this.selectedPatrols.length === 0`, rather than calling `filterMembersByPatrol`
  at all in that case.
- Defaulting to "all on" can't be a static `DEFAULT_FILTERS` value, since which patrol names
  (and whether "Unassigned") exist isn't known until the heat map's data has loaded. Solved
  with a `null` sentinel: `selectedPatrols: string[] | null` in
  `OASProgressionVueFilterState` — `null` means "not yet resolved" (new user, or just after a
  reset), `[]` means "user deliberately selected nothing." A new watcher on
  `patrolFilterOptions` (`OasProgressionVueContent.ts`) resolves `null` to the full list the
  first time real options arrive, and is guarded on `=== null` specifically so it never fires
  again once resolved or once a user empties it.

**Three Group-by-Member bugs fixed** (`memberSections` computed, `OASHeatMapVue.ts`) — all
three existed because `memberSections` had drifted from `sections`' own filtering/sorting,
confirmed via a dedicated investigation pass before fixing:
- **Patrol filtering was hand-rolled** (`section.patrolName !== null && selectedPatrols.includes(...)`)
  instead of reusing `filterMembersByPatrol`, so it could never match `UNASSIGNED_PATROL` — an
  unassigned member could never be filtered back in. Now reuses `filterMembersByPatrol`
  directly, same as `sections`.
- **Sort By was never applied at all** — `memberSections` always sorted alphabetically by
  display title, ignoring `sortBy` entirely. Now sorts by `firstNameOf`/`lastNameOf` (from
  `filterHeatMapSections.ts`) on the member's real name, matching `sections`' own tiebreak
  convention.
- **"Stage" sort option removed when grouped by member** — a person has one stage per skill
  here, not one overall, so there's no single value to sort by. `OASProgressionFiltersVue.ts`
  gained a `sortOptions` computed (replacing the static list) that omits `stageProgress` when
  `groupBy === "member"`, and a new `onGroupByChange` method that resets `sortBy` to
  `firstName` if it was `stageProgress` at the moment of switching into member mode (so the
  dropdown never shows a stale selection that's no longer offered).

**Other changes:**
- `MIN_VISIBLE_STAGE` (the "Empty top stages" trim floor) lowered from 2 to 1 — DEV_NOTES.md:
  "can hide empty stages down to 2, inclusively. So only stage 1 must be shown."
- `showEmptySkillRows`'s Show-dropdown label changed to "Not Started" (the Skills-section
  item — not the same as the existing I-Statement "Not started" state option; underlying
  field unchanged, literal text-only rename per the user's explicit instruction).
- `breakByPatrol` default was already `false` — DEV_NOTES.md's ask was already satisfied, no
  change needed.
- Worksheets defaults narrowed: `worksheetVisibleSkills: ["camping"]` (was all nine),
  `worksheetVisibleStages: [1]` (was all nine), `worksheetLayout: "membersAsRows"` (was
  `"membersAsColumns"`, now also listed first in the dropdown) — all per DEV_NOTES.md, framed
  as "limit processing overhead" for a worksheet a leader narrows before printing, not a
  dashboard to scan broadly.
- Worksheets' own Show dropdown gained the same Vuetify subheader grouping as the Heat Map's
  (`{ header: "Members" }` containing "Awarded", `{ header: "Grouping" }` containing "Break by
  patrol"), via the same `:menu-props="{ contentClass: 'oas-vue-show-menu' }"` + global CSS
  pattern already established for the Heat Map's Show dropdown.

## Fifth revision: Patrol-reset bug, Worksheets Patrol filter, bold removal, name-resolution refactor

From `.claude/DEV_NOTES.md`'s "Heat Map"/"Worksheets" sections (read-only; never edited by an
agent), plus two follow-up questions about how last names are resolved.

**Patrol filter didn't default to all-on when reset (Heat Map) — fixed:**
- Root cause: the Patrol-reset logic relied solely on the `patrolFilterOptions` watcher to
  resolve the `null` sentinel to "all on" (see the Fourth revision above). `onResetFilters`
  reset `selectedPatrols` back to `null`, but Vue watchers only fire on an actual value
  *change* — `patrolFilterOptions` is derived from already-loaded data, so its value doesn't
  change on reset, and the watcher never re-fired. `selectedPatrols` was left `null` (resolving
  to "show nothing" in practice) instead of "all on."
- Fix: `onResetFilters` (`OasProgressionVueContent.ts`) now resolves `selectedPatrols`
  synchronously and immediately against whatever `patrolFilterOptions` already holds at the
  moment of reset, rather than setting `null` and waiting on the watcher.

**Worksheets gained its own Patrol filter, independent of the Heat Map's:**
- New `v-select`, same component pattern, same `null`/`[]`/real-list semantics as the Heat
  Map's — added to `OASWorksheetFiltersVue.vue`/`.ts` as new required props
  (`patrolFilterOptions`, `canFilterByPatrol`) and a new filter-state field,
  `worksheetSelectedPatrols`, fully independent from the Heat Map's `selectedPatrols` (its own
  `null` resolves separately, its own reset resolves separately).
- `buildWorksheetPages.ts`'s own `selectedPatrols` option changed its semantic to match every
  other filter on the page (`[] = show nothing`) — scoped to this function only (single
  caller), since the shared `filterMembersByPatrol()` utility's own contract (`[] = show
  everyone`) is still relied on by the legacy React page and left unchanged.

**Worksheets: member names no longer bold, in either layout:**
- Layout A (members-as-columns)'s rotated member-name column header: a bare `<th>` is bold by
  browser default, so removing the old `font-weight` override alone wasn't enough — needed an
  explicit `font-weight: normal` to actually un-bold it.
- Layout B (members-as-rows)'s per-row member-name cell: a `<td>` has no such default, so
  simply deleting the old bold `font-weight` declaration was sufficient.
- Left untouched (correctly still bold): Layout B's "Member" column-label header/page-title
  cell — that's a column heading, not a person's name.

**Name-resolution data-quality fix, across all OAS Progression Vue pages:**
- Investigated at the user's request ("How is last name determined? Is it a separate field in
  Terrain?") by checking both this codebase's `TerrainUnitMember` type and the independently
  cloned Topo-Blazor reference app's matching C# model. Confirmed: Terrain's real API gives
  genuinely separate `first_name`/`last_name` fields.
- This codebase's pipeline wasn't using that directly — it concatenated them into one
  `memberName` string early (`buildOASProgressionRows.ts`, `groupRowsForHeatMap.ts`), then had
  three separate places re-splitting that string on whitespace later to recover the parts for
  sorting/initials (`firstNameOf`/`lastNameOf` in `filterHeatMapSections.ts`, plus a third copy
  inside `getMemberDisplayName()`). Lossy for any multi-word given or family name (e.g. "Van
  Der Berg" → only "Berg" recoverable).
- Fixed by threading real `firstName`/`lastName` fields as their own properties through every
  intermediate shape in the pipeline (`OASProgressionRow`, `SectionMemberRow`,
  `MemberSectionView`, `WorksheetMember`), all the way to sorting and display. The
  whitespace-splitting helpers (`firstNameOf`/`lastNameOf`) were deleted entirely.
  `getMemberDisplayName()`'s signature changed from `(memberName, memberId, nameFormat)` to
  `(firstName, lastName, memberId, nameFormat)` — it no longer does any splitting itself.
  `memberName` (the concatenated string) still exists on these shapes, but is now documented as
  a display/search convenience only — must never be re-split.
- New permanent documentation written: `.claude/NAME_RESOLUTION.md` records the rule, why it
  matters, where it's implemented, and the history of what was wrong. `.claude/CLAUDE.md`
  gained a "MEMBER NAME HANDLING" section pointing to it, so this rule applies to all future
  pages (confirmed via grep that I Statements currently has no name-handling logic yet to
  retrofit).
- The legacy React page (`OASHeatMap.tsx`) was deliberately left with its own simpler
  concatenate-based pattern — it's not under active development, so this fix was scoped to the
  Vue pipeline only.

Verified: `npx tsc --noEmit -p .` (only the same 4 pre-existing, unrelated errors), full Jest
suite (923/924 passing — the 1 failure is the known pre-existing UNC-path smoke-test issue,
see `.claude/DEVENV.local.md`), `npm run lint` (clean for all touched files; remaining errors
are the same pre-existing SummitCalendar/test-helper baseline), `npm run build` (succeeds).

## Sixth revision: dev-duplicate-members fallout from the name-resolution refactor

The Fifth revision's `firstName`/`lastName` refactor broke Worksheets' temporary, non-user-facing
dev aid for previewing large-unit layouts (`duplicateMembersForDevPreview` in
`OASWorksheetsVue.ts`, triggered via
`localStorage.setItem("summit.oasWorksheetsVue.devDuplicateMembers", "10")` — see that
constant's own comment for the full mechanism). Each cloned preview member used to get a
distinguishing suffix on `memberName` only (`"${row.memberName} (dev ${i})"`), which was enough
before the refactor, when `memberName` was the only field anything read for sorting/display.
After the refactor, sorting/display reads `lastName` directly, so every clone silently showed
the SAME surname as its original — noticed live by the user.

Fixed by giving each clone its own distinguishing `lastName` instead (`` `${row.lastName} (dev
${i})` ``), keeping `firstName` unchanged and `memberName` resynced to the new
`firstName`/`lastName` rather than left to drift from them, per `.claude/NAME_RESOLUTION.md`'s
own rule. One function, one call site (`pageSet` computed) — no other change needed, since
everything downstream already reads `firstName`/`lastName` directly.

Verified: new Jest case added to the existing `duplicateMembersForDevPreview` describe block
(`tests/unit/pages/OasProgressionVue/components/OASWorksheetsVue.spec.ts`), full suite 924/925
passing (same known pre-existing UNC smoke-test failure), `npm run lint` clean on touched
files, `npm run build` succeeds.
