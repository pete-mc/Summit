# Spike — can OAS data suggest term themes for leaders?

> **Status (2026-10-18):** planning only. Nothing is built, no branch or tag exists yet.
> **To resume:** copy this file to `code/.claude/OASThemes/PLAN_SPIKE_THEME_FINDER.md`, then start
> at "Setup" below. The open question for the user is who the one-Scout guide is for
> (leader, youth or parent); see findings Q5.

## Context

The OAS Progress page's Summary and Heat Map tabs show *where* members are; the Worksheet tab
is a tick-off sheet. Leaders still have to eyeball those views to decide "what should next term
(or the next few terms) be about?". The user wants to investigate auto-suggesting term themes from
the same data, which could later feed filtered worksheets or a multi-term plan.

User decisions so far:
- **Investigate first**: no production feature yet. Build a throwaway spike, judge it against real
  unit data, and write up the findings.
- **Ranking**: a blend of *breadth* (most members can progress), *Peak Award gaps* and
  *quick wins* (stages already partly done), with leader-adjustable weights (sliders).
- **Theme unit varies by unit age and experience**, so the spike must try all three:
  single skill+stage, one skill across a stage band, and a mixed multi-skill bundle.
- **Audience**: whole section by default, narrowed with the patrol filter.

Follow the precedent of `.claude/OASProgress/SPIKE_HEATMAP_DATATABLE.md`: use a spike branch
plus a restore tag, and a findings doc. Nothing merges to `main` unless the findings say so.

## Setup

- Tag `pre-theme-finder-spike` on `main`, then branch `spike/oas-theme-finder`.
- Feature folder: `.claude/OASThemes/`. Findings go in `SPIKE_THEME_FINDER.md`.

## What gets built (spike quality, but the scoring is unit-tested)

### 1. Pure scoring service: `src/pages/OasProgress/services/buildThemeCandidates.ts`
Input: `OASProgressRow[]` (already filtered by patrol) plus weights plus a theme mode. Output:
ranked candidates.

Reuse, don't rebuild:
- `awardedStagesByMember` from `buildPeakAwardSummaryRows.ts:92` gives the awarded stage set per
  member.
- `buildPeakAwardSummaryRows` / `data/peakAwardRequirements.ts` give the core-skill stage each
  member still needs for Peak.
- `getTrunkStageCount` from `buildOASProgressRows.ts:282` handles trunk vs branch stages.
- `groupRowsForHeatMap.ts` shows how to handle sections per trunk/branch.

Per candidate skill/branch/stage, compute these counts over the selected members:
- **ready**: previous stage awarded (or stage 1), this stage not awarded.
- **partial**: at least one statement answered, stage not awarded. Also record the average fraction
  answered.
- **peakNeed**: this is a core-skill stage at or below the member's Peak requirement and not yet
  awarded.
- **topOutstanding**: the I-statements (with Plan/Do/Review group) that the most ready or partial
  members still need. This shows what an activity would actually have to cover.

`score = wBreadth·(ready/N) + wPeak·(peakNeed/N) + wQuick·(avg partial fraction among partial)`

Theme modes:
- **Single**: one skill+stage per candidate.
- **Band**: one skill, stages k..k+2. A member counts if they can progress at least one stage
  inside the band. This suits mixed-age sections.
- **Bundle**: the leader picks 2–3 skills, and the spike shows combined coverage (members who
  progress in at least one skill, and in all of them). Plain combinatorics, no auto-search, to keep
  the spike small.

Handle template versions: a statement missing from a member's version is not "outstanding" (same
rule as the worksheet's `notApplicable`, `buildWorksheetPages.ts:268-281`).

### 2. Unit tests: `tests/unit/.../buildThemeCandidates.spec.ts`
Use small hand-made row fixtures, matching how the existing OAS service specs build rows. Cover
the ready, partial and peakNeed counts, band coverage, weighting order, and template-version
exclusion. Remember the ES5 Set-spread trap: use `filter`/`indexOf`, never `[...new Set()]`.

### 3. Temporary "Themes (spike)" tab
Added next to Summary, Heat Map, Table and Worksheet in `OasProgressVueContent.vue/.ts`, as
`OASThemeFinderVue.vue/.ts`:
- The patrol filter reuses the existing patrol control and pattern. New filter keys go in
  `OASProgressVueFilterPersistence.ts` with a `themes*` prefix, per the per-tab key convention.
