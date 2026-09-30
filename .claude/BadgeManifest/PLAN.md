# Badge Manifest — plan

## Why

Badge artwork lookup is currently two hardcoded maps that duplicate each other, keyed by strings
that were *inferred* rather than verified. That produced a silent failure on 2026-09-30: the camper
awards were keyed `camping_N` (guessed from artwork filenames) when Terrain sends
`camper_award_N`, so five badges rendered blank placeholders with no error anywhere.

Two distinct problems, and it matters not to conflate them:

1. **Structure** — the lookup is duplicated across `getSkillIconUrl.ts` and `getBadgeIconUrl.ts`,
   and nothing records which awards exist but lack artwork.
2. **Provenance** — keys were derived from filenames instead of from Terrain's data. A table alone
   does not fix this; only checking against a real reference does.

This plan fixes both, with the validation test as the load-bearing part.

## Source of truth

Terrain's own shipped bundle, captured at `docs/terrain.scouts.com.au/_nuxt/app.*.js`. It contains
a literal asset map naming every badge SVG Terrain ships. Extracted 2026-09-30:

- **32 additional awards** — `"./additional-award-badges/<id>.svg"`
- **15 milestones** — `"./milestones/<section>/milestone-<1|2|3>.svg"`, 5 sections × 3 stages
- **5 peak awards** — `"./icons/icon-peak-award-<section>-active.svg"`
- **9 OAS skills** — already covered by local artwork

Cross-checks performed:

- **Topo-Blazor** (`reference/Topo-Blazor`) — confirms the same `achievement_meta.additional_award_id`
  field shape (`Model/AdditionalAwards/GetUnitAchievementsResultModel.cs`) and milestone stages 1–3,
  but hardcodes no id list; it reads them from the API. Not a source of ids.
- **Summit** — `src/shared/siaTypes.ts` holds the 6 SIA ids (`sia_adventure_sport` etc.);
  `src/shared/TerrainAchievementType.ts` holds the 10 achievement types.
- **`resources/*.json`** — contains no additional awards, but `example_tree.json` *does* show a
  real OAS tree (Paddling), and it is what surfaced the sub-branch fork issue: `branch_id` forks
  into `canoeing`/`kayaking`/`sea-kayaking`/`white-water-kayaking`/`white-water-rafting`, none of
  which have Terrain artwork or a manifest entry. See "OAS sub-branches" below.

⚠️ The bundle is a **captured snapshot**. If Terrain ships a new award, this repo will not know
until someone re-captures it. The validation test guards against drift *within* the repo, not
against Terrain changing upstream.

## Design

### `src/shared/badgeManifest.ts`

One TypeScript module (not JSON — it gets type checking and comments for free, and webpack already
bundles it with no config change):

```ts
export interface BadgeEntry {
  /** Artwork path relative to images/, or null when no artwork exists yet. */
  file: string | null;
  /** Human label, for tooltips and for making an unfilled row obvious in the manifest. */
  label: string;
  /** Wide (96x66) vs square (85x85) artwork — the table sizes these differently. */
  wide?: boolean;
}

export const BADGE_MANIFEST: Record<string, BadgeEntry> = { ... };
```

Keyed by the `badgeKey` that `SummitAchievement.getBadgeKey()` produces. Entries:

| Group | Count | Have artwork | Key shape |
|---|---|---|---|
| OAS skills | 9 | 9 | `bushwalking` |
| Additional awards | 32 | 16 | `camper_award_10` |
| Milestones | 15 | 3 | `milestone_venturer_1` |
| Peak awards | 5 | 0 | `peak_award_venturer` |
| SIAs | 6 | 0 | `sia_environment` |
| Other types | 5 | 0 | `adventurous_journey` |

**72 rows, 28 with artwork.** The 44 `file: null` rows are the point: they make the gaps visible
and give somewhere to drop a filename without touching code.

Every group is written out one row per badge, including the ones with no artwork. Milestones and
peak awards were briefly generated from a section × stage loop; that was replaced because a loop
has nowhere to put a per-row filename, which broke as soon as the three Venturer milestones
arrived. Generated rows also read inconsistently beside the hand-listed OAS and award tables.

### `getBadgeKey()` changes

Each award type is keyed as narrowly as its artwork actually varies — a key coarser than the
artwork makes distinct badges share one icon:

- `milestone` + section + `achievement_meta.stage` → `milestone_scout_2`
- `peak_award` + section → `peak_award_venturer`
- SIA → `answers.special_interest_area_selection` → `sia_environment`
- OAS → `achievement_meta.branch`, falling back to `achievement_meta.stream`

