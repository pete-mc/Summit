# NAME_RESOLUTION.md — Member name handling (first/last name) across Summit

Read this before writing any code that sorts, formats, or displays a Terrain member's name,
in any page — not just OAS Progression, where this rule was first established.

## The rule

**Terrain's real member-list API provides genuine, separate `first_name`/`last_name` fields.**
This is confirmed independently from two sources:

- `TerrainUnitMember` (`src/types/terrainTypes.d.ts`) — the type this codebase's own fetch
  layer (`src/services/fetchUnitMembers.ts`, hitting
  `members.terrain.scouts.com.au/units/{unitId}/members`) already returns.
- The separately-cloned Topo-Blazor reference app
  (`p:\Dev\personal\terrain_summit\reference\Topo-Blazor`, outside this repo, not tracked) has
  a field-for-field identical C# model for the same endpoint and uses `first_name`/`last_name`
  directly in production — e.g. its `GetMemberLastName` feature (suppressing a surname to an
  initial) only works because `last_name` is a real, discrete field to begin with.

**Never concatenate `first_name + " " + last_name` into one string and then re-split that
string later to recover the parts.** This round trip is lossy for any multi-word given or
family name — splitting `"Van Der Berg"` on whitespace and taking the last token recovers only
`"Berg"`, silently discarding `"Van Der"`. The same problem hits a multi-word given name (e.g.
`"Mary Anne"`) for any logic that takes `parts[0]` as "the first name."

A single combined `name: string` field (no split possible) is correct and expected from a
*different*, narrower Terrain endpoint — `/profiles` (login/session data, modelled here as
`ProfileMember`). That endpoint genuinely never had first/last separated in the first place,
so splitting its `name` on whitespace is the best you can do there. The rule above applies
specifically to data that already arrived as separate `first_name`/`last_name` and was then
discarded by this codebase's own code, not to data that was never separated to begin with.

## What this looks like in code

- **Carry `firstName`/`lastName` as their own fields** through every row/view-model shape that
  needs to sort or format by name — `OASProgressionRow`, `SectionMemberRow`,
  `MemberSectionView`, `WorksheetMember` all do this (see "Where this is implemented" below).
- **A combined `memberName`/`displayName` string is fine to keep** alongside the separate
  fields, for the one use case where concatenation is lossless: a plain substring search (the
  Member-filter text box) or an export column that's only ever read by a human, never re-parsed
  by code. The moment you need to compare, sort, or reformat by name part, use the separate
  fields — never re-split the combined string.
- **`getMemberDisplayName()`** (`src/pages/OasProgression/services/getMemberDisplayName.ts`) is
  the one shared function that turns `(firstName, lastName)` into whatever the user's chosen
  "Names" display format calls for (Full Name / First Name / FirstName.L / F.LastName /
  Codename). It takes `firstName`/`lastName` as two separate parameters — never a combined
  string — specifically so it never needs to guess how to split one.
- **Sorting** (`sortMembers()` in `filterHeatMapSections.ts`, `sortWorksheetMembers()` in
  `buildWorksheetPages.ts`) compares `.firstName`/`.lastName` directly via `localeCompare`,
  never a derived split of a combined string.

## Where this is implemented

- `src/types/terrainTypes.d.ts` — `TerrainUnitMember.first_name`/`.last_name`: the source of
  truth, already separate. No change needed here, ever — this is Terrain's own shape.
- `src/pages/OasProgression/services/buildOASProgressionRows.ts` — `OASProgressionRow` carries
  `firstName`/`lastName` alongside its existing `memberName` convenience string.
- `src/pages/OasProgression/services/groupRowsForHeatMap.ts` — `SectionMemberRow` likewise.
- `src/pages/OasProgression/services/groupSectionsByMember.ts` — `MemberSectionView` likewise.
- `src/pages/OasProgressionVue/services/buildWorksheetPages.ts` — `WorksheetMember` carries
  `firstName`/`lastName` alongside `displayName` (the already-formatted string to print).
- `src/pages/OasProgression/services/getMemberDisplayName.ts` — takes `firstName`/`lastName`,
  never a combined string.

## History

This was wrong for a while. The original implementation (across several rounds of the OAS
Progression Heat Map/Worksheets work) concatenated `first_name + " " + last_name` into
`memberName` at the point rows were first built (`groupRowsForHeatMap.ts`,
`buildOASProgressionRows.ts`), then had two separate whitespace-splitting functions —
`lastNameOf()`/`firstNameOf()` in `filterHeatMapSections.ts`, and a third copy of the same
pattern inside `getMemberDisplayName()` for its "FirstName.L"/"F.LastName" initial formats — to
recover the parts later for sorting and display formatting. All three were removed when this
was fixed; if you see a function that splits a name string on whitespace anywhere in this
codebase going forward, it is very likely solving a problem that carrying `firstName`/
`lastName` through from the start would avoid entirely.

The legacy React OAS Progression page that used to have its own, simpler version of this pattern
has since been deleted entirely (see `.claude/DESIGN.md`) — this history is kept only in case an
old commit/plan is cross-referenced against current guidance.

## For future Vue pages (I Statements, Present Awards, anything new)

`src/pages/IStatements/` does not currently display or sort by individual member names at the
row level (confirmed: no `first_name`/`last_name`/`memberName`/name-splitting logic exists
there at all as of this writing) — the guard test
`tests/unit/components/istatement-matches-oas-progression.spec.ts` exists to keep it in step
with OAS Progression's heat map generally. If I Statements (or any future page) ever needs to
sort or display members by name, reuse `getMemberDisplayName()` and the `firstName`/`lastName`
fields already available on `TerrainUnitMember`, following this same rule — don't reintroduce
a name-splitting helper for a new page when a perfectly good shared one already exists.
