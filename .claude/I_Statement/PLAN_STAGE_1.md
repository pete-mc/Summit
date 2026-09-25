<!-- @format -->

# PLAN_STAGE_1.md — Data layer

No UI in this stage. Everything here is pure functions plus one async crawler,
all unit-testable with Jest without a browser.

New file: `src/pages/IStatements/services/buildIStatementMatrix.ts`

## 1. Reuse, don't duplicate

The OAS Progression page already solved several of these problems. **Import
these rather than rewriting**, from
[`buildOASProgressionRows.ts`](../../src/pages/OasProgression/services/buildOASProgressionRows.ts):

Export status verified 2026-09-24 by reading the file:

| Symbol | Line | Status |
| ------ | ---- | ------ |
| `flattenOASTemplate(template)` → `FlattenedIStatement[]` | 31 | already exported |
| `flattenOASTree(tree)` → `OASTreeBranchStage[]` (`branch`, `stage`, `templateLink`) | 210 | already exported |
| `getCachedOASTree(stream)` | 243 | already exported |
| `getCachedOASTemplate(templateLink)` | 257 | **module-private — add `export`** |
| `OAS_STREAMS` (the 9 Skills) | 314 | **module-private — add `export`** |

`getCachedOASTemplate` uses the `template.<templateLink>` cache key, so reusing
it (rather than writing a parallel fetcher) is what gives both pages one shared
warm cache.

Adding those two `export` keywords is the only permitted change to that file —
no behaviour changes to the OAS Progression page.

⚠️ The `checkbox` input `logbook_up_to_date` ("My logbook is up to date at the
end of this stage.") appears in the *Verify* group of essentially **every**
template. It is not a real I-statement and would otherwise become a row with a
square in every single column. **Decide during implementation**: the cleanest
rule is to exclude inputs whose `type` is not `verifiable_checkbox`. Confirm
against several real templates before hardcoding that — `flattenOASTemplate`
currently filters only on `id === "file_uploader"`, so this page needs its own
additional filter. Do **not** change `flattenOASTemplate` itself; the OAS
Progression page depends on its current behaviour.

## 2. Normalisation (agreed: normalised label text)

```ts
export function normaliseIStatement(label: string): string;
```

Applies, in order: trim → collapse internal whitespace runs to a single space →
lowercase → strip trailing punctuation (`.`, `!`) → normalise curly quotes
(`’` → `'`) and en/em dashes to hyphen.

This is the row-identity key. It is deliberately more aggressive than exact
matching because the same statement is phrased with trailing-period and
smart-quote differences across templates.

**Keep the raw variants.** Every merge must retain the list of distinct original
`label` strings so the UI can pick the most common one and (later) show what was
merged.

## 3. Types

```ts
export interface IStatementCell {
  skill: string;        // Terrain stream, e.g. "paddling"
  branch: string;       // Terrain branch, e.g. "canoeing"
  stage: number;        // 1-9
}

export interface IStatementRow {
  key: string;                    // the normalised text
  displayText: string;            // most common raw variant
  variants: Map<string, number>;  // raw label -> occurrence count
  cells: IStatementCell[];        // every place this statement appears
}

export interface SkillBranchGroup {
  skill: string;
  branch: string;
  label: string;        // "Paddling · Canoeing" — title-cased for display
  stages: number[];     // which stages actually exist for this pair
}

export interface IStatementMatrix {
  rows: IStatementRow[];
  groups: SkillBranchGroup[];
}
```

`displayText` resolution: highest count wins; ties broken **alphabetically** for
determinism (important — a non-deterministic tiebreak would make the table
shuffle between loads and make tests flaky).

## 4. The crawler

```ts
export async function buildIStatementMatrix(
  skills: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<IStatementMatrix>;
```

Steps:

1. Fetch each Skill's tree (`getCachedOASTree`) — these are cheap and cached.
2. `flattenOASTree` each into `(branch, stage, templateLink)` tuples. Collect
   across all Skills → this total is what feeds the progress bar denominator.
   Report progress **after the trees resolve** so the total is known and the bar
   is genuinely determinate.
3. Fetch all templates. **Bound the concurrency** — do not fire ~180 simultaneous
   `fetch`es at Terrain. `fetchOASProgressionForStream` (line 310) uses
   `Promise.all` over one stream's stages, which is fine at that scale, but here
   it would be all nine Skills at once.

   Copy the worker-pool idiom already in this file at
   `fetchAllOASProgression` (line 316) — a shared `queue` array with N `worker()`
   loops doing `queue.shift()`, awaited via `Promise.all`. Same pattern, but
   queueing template links instead of streams, and calling `onProgress` as each
   completes. Suggest 6–8 workers.
4. For each template, flatten to I-statements, filter out non-`verifiable_checkbox`
   inputs (see §1), normalise each label, and accumulate into the row map.
5. Build `groups` from the tuples actually seen, sorted by Skill (in
   `OAS_STREAMS` order, not alphabetical — it matches the OAS Progression page's
   ordering) then by branch alphabetically, with the trunk branch
   (`branch === skill`) sorted first within a Skill.
6. Sort rows. **Default order: by number of cells descending** (most-reused
   statements first — that is the page's whole point), tie-broken by
   `displayText` alphabetically.

Template fetch failures return `undefined` from `fetchOASTemplate` (it logs and
swallows). Skip those tuples but **count them as done** for progress, and
surface a count of failures on the result so Stage 2 can show "12 templates
could not be loaded" rather than silently showing an incomplete matrix.
Add `failedTemplates: number` to `IStatementMatrix` for this.

## 5. Tests

New file: `tests/unit/pages/IStatements/buildIStatementMatrix.spec.ts`,
following the existing unit-test layout.

Cover:

- `normaliseIStatement` — trailing period, curly vs straight apostrophe, case,
  doubled internal spaces, leading/trailing whitespace all collapse to one key.
- Two templates in different Skills with labels differing only by a trailing
  period produce **one** row with two cells.
- `displayText` picks the most common variant; alphabetical tiebreak on a 1–1 tie.
- `logbook_up_to_date` / `file_uploader` inputs never become rows.
- Trunk vs branch: a Paddling fixture yields a `paddling · paddling` group for
  stages 1–3 and separate `paddling · canoeing` etc. groups for 4–9.
- `onProgress` fires with a stable total and reaches `done === total`.
- A failed template increments `failedTemplates` and doesn't abort the crawl.

Use small hand-written fixtures, not real 180-template captures. The Paddling
tree from the session notes is a good realistic shape to base the tree fixture on.

## Verification

`npm test` passes, including the new spec. `npx tsc --noEmit` introduces no new
errors beyond the 4 known pre-existing ones (DataGrid generics ×3, OASHeatMap
ref, PresentAwards ref — verify by diffing against `git stash`). No UI to check
in the browser yet.
