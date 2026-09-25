<!-- @format -->

# Stage 1 — Data Layer

See [PLAN.md](PLAN.md) for full context, confirmed decisions, and verified
codebase facts. This stage is fully headless — no UI, no page, just services,
pure join-algorithm functions, and their unit tests.

## Goal

Prove the OAS tree → template → achievements → tidy-row pipeline is correct
via unit tests, with zero UI. This is the highest-risk logic in the whole
feature (the join has 5+ branches per the spec), so it's validated first and
in isolation before any page/UI work depends on it.

## New types

Add to `src/types/terrainTypes.d.ts`:

```typescript
export interface OASTreeNode {
  branch_id: string;
  title: string;
  stage: number;
  template_link?: string;
  children?: OASTreeNode[];
}
export interface OASTree {
  stream: string;
  children: OASTreeNode[];
}
```

Reuse `SIATemplate` for the template endpoint's response shape (optionally
alias `export type OASTemplate = SIATemplate;` for readability at call sites).

## New services

`src/services/`, each added to the `src/services/index.ts` barrel export,
following the exact fetch-wrapper pattern already used in
`fetchUnitAchievementsFilterd.ts` (try/catch, `TerrainState.getToken()` guard,
`response.ok` check, `mode: "cors"` / `credentials: "same-origin"` / etc.):

- **`fetchOASTree.ts`** —
  `GET https://templates.terrain.scouts.com.au/oas/{stream}/tree.json` →
  `Promise<OASTree | undefined>`
- **`fetchOASTemplate.ts`** —
  `GET https://templates.terrain.scouts.com.au/{stream}/latest.json` →
  `Promise<SIATemplate | undefined>`

Both return `undefined` on any failure (matching `fetchSIATemplate.ts`'s
contract for a single-object response, not `fetchUnitMembers.ts`'s
`[]`-on-failure array contract).

## Caching helper

New file `src/helpers/OASTemplateCache.ts`, same style as
`SummitCalendarDraftPersistence.ts` (module-level key constants, try/catch
localStorage, JSON round-trip). Per the confirmed daily-cache decision, this
covers templates, trees, **and achievements**, each entry stored with a
timestamp and a **1-day TTL**:

```typescript
export function loadCached<T>(key: string, maxAgeMs: number): T | null;
export function saveCached<T>(key: string, value: T): void;
export function clearCache(streamFilter?: string): void; // full reload (no arg) or per-stream reload
```

Cache keys:

- `summit.oas.tree.{stream}`
- `summit.oas.template.{stream}`
- `summit.oas.achievements.{stream}.{branch}.{stage}`

**Before finalizing the template cache key**, confirm the live response shape
during implementation — the spec's prose says "cache keyed by stream+stage"
but the endpoint URL itself has no stage segment (`/{stream}/latest.json`).
Design assumes stream-only keying unless a live fetch shows the response
actually varies per stage under that same URL.

## Join algorithm (pure functions)

New file `src/pages/OasProgression/services/buildOASProgressionRows.ts`
(colocated with the new page, matching how `OasReportItem.ts` lives under
`OasReport/models/`). This is a direct port of Topo-Blazor's
`GenerateOASWorksheetAnswers`, split into small, independently-testable pure
functions matching the spec's step-by-step algorithm:

