<!-- @format -->

# PLAN_STAGE_3.md — The worksheet view

The bulk of the feature: the third tab, its own filter row, and the on-screen rendering
of the pages Stage 1 builds. Printing is Stage 4 — get it right on screen first.

New files:

- `src/pages/OasProgressionVue/components/OASWorksheetsVue.vue` + `.ts`
- `src/pages/OasProgressionVue/components/OASWorksheetFiltersVue.vue` + `.ts`
- `tests/unit/pages/OasProgressionVue/OASWorksheetsVue.spec.ts`

## 1. Wire the third tab

Widen `viewMode` in
[`OASProgressionVueFilterPersistence.ts`](../../src/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence.ts)
to `"heatmap" | "table" | "worksheets"`, add `<v-tab value="worksheets">Worksheets</v-tab>`
to the Stage 2 strip, and render the new component from
`OasProgressionVueContent.vue` alongside the existing two.

**Label it "Worksheets" in the GUI**, per DEV_NOTES ("called 'OAS Worksheets', or just
'Worksheets' in the GUI") — the tab sits on a page already titled OAS Progression, so
the "OAS" prefix is redundant there.

The content component currently branches `heatmap` / else-table (lines 34–63). Three
views is one too many for a `v-else-if` chain to stay readable — switch to an explicit
`v-if="filters.viewMode === 'worksheets'"` block per view.

`hasContent` gating applies unchanged: this page shows partial data as streams land
(see its comment at line 98–106) and the worksheet should too — a leader waiting on
nine skills should see Bushcraft's sheets as soon as they arrive.

## 2. New filter state

Added to `OASProgressionVueFilterState`, all persisted with the rest:

```ts
/** Worksheets view only. */
worksheetVisibleSkills: string[];
worksheetStageRange: [number, number];
worksheetHideLastName: boolean;
worksheetUseCodenames: boolean;
worksheetBreakByPatrol: boolean;
worksheetHideCompleted: boolean;
```

**Separate keys, not shared with the heat map's.** The two views are used for different
jobs — the heat map is scanned across all nine skills, a worksheet is printed for the one
skill you are about to run — so a leader narrowing to "Bushwalking, stages 4–5" to print
should not find their heat map narrowed the same way when they switch back. Prefix
`worksheet*` and default them independently in `DEFAULT_FILTERS`.

Defaults: all skills, stages `[1, 9]`, every boolean `false`. "Hide completed" off by
default is what keeps PLAN.md decision 1 true in the default case.

Sort order is **not** a worksheet filter. Member columns sort by first name; the heat
map's `stageProgress` mode is meaningless on a page fixed to one stage (see
PLAN_STAGE_1.md §2). If the user later wants last-name ordering, it is one more key.

## 3. The filter row

A new `OASWorksheetFiltersVue` component — **not** a reuse of `OASProgressionFiltersVue`.
That component is bound tightly to the heat map's own filter object and carries six
checkboxes the worksheet has no use for (`hideEmptyStreams`, `hideEmptyTopColumns`,
`onlyInProgress`, `hideAnswered`, plus `groupBy` and `sortBy` selects). Reusing it would
mean threading a mode flag through every control. A separate, smaller component is the
honest shape.

What it carries, per DEV_NOTES ("Provide filtering: Skills/Stage from/Stage to" and
"Provide display options: Use codenames/Hide lastname/break by patrol"), plus the
later-requested Hide completed:

| Control | Type | Bound to |
| ------- | ---- | -------- |
| Skills | `v-select multiple` | `worksheetVisibleSkills` |
| Stage from | `v-select` | `worksheetStageRange[0]` |
| Stage to | `v-select` | `worksheetStageRange[1]` |
| Use codenames | `v-checkbox` | `worksheetUseCodenames` |
| Hide last name | `v-checkbox` | `worksheetHideLastName` |
| Break by patrol | `v-checkbox` | `worksheetBreakByPatrol` |
| Hide completed | `v-checkbox` | `worksheetHideCompleted` |
| Reset filters | `v-btn text` | resets the `worksheet*` keys only |

**Copy the heat map filter row's structure and class usage, not its CSS.** Take from
[`OASProgressionFiltersVue.vue`](../../src/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue):

