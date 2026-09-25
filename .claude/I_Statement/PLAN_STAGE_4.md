<!-- @format -->

# PLAN_STAGE_4.md — Filters, persistence, hide-empty

New: `src/pages/IStatements/components/IStatementFilters.vue` + `.ts`
New: `src/pages/IStatements/services/IStatementFilterPersistence.ts`

Model both on their `OasProgressionVue` counterparts
([`OASProgressionFiltersVue.vue`](../../src/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue),
[`OASProgressionVueFilterPersistence.ts`](../../src/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence.ts)).
Read them before writing these — match the label/heading markup and the
`--oas-vue-font-size-heading` treatment for filter labels.

## Filters

### 1. Skills (multi-select)

All 9 Skills, all selected by default. Use the same select component the OAS
page uses for its Skills filter so the two pages look identical.

### 2. Stage from / Stage to

Two numeric selects, 1–9, defaulting to 1 and 9.

Guard the invalid range: if `from > to`, clamp the other rather than rendering
an empty table with no explanation. Decide one direction and keep it consistent
(suggest: changing `from` above `to` pushes `to` up to match).

### 3. Display → Hide empty (three independent checkboxes)

All default **off**, so the first view is the complete grid.

| Toggle | Hides |
| ------ | ----- |
| Hide empty stage columns | any stage column with no square, given the Skill/Stage filters |
| Hide empty Skill·Stream groups | any group whose every visible stage column is empty |
| Hide empty I-statement rows | any row with no square in any visible cell |

## Ordering — this is the subtle part

The three hide-empty toggles interact, and applying them in the wrong order
gives wrong results. Apply strictly:

1. Apply **Skills** and **Stage from/to** → this determines the candidate set of
   groups, stage columns, and which cells count.
2. Hide empty **rows** — computed against the cells still visible after step 1.
3. Hide empty **stage columns** — computed against the rows still visible after
   step 2.
4. Hide empty **groups** — a group is empty when *all* its columns were hidden
   in step 3, so this necessarily runs last.

Steps 2 and 3 are order-dependent: hiding rows can empty a column that wasn't
empty before, and that is intended.

**A single pass is provably sufficient — do not iterate to a fixed point.**
Step 3 hides a column only when *no surviving row* has a square in it. So any
column containing a surviving row's square has at least one square and is never
hidden. It follows that step 3 can never strand a row that survived step 2, and
a second row-pass would be dead code. (Step 4 likewise only removes groups whose
columns are all already gone.)

Assert this in a test rather than relying on the argument above holding as the
code evolves: after applying all three toggles, every visible row must still
have ≥1 visible square, and every visible column ≥1 square.

Implement all of this as pure functions taking
`(matrix, filters) → { rows, groups, visibleStagesByGroup }`, unit-tested
independently of the Vue layer — the ordering logic above is exactly the kind of
thing that is painful to debug through the UI.

## Performance

Filtering recomputes the whole rendered cell grid. Keep it in a single Vue
`computed` chained off the Stage 3 precomputation so it runs once per filter
change, not per cell. If a filter change feels laggy on the full dataset,
profile before optimising — the `Set`-based lookup from Stage 3 should be
sufficient.

## Persistence

Persist all five values (Skills selection, stage from, stage to, three toggles)
under a distinct localStorage key — **not** the OAS page's key. Follow that
file's existing shape/versioning approach.

Restoring must be defensive: a persisted Skill that no longer exists, or a stage
outside 1–9, should be dropped and defaulted rather than breaking the page. A
stale payload from a future/older version should fall back to defaults cleanly.

## Tests

`tests/unit/pages/IStatements/filterIStatementMatrix.spec.ts`:

- Skills filter removes that Skill's groups entirely.
- Stage range narrows visible stage columns.
- Each hide-empty toggle independently, then all three together.
- The interaction case: a row hidden by the row-toggle causes a column to become
  empty, which the column-toggle then hides, which empties a group.
- Persistence round-trips; malformed/stale stored payloads fall back to defaults.

## Verification

Build, reload, and in the browser:

1. Deselect a Skill → its groups disappear, row set shrinks if the row-hide
   toggle is on.
2. Set stages 4–6 → only those columns remain; Skills whose trunk ends at 3
   behave sensibly.
3. Each toggle independently, then all three — confirm against the ordering
   rules above, and that turning them all off restores the full grid exactly.
4. Reload the page — all five filter values restored.
5. Clear the localStorage key, reload — clean defaults, no errors.