Each falls back to the bare type when its metadata is missing, so an unexpected payload degrades
to a placeholder rather than throwing.

#### OAS sub-branches (GUI calls these "streams")

**The stream is the skill; the branch is the sub-branch.** An OAS tree runs several trunk stages
where `branch` equals `stream`, then forks into named sub-branches — `example_tree.json` shows
Paddling forking into canoeing, kayaking, sea-kayaking, white-water-kayaking, white-water-rafting.

Scouts Australia awards **no badge for a sub-branch**: a branch wears its parent skill's badge,
and Terrain ships artwork for the nine skills only (verified — the bundle has no pioneering or
survival asset). Keying on `branch` alone therefore produced a blank placeholder for every award
past a fork, guaranteed rather than hypothetical.

So `getBadgeKey()` prefers `branch` (it equals the skill on trunk stages, and keeps working if
sub-branch artwork is ever added) and falls back to `stream` when the branch has no badge of its
own. Deliberately **not** a hardcoded sub-branch → skill map: Terrain can add sub-branches, and
such a list would go silently stale — the same failure class as the guessed camper award ids.

A stale comment in the code asserted the opposite of this ("the branch is the specific skill; the
stream is the broader grouping") and was corrected.

### Resolvers become thin

`getSkillIconUrl.ts` and `getBadgeIconUrl.ts` keep their current exported signatures — no calling
code changes, and the existing tests keep working as a safety net — but both read from
`BADGE_MANIFEST` instead of their own map. The duplicate OAS table is deleted.

## Validation test — the important part

`tests/unit/shared/badgeManifest.spec.ts`:

1. **Every `file` that is non-null exists on disk.** Catches filename typos, which otherwise 404
   invisibly in the browser.
2. **Every additional-award key in the manifest appears in Terrain's bundle**, and every
   additional-award id in the bundle appears in the manifest. This is the check that would have
   caught the `camping_N` bug, and it fails loudly if Terrain's captured bundle gains an award.
3. **No duplicate filenames** across entries (a copy-paste guard).
4. **Every artwork folder is covered by `manifest.json`'s `web_accessible_resources`** — the check
   that would have caught the `milestones/` folder shipping with no matching entry.
5. Milestone/peak award section coverage, key normalisation, label completeness, and a resolve
   smoke test.
6. **Coverage report** — logs how many entries lack artwork, so the gap is visible in test output
   rather than discovered on the page.

Check 2 is the one that turns "use solid references" from a habit into something enforced.

## Out of scope

- Re-capturing Terrain's bundle (separate task; note the staleness risk above).
- A build-time code generator — overkill for 72 rows.
- Sourcing the missing 55 artworks; the manifest is where they land when they arrive.

## Status

- [x] Inventory extracted and cross-checked (2026-09-30)
- [x] Granularity confirmed with user: per-section milestones/peak awards, all 32 additional awards
- [x] Built 2026-09-30 — `src/shared/badgeManifest.ts`, both resolvers rewritten to read from it,
      `getBadgeKey()` widened for milestones/peak awards/SIAs, 8 validation tests added.
      697 unit tests pass (the 1 failure is the known UNC-path smoke test); build clean; no new
      type errors (51 before and after, all upstream).
- [x] Milestone/peak award tables converted from generated to explicit rows (2026-09-30), after
      the user pointed out the inconsistency with OAS's hand-listed table — see the design section
      above. `manifest.json`'s three per-folder `web_accessible_resources` entries were also
      collapsed to one `images/*`, so a new badge folder (like the `milestones/` one just added)
      can't be forgotten and 404 silently again. A 9th validation test checks every artwork
      folder in the manifest is covered by the extension manifest.
- [x] OAS sub-branch fallback added (2026-09-30) — see "OAS sub-branches" above. 2 more tests.
      **72 badges, 28 with artwork, 44 awaiting**, coverage logged on every test run.

### Gotcha found while building: ES5 Set spreading silently returns []

`tsconfig.json` sets `"target": "es5"` with no `downlevelIteration`, so `[...new Set(arr)]`
compiles to an empty array — **no error, no warning, just silent data loss**. This cost real
debugging time: the bundle-comparison test reported 0 extracted ids while a plain `.split()` on
the same string found all 32.

`badgeManifest.spec.ts` therefore de-duplicates with `.filter((v, i, a) => a.indexOf(v) === i)`.
No shipped code under `src/` currently spreads a Set (checked), but anything added later must
avoid it or the tsconfig needs `downlevelIteration`.

This is also why that test asserts `terrainIds.length > 20` before comparing: without the sanity
check, an empty extraction would have made the comparison pass vacuously — the test would have
"verified" the manifest against nothing at all.