- `.oas-vue-filter-panel` on the root — **put the class on and stop.** Do not redeclare
  it in this component's `<style>`. That duplication is exactly what DESIGN.md's
  "declare it once" section is about, and
  `tests/unit/components/istatement-matches-oas-progression.spec.ts` will fail if you do.
- `.oas-heatmap-controls` for the control row, `.oas-heatmap-display-group` fieldset for
  the checkbox cluster, `.oas-vue-filter-heading-match` on the `<legend>`.
- The `#selection` slot summary (`"{n} selected"`) and the chip row for Skills.
- The `::v-deep .v-label` / `.v-text-field input` / `.v-select__selection` sizing
  overrides — these are **necessary**, not decorative: Terrain's page CSS forces 20px on
  those elements regardless of `dense`. Copy them with their comments.
- The `legend` rules, including the measured `font-size: 15px`. **Read that comment
  before touching it** — the value is calibrated against rendered cap height, not
  derived from Vuetify's `scale(0.75)`, and re-deriving it is the specific mistake the
  comment exists to prevent.

Mirror the heat map's own interaction details: "Hide last name" is `:disabled` when
"Use codenames" is on, and "Break by patrol" only renders when `availablePatrols.length > 0`.

**Keep the same font scale** — headings `--oas-vue-font-size-heading`, everything else
`--oas-vue-font-size-body`, inherited from `.oas-vue-content`. No third size.

## 4. The worksheet table

One table per `WorksheetPage`. Build it as a **plain `<table>`**, not a `v-data-table`.

Justification, because this is a departure from the sibling pages: `v-data-table` exists
for sorting, filtering, pagination and virtual rows — none of which a worksheet wants.
What a worksheet needs is a vertically-merged first column (`rowspan`), a thead that
repeats across printed pages, and exact control of page breaks. `rowspan` is awkward to
express through `v-data-table`'s row slots, and Stage 4's print CSS needs direct access
to `<thead>` / `<tr>`. The heat map (`OASHeatMapVue.vue`) is already a hand-written
`<table>` for comparable reasons — this follows it, not Present Awards.

Structure, reproducing the xlsx layout:

```
┌─────────┬──────────────────────────┬─────────┬─────────┬─────────┐
│         │ Stage 5 - Bushwalking    │ Amy    │ Jess │ Nora  │  <- thead
├─────────┼──────────────────────────┼─────────┼─────────┼─────────┤
│         │ I know how to identify…  │  [    ] │03/02/24 │  [    ] │
│  Plan   │ I know how to purify…    │  [    ] │03/02/24 │  [    ] │  <- rowspan
│         │ I can assist Stage 3…    │  [    ] │03/02/24 │  [    ] │
├─────────┼──────────────────────────┼─────────┼─────────┼─────────┤
│   Do    │ I have successfully…     │  [    ] │03/02/24 │  [    ] │
└─────────┴──────────────────────────┴─────────┴─────────┴─────────┘
```

- **Column 1**: the group band (`Plan`/`Do`/`Review`/`Verify`), one `<td>` with
  `:rowspan="group.rows.length"` on the group's first row only. The merge is what makes
  it read as a band rather than a repeated word — matches the xlsx's `A5:A15` merges.
  Write it vertically (`writing-mode: vertical-rl`) only if it fits the available width
  better; check on screen first, and keep it horizontal if legible, since vertical text
  is harder to read.
- **Column 2**: the I-Statement. This is the widest column and the one that should absorb
  remaining width.
- **Columns 3+**: one per member in **`page.members`** order.

⚠️ **Iterate `page.members`, never `pageSet.members`.** "Hide completed" narrows columns
per page, and `WorksheetRow.cells` is index-aligned with `page.members` (PLAN_STAGE_1.md
§4a). Reading headers from the set-level list would render a narrowed page's cells under
the wrong names — silently, with no error.

The page title goes in the thead's column-2 cell, as the xlsx does. Member names are the
member columns' headers.

### Cell rendering — three states

Per PLAN.md decisions 2 and 3:

| State | Renders as |
| ----- | ---------- |
| `!answered && !awarded` | An empty bordered box, sized for a handwritten tick |
| `answered && !awarded` | The date, plain background |
| `awarded` | The date, on light green `--summit-color-status-awarded` (`#b3c9b3`) |

