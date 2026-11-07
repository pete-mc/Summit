# Outstanding work

One list of open items across features. Details live in each feature's plan; keep this list short and
remove items once they're done.

Last updated 2026-11-07.

## PR #164 (`summit-dev` → `pete-mc/Summit`)

- Waiting on maintainer review. The description was edited by hand on 2026-11-04 to match the
  slimmed-down PR.
- If the maintainers ask for smaller PRs, the description offers a split (OAS Progress, shared print/Excel).

## Held back from the PR (live on `main` only)

- **Present Awards (Vue):** not ready to ship. See [PresentAwardsVue/PLAN.md](PresentAwardsVue/PLAN.md).
- **I Statements:** not ready, future undecided. See [I_Statement/PLAN.md](I_Statement/PLAN.md).
- How they're kept out of the PR, and how to let one back in: "Unfinished pages are `main`-only too"
  in [CLAUDE.md](CLAUDE.md).

## OAS Progress

- **Table tab banner:** check it live in Edge (reload the unpacked extension, OAS Progress › Table).
  See [OASTable/PLAN.md](OASTable/PLAN.md).
- **Table tab future:** stays as a debug tool for now; promote it or remove it later.
- **Heatmap ↔ Worksheets linking**, for easier drill-down (listed under "Still to do" in the PR).
- **Term-theme finder spike:** planning only. See [OASThemes/PLAN_SPIKE_THEME_FINDER.md](OASThemes/PLAN_SPIKE_THEME_FINDER.md).
- Print follow-ups: see [Print/PLAN.md](Print/PLAN.md).

## Code health (existing before these changes, not fixed)

- `npx tsc --noEmit` reports 3 type errors in `src/components/DataGrid.tsx` (TanStack column types).
  The webpack build doesn't check types, so it still succeeds.
- `npm run lint` reports about 40 problems in calendar and test files (mostly CRLF/Prettier).
- `tests/unit/smoke/lint_stack_loads.spec.ts` fails only because the repo is on a network share.
  See [DEVENV.local.md](DEVENV.local.md).

## Environment

- GitHub CLI (`gh`) isn't installed, so PR edits are manual. See [DEVENV.local.md](DEVENV.local.md).
