# Outstanding work

One list of open items across features. Details live in each feature's plan; keep this list short and
remove items once they're done.

Last updated 2026-11-25.

## Open PRs

- **Terrain bundle refresh (`pr/terrain-bundle`):** only `docs/`. Until it's merged, feature PR branches
  keep upstream's copy (see the step in CLAUDE.md). Afterwards, drop that step. See
  [TerrainBundle/PLAN.md](TerrainBundle/PLAN.md).
- PR #164 merged in 3.2.6 (2026-11-10).

## Held back from the PR (live on `main` only)

- **Present Awards (Vue):** not ready to ship. See [PresentAwardsVue/PLAN.md](PresentAwardsVue/PLAN.md).
- **I Statements:** not ready, future undecided. See [I_Statement/PLAN.md](I_Statement/PLAN.md).
- How they're kept out of the PR, and how to let one back in: "Unfinished pages are `main`-only too"
  in [CLAUDE.md](CLAUDE.md).

## OAS Progress

- **Next Steps tab** (was Table / I-Statements): print/PDF modelled on Terrain's stage sheets (Guidance,
  Comments, Verifier columns) is next. See [OASProgress/PLAN_TABLE_REQUIREMENTS.md](OASProgress/PLAN_TABLE_REQUIREMENTS.md).
- **Drill-down links between tabs** (was "Heatmap ↔ Stage Grid linking", listed under "Still to do" in the PR).
  Done 2026-11-24 for Summary, Peak Award, Heat Map and Stage Grid (cells → Next Steps; "Open in" menus; back bar),
  explained on the About tab. Not yet pushed or PR'd (planned branch `pr/oas-drill-down`). Optional later: links out
  of Next Steps, open-in-new-browser-tab. See [OASProgress/PLAN_DRILL_DOWN.md](OASProgress/PLAN_DRILL_DOWN.md).
- **Term-theme finder spike:** planning only. See [OASThemes/PLAN_SPIKE_THEME_FINDER.md](OASThemes/PLAN_SPIKE_THEME_FINDER.md).
- Print follow-ups: see [Print/PLAN.md](Print/PLAN.md).

## Global filter defaults

- Built 2026-11-25/26 (Tools > Display Options, now Vue + Vuetify with a Filters tab; used by OAS Progress).
  Not yet pushed or PR'd.
  See [GlobalFilterDefaults/PLAN.md](GlobalFilterDefaults/PLAN.md).
- Later: a single-patrol default (Patrol is locked to All Patrols for now).
- When Present Awards or I Statements ship: add their own mapping file if they gain any common filters
  (Present Awards' "Presented" stays tab-specific).
- Not fixed: OAS Report, Peak Award and Milestone Report pages count only Terrain's `awarded`, so
  new-flow `approved` badges don't show there as done.

## Summit Calendar

- **Concluded events are read-only for everyone, but Terrain lets Group Leaders edit them.** Summit's
  check at `src/pages/SummitCalendar/components/SummitCalendar.tsx` (`isEditable`, two places) blocks any
  concluded event. Current Terrain (`docs/terrain.scouts.com.au/`, snapshot 2026-11-11) has
  `canEdit = isActivityConcluded ? hasRoleGroupLeader : ...`, the role being `group-leader` on the
  profile's group. Before matching it, check live whether editing Leads/Assists on a concluded event
  moves the milestone credit on Terrain's server. If it doesn't, Summit should warn instead. A
  "Leads and Assists are credited when you conclude" warning before concluding is a cheap extra.

## Code health (existing before these changes, not fixed)

- `npx tsc --noEmit` reports 3 type errors in `src/components/DataGrid.tsx` (TanStack column types).
  The webpack build doesn't check types, so it still succeeds.
- `npm run lint` reports about 40 problems in calendar and test files (mostly CRLF/Prettier).
- `tests/unit/smoke/lint_stack_loads.spec.ts` fails only because the repo is on a network share.
  See [DEVENV.local.md](DEVENV.local.md).

## Environment

- GitHub CLI (`gh`) isn't installed, so PR edits are manual. See [DEVENV.local.md](DEVENV.local.md).