The green reuses the heat map's own complete-state token deliberately — the same colour
means the same thing on both views. Do not introduce a near-identical second green;
DESIGN.md calls this out as a mistake already made and fixed once on the I Statements
heat map.

Format the date for printing here, not in the service (PLAN_STAGE_1.md keeps it ISO).
The xlsx shows both `03/02/2024` and `02/11/24`; use `DD/MM/YY` for column width, via
`moment` (already a dependency, used by `buildOASProgressionRows.ts`).

The empty box must be visible **on paper**, which is the whole point — a `1px solid
var(--color-light-mid-charcoal, #b7c2cc)` inner box with a fixed min-height, not just an
empty table cell relying on the cell border.

### Break by patrol

When `worksheetBreakByPatrol` is on, insert a labelled divider row across the member
columns, using `pageSet.patrolGroups`. Match the convention Present Awards established
for group header rows (DESIGN.md): `--summit-color-bg-muted` tint plus
`--summit-font-weight-semibold` label — not a heavier border.

⚠️ **Patrol grouping here groups the columns, not the rows** — a patrol is a set of
members, and members are columns on a worksheet. This is the opposite axis from the heat
map, where members are rows. Decide and state in a comment how it renders: the
straightforward reading is that member columns are **ordered** by patrol with a patrol
label in a second header row spanning each patrol's columns, rather than a dividing row.
Confirm with the user if the header-spanning version looks cluttered on a real unit.

### Sticky columns

The group band and I-Statement columns should stick while scrolling horizontally past
many members. If you make them sticky, DESIGN.md requires both:

- An **explicit opaque background** (`var(--color-white, #fff)`) — a sticky cell without
  one is transparent and scrolled content shows through it.
- **`border-collapse: separate`** on the table — collapsed borders detach sticky
  backgrounds and break every frozen edge at once.

And the specificity trap underneath it: write every rule in such a block at the same
shape (`::v-deep thead th.my-class`, not a bare `.my-class`), or a blanket
`::v-deep thead th` rule at `(0,1,1)` silently beats a bare class at `(0,1,0)` and
repaints your cell. `IStatementHeatMap.vue` documents this; follow it.

Also restate cell padding explicitly rather than inheriting Vuetify's — Summit's CSS
loses cascade ties, which already produced a flush-left first column on both existing
Vue tables.

## 5. Empty states

- **No pages at all** (filters exclude everything, or "Hide completed" emptied them):
  a plain message saying so, with a hint that it may be the filters. Not a blank area.
- **A skill/stage with no members left** cannot occur — Stage 1 drops that page.
- Loading is handled by the shared `SummitLoadingState` already on the page; do not add
  a second `v-progress-linear` (a test guards this).

## 6. Tests

Logic only; rendering is verified in the browser. Remember the SFC `jest.mock(...,
{ virtual: true })` stub requirement (DESIGN.md).

- The component passes its `worksheet*` filter keys through to `buildWorksheetPages`
  unchanged — the mapping from filter state to options is where a wrong key silently
  disables a control.
- Changing a worksheet filter does **not** change the heat map's keys (§2's whole point).
- "Reset filters" resets the `worksheet*` keys and leaves `viewMode` and the heat map's
  own keys alone.
- Cell state → class mapping: the three states produce three distinct classes, and
  `awarded` wins over `answered`.
- Date formatting: an ISO `2024-02-03` renders `03/02/24`; a null date renders the empty
  box; a non-ISO passthrough string does not throw.
- Column headers come from `page.members`, and a narrowed page's headers match its
  cells' length. Guard the §4a alignment from the component side too, not just the
  service side — this is the one failure mode worth two tests.

## Verification

`npm test`, `npm run build`, then in Edge with `dist/` loaded:

- Compare a real unit's `Stage 5 - Bushwalking` sheet against the xlsx reference —
  same rows, same groups, same order.
- An awarded stage shows as a green block; a pending-review member shows dates on plain
  ground and is **not** hidden by "Hide completed".
- Toggle every display option and confirm each does what its label says.
- Switch away to the heat map and back: worksheet filters persisted, heat map filters
  untouched.
- **Hard-refresh directly onto the page's own URL**, not just by navigating from Summit
  home — the sticky backgrounds and restated cell padding above are precisely the rules
  that fail only on a cold load (DESIGN.md).

Printing is explicitly **not** verified in this stage — that is Stage 4.