- There are three weight sliders, a mode toggle (Single / Band / Bundle) and, in Bundle mode, a
  skill picker.
- The ranked list shows `Skill Stage(s) · score · ready / partial / peakNeed` for each candidate.
  Expanding a candidate shows the members involved and the top outstanding I-statements.
- A plain Vuetify `v-list`/`v-expansion-panels` is enough: no print, no styling polish. Check
  `.claude/DESIGN.md` for tokens only.

### 4. Selected members, down to one
The user also wants guides for a chosen handful of members, or a single Scout (e.g. a small Peak
Award group, a new member catching up, a youth-led personal plan).

**Member picker.** Today's member filter is a free-text substring only (`memberFilter`,
`OASHeatMapVue.ts:312`, `buildWorksheetPages.ts:136`). Add a multi-select `v-autocomplete`
(chips) of members to the Themes tab, using `getMemberDisplayName.ts` / name rules from
`.claude/NAME_RESOLUTION.md`. Empty means everyone in the selected patrols. Persist the selection
as `themesMemberIds`.

**One engine, three lenses.** Every count is already a fraction of the selected members, so
the scoring needs no special case. As N shrinks, "ready" collapses to 0/1 and the ranking
naturally favours partial stages and Peak gaps. Only the view changes:

| Selected | Lens | What it shows |
|---|---|---|
| Large (section/patrol) | **Theme ranking** | Ranked candidates as above |
| Small (2 to about 6) | **Shared next steps** | Candidates where *all* selected can progress, then *most*. Per-member chips show who is ready, partial or done, plus outstanding statements common to the group |
| One | **Personal guide** | Per skill: current stage → next stage, % done, outstanding I-statements by Plan/Do/Review, a Peak checklist (from `buildPeakAwardSummaryRows`), and suggested order: finish partial → Peak gaps → new ground |

The lens is picked automatically from N, with a manual override so we can compare lenses on the
same selection during the spike.

**Pace (exploratory).** Rows carry award `date`s. For one or a few members, estimate stages per
term from the last 12 months of awards. Show "at this pace, Peak core skills in about X terms" and
which stages fit in 1, 2 or 3 terms. Treat this as an experiment: imported awards and long
breaks may make it noisy, and the findings should say whether it is trustworthy.

**Tests.** Add specs for: N = 1 (ready is 0/1, partial ranks first), N = 3 shared-step
"all vs most" split, and members on different template versions in one selection.

## Not in the spike (candidates for after the findings)
- A "Theme → Worksheet" button that sets the `worksheet*` filters (skills, stages, patrols).
  Probe it only if time allows: it is just a filter write plus `viewMode = 'worksheets'`.
- A multi-term planner, printing, Excel export.

## Findings doc: `.claude/OASThemes/SPIKE_THEME_FINDER.md`
Record the answers from real-unit testing:
1. Do the top 5 suggestions match what an experienced leader would pick? Where do they go wrong?
2. Which weights felt right by default? Is a slider useful, or would 2–3 presets
   ("Peak push", "Broad", "Quick wins") be better?
3. Single vs Band vs Bundle: which was most useful for this section's age and experience?
4. Is the "top outstanding statements" list useful for designing activities?
5. For a small group or one Scout: does the personal guide or shared-steps view give a leader (or
   the youth) a useful starting point? Who is the guide really for: the leader, the youth
   (Scout-led planning), or a parent? Does that change what it should print as?
6. Is the pace estimate believable for real members, or misleading?
7. Is the follow-on Theme → Worksheet, a personal-guide printout or a Term Planner worth
   building? Recommend the next PLAN.

## Verification
- `npm test`: the new spec passes (ignore the known UNC smoke-test failure).
- `npm run build`, then reload the unpacked `dist/` in Edge, open OAS Progress → Themes (spike)
  on the real unit.
- Use DevTools to sanity-check one candidate's ready/partial counts against the Heat Map tab for
  the same skill and stage.
- Check that the patrol filter changes the counts, and that the sliders reorder the list live.
- Pick 1 member and check the personal guide against that member's Heat Map row and Summary
  row. Pick 3 members and check the shared next steps against the Heat Map.
- The user and I review the results together and fill in the findings doc.
