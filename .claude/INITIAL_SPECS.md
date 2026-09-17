<!-- @format -->

# Terrain OAS & I-Statement Data — Aggregation/Charting Brief

## Goal

Extend the functionality of the Summit extension module. To start with we are aiming to pull
Outdoor Adventure Skill (OAS) progress for a whole Scout unit — down to individual
**i-statement** granularity — and shapes it for aggregation/charting, the way the
Topo-Blazor project's "OAS Worksheet (PDF)" report does today.

Reference repos:

- Summit (browser extension): https://github.com/pete-mc/Summit
- Topo-Blazor (the tool that already does i-statement worksheets):
  https://github.com/NomisNostab/Topo-Blazor

## Terrain API surface involved

All three endpoints below are the real Australian Scouts Terrain APIs (confirmed
from both Summit's `src/services/*.ts` and Topo-Blazor's `TerrainAPIService.cs`).
They require an `Authorization` token — both projects obtain this by piggybacking
on a logged-in Terrain browser session (Summit runs in-page as an extension; Topo
does its own auth flow).

### 1. OAS stream/stage tree — discover what stages exist

```
GET https://templates.terrain.scouts.com.au/oas/{stream}/tree.json
```

`{stream}` is one of: `bushcraft`, `bushwalking`, `camping`, `aquatics`, `boating`,
`paddling`, `alpine`, `cycling`, `vertical`.

Returns a nested tree (`tree.children[]`) of stages/branches per stream, each node
having `branch_id`, `title`, `stage`, `template_link`. Walk this recursively to get
every `(stream, branch, stage)` combination that exists.

### 2. OAS template — the actual i-statement text (member-independent, cacheable)

```
GET https://templates.terrain.scouts.com.au/{stream}/latest.json
```

Returns the form definition for that stream's current stage template:

```jsonc
{
  "template": "...",
  "meta": { "stage": 3, "stream": "bushwalking" },
  "version": 1,
  "document": [
    {
      "title": "Bushwalking Stage 3",           // -> worksheet/template title
      "input_groups": [
        {
          "title": "Plan>",                      // Plan / Do / Review
          "inputs": [
            { "id": "abc123", "type": "...", "label": "I can pack appropriate gear for an overnight hike" },
            { "id": "file_uploader", ... }        // skip this one, it's not a real i-statement
          ]
        }
        // "Do>", "Review>" groups follow the same shape
      ]
    }
  ]
}
```

- `input.label` **is the i-statement text.**
- `input.id` is the key you'll match against member answers (below).
- Skip inputs with `id === "file_uploader"`.
- Sort order for a sane worksheet: `input_groups` in Plan → Do → Review order, then
  input order within the group.
- This endpoint barely changes — fetch once per stream/stage and cache it.

### 3. Unit achievements — per-member progress, filterable to one exact stage

```
GET https://achievements.terrain.scouts.com.au/units/{unitId}/achievements
    ?type=outdoor_adventure_skill&stream={stream}&branch={branch}&stage={stage}
```

