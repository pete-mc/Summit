<!-- @format -->

# PLAN.md — OAS Worksheets

A third view on the OAS Progression page: a printable per-Stage/per-Skill checkoff
sheet a leader takes to an activity and fills in by hand.

## What it is for

The heat map answers "where is everyone up to?" at a glance. The table answers
"show me the raw rows". Neither prints usefully as something to carry and write on.
The worksheet is the paper artefact: one page per Skill × Stage, I-Statements down
the side, members across the top, a date where Terrain already has one and an empty
box to tick where it doesn't.

Modelled on Topo's OAS Worksheet generator. The reference export used while planning:

- `P:\Dev\personal\terrain_summit\resources\OAS_Worksheet_Venturer_Unit_Vertical.xlsx`
- `P:\Dev\personal\terrain_summit\resources\Topo_OAS_Worksheet_Venturer_Unit_Horizontal.pdf`

Read directly from that xlsx (17 sheets, one per Stage × Skill, Venturer Unit):

| Element | Where | Notes |
| ------- | ----- | ----- |
| Title block | rows 1–3, merged `B:J` | Group name / section / "Stage 5 - Bushwalking as at 1/10/2026". **Ignored** per DEV_NOTES — Summit supplies its own heading. |
| Member names | row 4, columns C onward | One column per member. |
| Group label | column A, vertically merged | `Plan` / `Do` / `Review` / `Verify`, merged across that group's rows. |
| I-Statement | column B | The statement text. |
| Cell value | C.. | A completion date (`03/02/2024`), or `Yes`, or blank. |

Sheet names confirm the paging rule: `Stage 1 - Bushcraft`, `Stage 4 - Pioneering`,
`Stage 5 - Survival skills` — **one page per (Skill/Stream, Stage) pair**, which is
what DEV_NOTES asks for ("Each 'page' of the table should be restricted to a
Stream/Branch and Level").

Note the sample also shows groups are only present when they have statements —
`Stage 1 - Bushcraft` has a one-row `Review` and no `Verify` beyond the logbook line,
while `Stage 5 - Bushwalking` has all four. Do not render an empty group band.

## Decisions already taken

Both settled with the user before planning, and both affect structure — don't
re-open them during implementation without asking.

1. **Every filtered member gets a column on every page**, whether or not they have
   progress in that Skill/Stage. This matches the xlsx (Stage 1 Bushcraft lists all
   three members with only logbook dates filled) and keeps the printed set readable:
   the same columns in the same order on every page. The alternative — dropping
   columns per page — was rejected as harder to read across a stack of sheets.

   The **one exception** is the opt-in "Hide completed" display option (decision 4),
   which drops a member from pages where they have finished that Skill/Stage. Off by
   default, so the default behaviour is exactly as stated above.
2. **Cells show the date where complete, and a bordered empty box where not.** The
   date is what Terrain knows; the box is what the leader writes in, which is the
   whole point of the page. Not a tick-only rendering (loses the date), not
   blank-where-missing (nothing to write on).
3. **An awarded cell is painted light green**, reusing the heat map's own complete-state
   colour `--summit-color-status-awarded` (`#b3c9b3`). So there are three cell states,
   not two: empty box (nothing yet), date on plain ground (answered, not yet approved),
   date on green (awarded). Because an awarded stage stamps the whole stage, an awarded
   page prints as a solid green block — a deliberate at-a-glance "nothing left here".
4. **A "Hide completed" display option** removes a member's column from a Skill/Stage
   page they have completed. Keyed on `awarded`, not `answered` — a member sitting in
   pending review is precisely who the leader is still chasing, so they stay. See
   [PLAN_STAGE_1.md §4a](PLAN_STAGE_1.md) for the column/cell alignment consequences,
   which are the fiddliest part of the data layer.

## Scope

In:

- A third view on the existing OAS Progression page, reached by a Vuetify `v-tabs`
  control replacing the current "Show Table"/"Show Heatmap" button.
- Filters: Skills, Stage from, Stage to (a subset of the heat map's own row).
- Display options: Use codenames, Hide last name, Break by patrol, Hide completed.
- Print/PDF output, one Skill × Stage per page.

Out, unless asked for later:

- Any new Terrain fetching. `OASProgressionRow` already carries every field the
  worksheet needs (see Stage 1) — this is a new view over data the page has loaded.
- Editing. The worksheet is read-only on screen; it is filled in on paper.
- Excel export. The reference is an xlsx, but the deliverable is something to print.
  Revisit only if the user asks.

## Stages

| Stage | File | What |
| ----- | ---- | ---- |
| 1 | [PLAN_STAGE_1.md](PLAN_STAGE_1.md) | Data layer — pure functions turning `OASProgressionRow[]` into worksheet pages. No UI. |
| 2 | [PLAN_STAGE_2.md](PLAN_STAGE_2.md) | The `v-tabs` view switcher, replacing the Show Table / Show Heatmap button. |
| 3 | [PLAN_STAGE_3.md](PLAN_STAGE_3.md) | The worksheet component — filters, display options, on-screen rendering. |
| 4 | [PLAN_STAGE_4.md](PLAN_STAGE_4.md) | Print/PDF: page breaks, repeated headers, column fitting. |

Stage 1 is independently testable and lands no UI. Stage 2 is a self-contained
refactor of an existing control and can ship before the worksheet exists (the tab
is simply not added until Stage 3). Stage 3 is the bulk of the work. Stage 4 is
where it becomes genuinely useful, and is the one stage that needs real
browser/print verification rather than tests.

## Conventions this feature must follow

From [DESIGN.md](../DESIGN.md) — these have each already caused a real bug on this
page, so they are not optional:

- **Vue 2.7 + Vuetify 2.** New page work is Vuetify; see the three sibling pages.
- **The `--oas-vue-*` type scale**, inherited from `.oas-vue-content`. Headings use
  `--oas-vue-font-size-heading`, everything else `--oas-vue-font-size-body`. Do not
  introduce a third size.
- **Terrain's own CSS custom properties** (`var(--color-light-charcoal, #e5e9ec)`
  etc.) over hardcoded colours. Terrain does not style its table headers — so
  neither should this.
- **Don't redeclare `.oas-vue-filter-panel`.** Put the class on the markup and stop.
  A local copy is how that class drifted; a test guards it now.
- **State a sticky cell's background explicitly**, and set `border-collapse: separate`
  on any table with sticky cells. The worksheet's first two columns are prime
  candidates for sticking (see Stage 3).
- **Shared markup + styling → a component**, not a copied class.

## Verification

Each stage carries its own verification section. Across the feature:

- `npm test` passes, including new specs.
- `npm run build` succeeds; load `dist/` unpacked in Edge and check the real page.
- **Hard-refresh directly onto `/summit/reports/oasprogression`**, not just by
  navigating from Summit home — Summit's content-script CSS loses cascade ties, so
  those two paths can render differently (DESIGN.md).
- Print preview is the real test for Stage 4; tests cannot cover pagination.