```typescript
export interface FlattenedIStatement {
  inputId: string;
  iStatement: string;
  inputGroup: string;
  sortIndex: number;
}
export function flattenOASTemplate(template: SIATemplate): FlattenedIStatement[];
// Iterate input_groups in Plan -> Do -> Review order (via InputGroup.title),
// skip inputs where id === "file_uploader", assign sortIndex as a running counter.

export interface OASProgressionRow {
  unitId: string;
  stream: string;
  branch: string;
  stage: number;
  inputGroup: string;
  inputId: string;
  iStatement: string;
  memberId: string;
  memberName: string;
  patrolName: string | null; // added beyond the spec's literal shape, for Stage 4's patrol filter — avoids a second join at render time
  answered: boolean;
  awarded: boolean;
  date: string | null;
}

export function buildBlankMatrix(
  unitId: string,
  stream: string,
  branch: string,
  stage: number,
  iStatements: FlattenedIStatement[],
  members: TerrainUnitMember[],
): OASProgressionRow[];
// Cross-join every member x every i-statement, all cells answered=awarded=false, date=null.

export function applyAchievementsToMatrix(matrix: OASProgressionRow[], achievements: TerrainAchievements[]): OASProgressionRow[];
// Pure — returns a NEW array, does not mutate. Implements spec step 5's branching:
//   - draft_review / pending_review (in-progress): read `answers`, keys ending `_verifiedDate`
//     (strip suffix -> inputId) or equal to `logbook_up_to_date`; fill matching cells;
//     answered=true, awarded=false.
//   - awarded / approved:
//       - imported.date_awarded set -> stamp EVERY cell for that member with that date;
//         answered=awarded=true.
//       - else answers empty/missing -> stamp EVERY cell with status_updated;
//         answered=awarded=true.
//       - else -> same per-key join as in-progress, but stamp with status_updated
//         and also set awarded=true.

export function parseTerrainAnswerDate(rawDate: string, statusUpdated: string): Date | null;
// Uses `moment` (already a project dependency) in strict mode:
//   try moment(rawDate, "DD/MM/YYYY", true) first;
//   if the parsed date is AFTER statusUpdated, retry as moment(rawDate, "M/DD/YYYY", true);
//   return null if neither parses.

export function flattenOASTree(tree: OASTree): Array<{ branch: string; stage: number }>;
// Recursive walk of tree.children[]. VERIFY during implementation whether every node
// or only leaf nodes should be collected — cross-check against a live tree response
// and Topo-Blazor's GetOASTreeAsync if the shape is ambiguous.

export async function fetchOASProgressionForStage(unitId: string, stream: string, branch: string, stage: number, members: TerrainUnitMember[]): Promise<OASProgressionRow[]>;
// Orchestration: cached-or-fetched template -> flattenOASTemplate -> buildBlankMatrix
// -> cached-or-fetched achievements (type=outdoor_adventure_skill&stream=&branch=&stage=)
// -> applyAchievementsToMatrix -> sort by sortIndex -> drop sortIndex before returning
// (public OASProgressionRow shape has no sortIndex field; sorting happens internally).
```

## Tests

New spec files, following this codebase's established conventions:

- `tests/unit/pages/OasProgression/services/buildOASProgressionRows.spec.ts` —
  hand-built fixture factories (mirroring `OasReportItem.spec.ts`'s
  `makeMember`/`makeXAchievement` style), covering **every branch** from spec
  step 5:
  - in-progress (`draft_review`/`pending_review`) with partial `answers` →
    correct cells filled, `answered=true, awarded=false`
  - awarded + `imported.date_awarded` set → every cell stamped with that
    date, both flags true
  - awarded + empty/missing `answers`, no `imported` → every cell stamped
    with `status_updated`
  - awarded + populated `answers` → per-key join, `awarded=true` too
  - member with zero achievement records at all → all cells blank
    (cross-join guarantee)
  - `file_uploader` input excluded from the flattened template
  - `logbook_up_to_date` key handled alongside `{inputId}_verifiedDate`
  - `flattenOASTree` walk produces the expected `{branch, stage}` tuples
- `parseTerrainAnswerDate.spec.ts` (or folded into the above spec) — both
  AU/US date formats, and an explicit ambiguous-date case (e.g.
  `"03/04/2020"`) proving the `status_updated`-based disambiguation actually
  picks the correct interpretation.
- `tests/unit/services/fetchOASTree.spec.ts` and `fetchOASTemplate.spec.ts` —
  using the shared `tests/unit/services/mocks/fetchMock.ts` and
  `mocks/terrainStateMock.ts`, matching `fetchUnitMembers.spec.ts`'s
  conventions: no-token guard, correct URL construction, non-OK response
  handling, thrown-error handling.
- `tests/unit/helpers/OASTemplateCache.spec.ts` — cache hit/miss/write
  round-trip, TTL expiry, malformed-JSON-in-localStorage resilience,
  per-stream `clearCache(stream)` vs. full `clearCache()`.

## Acceptance criteria

- [x] `OASTreeNode`/`OASTree` types added to `terrainTypes.d.ts`
- [x] `fetchOASTree.ts` and `fetchOASTemplate.ts` implemented and exported from `src/services/index.ts`
- [x] `src/helpers/OASTemplateCache.ts` implemented with tree/template/achievement caching, 1-day TTL, full and per-stream clear
- [x] `src/pages/OasProgression/services/buildOASProgressionRows.ts` implements all functions listed above
- [x] All new unit tests pass, covering every join-algorithm branch and both date formats
- [x] `npm test` — no regressions in the existing suite (219/220 passing; the 1 failure is the pre-existing unrelated UNC-path smoke test)
- [x] `npm run lint` — new files clean
- [x] Live-endpoint check done: **real shape differs from this doc's original assumption** — see
      "Real API shapes" in [PLAN.md](PLAN.md) for the corrected `OASTree`
      wrapper shape, the single-root walk, and the per-node `template_link`
      requirement (discovered via a real Stage 2 bug: zero rows loaded
      silently until fixed). `flattenOASTree` walks **every node**, not just
      leaves — confirmed live via Bushcraft's fork into `pioneering` /
      `survival-skills` branches at stage 4, both present in real loaded data.
