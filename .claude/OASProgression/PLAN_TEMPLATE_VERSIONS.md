# Plan: Show each member's own I-statement template version

**Status (2026-10-13):** implemented, unit-tested, built. Pending live verification in Edge (see below).

## Problem

Terrain sometimes publishes a new version of a stage's I-statements. A member who had already
started that stage stays on the version they started on — Terrain keeps showing them the old
statements. Summit doesn't: `fetchOASProgressionForStage` builds every member's rows from
`latest.json` only, then matches answers to rows by input id
(`buildOASProgressionRows.ts`, `applyAnswersToMemberRows`). For a member on an older version:

- statements that exist only in their version **never appear** (no row is ever created);
- answers to those statements are **silently dropped** (`if (!row) return;`);
- statements that exist only in the newer version show as **not done**, though they were never
  that member's requirement.

Awarded stages already mask this (every row is stamped awarded), so in practice it shows up on
in-progress stages.

### Confirmed against live data (2026-10-13)

A real member's in-progress achievement: `"template": "oas/vertical/3", "version": 1`.

| File | `version` field |
|---|---|
| `templates.terrain.scouts.com.au/oas/vertical/3/latest.json` | 2 |
| `.../oas/vertical/3/2.json` | 2 (identical to latest) |
| `.../oas/vertical/3/1.json` | 1 |
| `.../oas/vertical/3/3.json` | 404 |