(Summit already calls a looser version of this — `?type=outdoor_adventure_skill`
with no stream/branch/stage filter — to build its existing OAS Report page. Adding
the extra filters is what narrows it to one specific stage's worksheet.)

Each result:

```jsonc
{
  "id": "...",
  "member_id": "...",
  "status": "draft_review" | "pending_review" | "awarded" | "approved" | "...",
  "status_updated": "2020-11-18T00:00:00Z",
  "achievement_meta": { "stream": "bushwalking", "branch": "...", "stage": 3 },
  "answers": {
    "abc123_verifiedDate": "18/11/2020",     // <-- i-statement level answer!
    "logbook_up_to_date": "true"
  },
  "imported": { "date_awarded": "2019-05-01" }   // present for paper-imported achievements
}
```

**This is the key thing Summit's code doesn't currently exploit.** Summit's own
`TerrainAchievements.answers` type already models this generically
(`Record<string, string[] | boolean | ... | string>`), but nothing in Summit's OAS
code (`OasReportItem.ts`) reads it — it only reads `achievement_meta.stage` (i.e.
"what stage did they reach", not "which individual statements are ticked").

The i-statement-level signal lives in `answers`, as keys of the form
`{input_id}_verifiedDate` (plus one special key, `logbook_up_to_date`).

## The join (how Topo-Blazor builds its worksheet)

This is the exact algorithm from `Topo/Services/OASService.cs`
(`GenerateOASWorksheetAnswers`):

1. **Fetch the template** for the target stream/stage → flatten into an ordered
   list of `{ inputId, inputLabel, inputGroup, sortIndex }` (skip `file_uploader`).
2. **Fetch unit members**, filter out adult leaders, sort by name.
3. **Build a full cross-join matrix up front**: every member × every i-statement,
   all cells starting blank/unanswered. This guarantees every row/column exists
   even for members with zero progress yet.
4. **Fetch achievements** for that unit filtered to the exact stream/branch/stage.
5. **For each member's achievement record**, depending on `status`:
    - `draft_review` / `pending_review` (in progress): look at `answers`, take
      entries whose key ends in `_verifiedDate` (or equals `logbook_up_to_date`),
      strip the `_verifiedDate` suffix to get the `inputId`, and fill in that
      matrix cell with the date value. Mark `Answered = true`.
    - `awarded` / `approved` (complete):
        - If `imported.date_awarded` is set (paper-imported record with no
          per-question data): stamp **every** i-statement cell for that member with
          the import date. Mark `Answered = Awarded = true`.
        - Else if `answers` is empty/missing entirely (older awarded record): same
          fallback, stamp every cell with `status_updated`.
        - Else: same per-key join as the in-progress case, but stamp with
          `status_updated` and mark `Awarded = true` too.
6. **Optional `hideCompletedMembers` filter**: drop any member who is fully
   awarded, so the worksheet only shows people still working through it.
7. **Sort** the final flat list by input-group order, then input order — this
   becomes row order in the worksheet.
8. **Render/group**: Topo groups the flat answer list by `TemplateTitle`
   (effectively "stream + stage", e.g. "Bushwalking Stage 3") and optionally by
   patrol, then lays out members as columns and i-statements as rows, and exports
   via a spreadsheet library (Syncfusion) to PDF. That's the "grouped by Unit and
   Stage" behaviour you observed — each worksheet run is scoped to one unit + one
   exact `(stream, branch, stage)` combination.

## Target output shape for aggregation/charting

Flatten step 5 into rows like:

```jsonc
{
    "unitId": "...",
    "stream": "bushwalking",
    "branch": "...",
    "stage": 3,
    "inputGroup": "Plan", // Plan / Do / Review
    "inputId": "abc123",
    "iStatement": "I can pack appropriate gear for an overnight hike",
    "memberId": "...",
    "memberName": "...",
    "answered": true,
    "awarded": true,
    "date": "2020-11-18", // or null if unanswered
}
```

That's a clean tidy/long table — trivially pivotable for charts: % of unit that's
ticked each i-statement, per-member progress bars across a stage, time-to-complete
per statement, etc.

## Implementation notes / gotchas to carry into the build

- **No single call gets everything.** To chart a whole unit's OAS progress at
  i-statement granularity, loop the achievements call (endpoint #3) once per
  distinct `(stream, branch, stage)` combination discovered from the tree
  (endpoint #1). Cache templates (endpoint #2) aggressively — they rarely change.
- **Date parsing is messy.** Topo-Blazor has a `ConvertAnswerDate` helper because
  Terrain answer dates show up in both `dd/MM/yyyy` and `M/dd/yyyy` format
  inconsistently — worth porting that heuristic (try AU format first, fall back to
  US format if the parsed date is after `status_updated`).
- **`file_uploader` inputs aren't real i-statements** — filter them out of the
  template before joining.
- **Imported/legacy awarded records have no per-statement data** — you can only
  say "fully awarded on date X", not which statements were individually ticked.
  Don't treat missing per-key answers as "not done" for these — check `imported`
  and `answers`-empty cases first, as shown in step 5.
- **Auth**: this needs to run in a context that already holds a valid Terrain
  session token (same-origin `Authorization` header), same as Summit's existing
  services (`TerrainState.getToken()` / `TerrainState.getUnitID()`). If this
  becomes a standalone script rather than a Summit-extension module, you'll need
  to source that token some other way (e.g. paste from browser devtools, or reuse
  Topo-Blazor's own auth flow).

## Suggested starting point for Claude Code

1. Decide: extend Summit (TypeScript, runs in-browser with an existing auth
   context) vs. a standalone script (needs its own auth handling).
2. Port `GetOASTreeAsync` → discover all `(stream, branch, stage)` tuples for the
   unit's relevant streams.
3. Port the template fetch + flatten (endpoint #2) with an in-memory/localStorage
   cache keyed by stream+stage.
4. Port the achievements fetch + join logic (`GenerateOASWorksheetAnswers`) into
   the tidy-row shape above instead of a worksheet grid.
5. Emit JSON/CSV in the tidy shape, then wire up whatever charting layer you want
   (the existing Summit `chart`/report scaffolding, or an external tool).

## GUI

### OAS Progression

Something that gives the leader a 'heat map' view of their Units progress through the OAS's.
Refer to attached sketch @"P:\Dev\personal\terrain_summit\resources\GUI sketch heatmap.jpeg"

- Vertically, the page shows each OAS.
- Each OAS has a group of rows containing each youth member.
- Horizontally, the page shows the youth members progression.
    - First the highest level achieved
    - Large columns for each progression level.
    - A colour square for eavery I statement achieved.

Need the ability to:

- Hide the members surname.
- Obfuscate the name using a simple static codename.
- Filter or break by patrol
- Deselect OAS's
- Zoom horizontally to show only a range of levels.
