# Stage 3 — Per-column filters

**Goal:** the signature OAS table feature — a filter row under the headers, dropdowns where the
column has few distinct values, Clear filters, plus the existing Show/Hide Previously Presented
toggle.

## The filter row

Port `OASProgressionTableVue.vue`'s `#body.prepend` block near-verbatim. The load-bearing finding
from `PLAN_VUESTAGE_5.md`, which must not be re-litigated:

> `header.<value>` scoped slots only customize a cell **within** the single existing header `<tr>`
> — they cannot emit an entire extra sibling row. The correct mechanism is the `body.prepend`
> scoped slot, rendered as the first child of `<tbody>`.

Each cell is a `v-select` (when `header.filterType === "select"`) or a `v-text-field` with
`prepend-inner-icon="mdi-magnify"`, both `solo flat dense hide-details clearable`, class
`oas-vue-column-filter-input`, and `:aria-label="\`Filter ${header.text}\`"`.

## Column filter types

| Column | Type | Options source |
|---|---|---|
| Name (`member`) | text | — |
| Type (`type`) | **select** | distinct values across **all** items, sorted |
| Award (`achievementName`) | text | high cardinality — a dropdown would be unusable |
| Date (`dateAwarded`) | text | — |
| Presented (`presented`) | **select** | fixed: `Yes` → `"presented"`, `No` → `"no"` (see below) |
| Present (`present`) | none | not a data column; render an empty `<th>` so column alignment holds |

`type` gets a dropdown because `TerrainAchievementsType` has only 10 values and the displayed
strings are already normalised by `SummitAchievement`. Derive its options from **all** loaded
items, not the filtered set — `columnFilterOptions` in `OASProgressionTableVue.ts:82-95` explains
why: picking one filter must never shrink another column's own option list.

**The Presented dropdown needs its own handling.** `presented` is not a boolean like the OAS
table's Answered/Awarded — it is either the literal `"No"` or a `DD/MM/YYYY` date. A plain
substring match on `"no"` would work for No but there is no substring that means "any date". So
`filterPresentAwardRows` special-cases this one field: value `"no"` matches `presented === "No"`,
value `"presented"` matches anything else. Every other column keeps the shared case-insensitive
substring semantics.

This is the same class of bug `PLAN_VUESTAGE_5.md` records for Answered/Awarded — typing "yes"
matched nothing because the raw value stringified to `"true"`. Fix it at the outset here rather
than shipping a filter that silently returns nothing.

## The filter function

`PresentAwardsTableVue.ts` exports it, mirroring `filterOASProgressionRows`:

```ts
export function filterPresentAwardRows(items: SummitAchievement[], columnFilters: Record<string, string> = {}): SummitAchievement[];
```

Exported because **the parent needs the filtered row set for export** (Stage 4) — there is no way
to ask a live `v-data-table` which rows it is currently showing without `$refs` gymnastics. For
the same reason `columnFilters` is lifted to `PresentAwardsVueContent` via `.sync`:

```html
<PresentAwardsTableVue :items="visibleItems" :column-filters.sync="columnFilters" ... />
```

## Clear filters

Copy the OAS markup and the fixed-height wrapper:

```html
<div class="oas-vue-clear-filters-row">
  <v-btn v-if="hasActiveColumnFilters" text small color="primary" class="oas-vue-clear-filters-btn" @click="onClearFiltersClick">Clear filters</v-btn>
</div>
```

`.oas-vue-clear-filters-row { min-height: 30px }` reserves the button's height even when empty, so
the table does not jump as the button appears and disappears.

## Show / Hide Previously Presented

Carried over from React (`PresentAwards.tsx:89-104`), rendered as a pill button in the header row
alongside Save Changes, with the same toggling label. Default **hidden**, matching today.

It filters `items` → `visibleItems` in the content component, *upstream* of the column filters:

```
items → (previouslyPresented toggle) → visibleItems → (column filters) → filteredItems → table + export
```

Order matters for the Type dropdown's options, which are derived from the table's `items` prop —
i.e. from `visibleItems`. That is correct: an option should only appear if toggling it could
actually match something currently in scope.

## The `present` column header cell

The filter row iterates `headers`, so the non-filterable `present` column still needs a `<th>` or
every cell after it shifts left by one. Render an empty `<th>` when `filterType` is absent **and**
the column is flagged unfilterable — add `filterable?: boolean` to the local `DataTableHeader`
interface rather than overloading `filterType`.

## Verification

- Standing baseline.
- Type in Name → rows narrow; clear the box → rows return.
- Type dropdown lists every achievement type present in the data; picking one filters correctly;
  picking a Type does **not** change what the Type dropdown itself offers.
- Presented = Yes shows only dated rows; Presented = No shows only "No" rows; between them they
  account for every row.
- Two filters at once AND together.
- Clear filters resets everything and disappears.
- Toggling Show Previously Presented changes the row set and the Type dropdown's options together.
- Filter row does not highlight on hover (this is the `:hover` leak handled in Stage 5 — note it
  here if it shows up before the CSS lands).