v1 → v2 removed exactly one statement and changed nothing else:
`navigational_skills_basic_participated_game_5f83dd` ("I have participated in a game that
required basic navigational skills."), the 11th statement in v1. All 17 other input ids are
identical. Template files are publicly readable (no auth needed).

### How Terrain itself does it

`docs/terrain.scouts.com.au/_nuxt/app.21ef2a2f0b1727b63ea0.js`, `loadTemplate()` (~line 1437):
for an existing achievement with `template` and `version`, Terrain loads
`{templatesApi}/{achievement.template}/{achievement.version}.json`; it only uses
`latest.json` when starting a new one. This plan copies that rule.

## Decisions

1. **Per-member version, Terrain's rule.** A member's rows for a stage are built from the
   template their achievement points at (`template` + `version`). No achievement, or no
   `template`/`version` on it (e.g. imported awards) → `latest.json`, as today.
2. **Applies to awarded achievements too**, not just in-progress — an awarded v1 member then
   shows v1's statements, all awarded, which is what they actually completed. Harmless and
   more accurate than stamping v2's list.
3. **Only fetch what's needed.** If the achievement's version equals `latest.json`'s own
   `version` field, reuse the latest template — no extra request. Each distinct old version
   is fetched once per stage, through the existing `getCachedOASTemplate` (1-day cache; key
   becomes `template.oas/vertical/3/1.json`).
4. **Fail soft.** If an old version can't be fetched, log a warning and fall back to latest
   for that member (today's behaviour) rather than dropping the member.
5. **Statement order across versions.** Rows are currently sorted by latest's `sortIndex`; an
   old-only statement has none and would sort to the top (`?? 0`). Instead, build one merged
   order per stage: latest's order, with each old-only statement inserted directly after the
   statement that precedes it in its own version (or at the very start, if it was that version's first).
   Every row of that stage — any member, any version — sorts by this merged order. The navigation
   statement above therefore lands between "two vertical activities" and "climbed or abseiled a
   10m wall", exactly where v1 had it.
6. **Worksheets: "not applicable" cells.** A worksheet page is the union of every member's
   statements. A member with no row for a statement gets a **not-applicable** cell — no tick box,
   muted/hatched, so a leader doesn't tick something that isn't that member's requirement. Only applies to a member who has other rows on that page; a member with no rows on a page keeps the plain blank column (worksheet PLAN.md decision 1).
   Same in both layouts (members-as-rows and members-as-columns) and in print.
7. **Table, Heat Map, Summary need no UI change.** They already work per member's own rows:
   the Table is a flat list; heat-map squares, "complete" and the stage-progress proportion all
   count each member's own cells, so they become *more* accurate. A version-1 member just shows
   one more square on Vertical 3 than a version-2 member.

## Implementation

### A. Data layer — `src/pages/OasProgression/services/buildOASProgressionRows.ts`

- `fetchOASProgressionForStage`: fetch achievements **before** building the matrix (today it
  builds the blank matrix first). Then:
  1. Load latest template (as now); read its `version`.
  2. For each achievement with `template` + `version` ≠ latest's version, collect distinct
     `(template, version)` pairs; fetch each via `getCachedOASTemplate(`${template}/${version}.json`)`.
  3. Map member → their flattened I-statement list (latest unless their achievement says
     otherwise and that fetch succeeded).
- `buildBlankMatrix`: take a per-member statement lookup (`(memberId) => FlattenedIStatement[]`)
  instead of one shared list. Keep a small wrapper/overload so existing callers/tests that pass
  one list still work.
- New pure helper `mergeStatementOrder(latest, others[]) => Map<inputId, number>` implementing
  decision 5; replace the final `sortIndexByInputId` sort with it.
- `applyAchievementsToMatrix` / `applyAnswersToMemberRows`: unchanged — once a member's rows
  come from their own version, their answers match by id.
- `fetchOASTemplate.ts`: `isValidTemplateLink` already accepts `oas/vertical/3/1.json`; build
  the link from `achievement.template` only after the same validation (it's API data).

### B. Worksheets — `src/pages/OasProgressionVue/services/buildWorksheetPages.ts`

- `WorksheetCell` gains `notApplicable: boolean`. The default cell created for members with no
  row for a statement (`cells: members.map(() => ...)`, ~line 243) is `notApplicable: true`;
  a cell written from a real row is `false`.
- `isMemberCompleteOnPage`: "every **applicable** cell is awarded" — otherwise an awarded v2
  member would never count as complete (their v1-only cell isn't awarded), breaking
  "Hide completed".
- Layout B column building (~line 397) needs no change — it already takes the union of rows.

### C. Worksheet rendering — `OASWorksheetsVue.vue` / `.ts`, `printWorksheets.ts`

- `worksheetCellClass()` returns a new `oas-worksheet-cell-na` class for not-applicable cells.
- Template: not-applicable cells render no tick box and no date — an empty cell with a
  `title="Not part of this member's version of this stage"` tooltip.
- Style (as built): muted background (`--summit-color-bg-muted`) and a small grey "n/a" label
  with a tooltip, on screen and in `buildPrintStylesheet`. No hatch — DESIGN.md has no hatch
  convention, and the plain muted cell matches existing group-header tinting.

## Tests (`tests/unit/...`)

- `buildOASProgressionRows.spec.ts`
  - member on an old version gets that version's statements, including the old-only one, and its
    answer is applied (vertical 3 v1/v2 shape as fixture);
  - member on latest / with no achievement gets latest's statements;
  - achievement with version equal to latest triggers no extra fetch;
  - failed old-version fetch falls back to latest;
  - `mergeStatementOrder` places an old-only statement after its predecessor; handles a
    statement removed at the start of a group, and an added-in-latest statement.
- `buildWorksheetPages.spec.ts`
  - union page: version-2 member's cell for the v1-only statement is `notApplicable`;
  - "Hide completed" still hides an awarded v2 member on a page containing a v1-only row.
- `OASWorksheetsVue.spec.ts`: `worksheetCellClass` maps a not-applicable cell to `oas-worksheet-cell-na`.
- `fetchOASProgressionForStage.spec.ts` (new, mocks services/cache): per-member version rows, no
  extra fetch when all on latest, fallback when an old version fails.

## Manual verification (live, Edge)

Use the real Vertical Stage 3 member(s) on version 1:

1. Table tab: filter to that member + vertical + stage 3 → 18 rows including the navigation
   statement, in v1 order, with any answer to it shown.
2. Heat Map: that member has 18 squares on Vertical 3; version-2 members have 17.
3. Worksheets (both layouts, screen + print): Vertical Stage 3 shows the navigation row; only
   version-1 members have a tick box on it, everyone else a not-applicable cell.
4. DevTools Network: one extra request for `oas/vertical/3/1.json` on a cold cache, none on a
   warm reload.

## Noticed in passing (not part of this plan)

`isOASCacheKeyForStream` splits cache keys on `.`, so for `template.oas/vertical/3/latest.json`
it compares `"oas/vertical/3/latest"` to `"vertical"` — template caches likely aren't cleared by
a **per-stream** reload (full reload is unaffected). Worth a quick check/fix separately; it will
apply to versioned template keys too.
