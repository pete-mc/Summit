<!-- @format -->

This is a project to expand the capability of Summit, an extension used with the Scouts Australia Terrain site. It's a TS browser extension; new UI work is built with Vue 2.7 + Vuetify 2 (matching Terrain's own stack), with a shrinking set of still-active React 18.2 pages not yet rebuilt. See `.claude/DESIGN.md` for which pages are which and why.

The user should be prompted to describe what they want, in a chat or through a specification md file.
Coding agent firms up requirements via collaborative dialog, writes PLAN.md or multiple PLAN_STAGE_X.md files for each stage or component. Plans are grouped per feature in a subfolder under `.claude/` (e.g. `.claude/OASProgression/`, `.claude/I_Statement/`).
Coding agent then writes code against plan.
You can update these instructions based on the specific project.

You educate the user along the way so they can learn a bit about what's going on but you understand that they are not highly skilled or highly experienced with creating this type of code. You handle all of that on their behalf, or adapt based on the user's skill.

## DEVELOPMENT ENVIRONMENT

See .claude/DEVENV.md for development environment details.

## GIT REMOTES

| Remote     | Repo                         | Visibility | Purpose                                                                 |
| ---------- | ---------------------------- | ---------- | ----------------------------------------------------------------------- |
| `origin`   | Bitbucket `dssayer/terrain-summit` | Private    | User's own working repo — day-to-day `main` is pushed here.             |
| `github`   | GitHub `Antipodn/Summit`     | Public     | User's public fork — push branches here to open PRs to `upstream`.      |
| `upstream` | GitHub `pete-mc/Summit`      | Public     | Original Summit; all production releases originate here. Fetch only, never push. |

Typical flow: fetch new releases (tags like `3.2.4`) from `upstream` and merge into `main` → push to `origin`. To contribute a change back, push a branch to `github` and open a PR from `Antipodn/Summit` to `pete-mc/Summit`. Confirm with the user before pushing to `github` or opening a PR (both are public).

### `.claude/` is Bitbucket-only — NEVER on GitHub

The upstream maintainer keeps all LLM tooling out of the repo to avoid collisions between contributors' tools. So:

- `.claude/` (this file, plans, design notes) lives on `main` and is pushed to `origin` (Bitbucket) only.
- No branch pushed to `github` may contain `.claude/`. The PR branch is `summit-dev` (PR #164 → `pete-mc/Summit` `main`).
- Code in `src/`/`tests/` must not reference `.claude/` files (plans, DESIGN.md, NAME_RESOLUTION.md, …). Upstream won't have them.
- The PR branch also keeps upstream's `.gitignore` lines and `.jest-components-results.json` as upstream has them. Our `.claude` ignore lines and our deletion of that Jest file stay on `main` only, so the PR stays focused on features.

Updating the PR branch (do it in a separate worktree, never by checking `summit-dev` out over this one):

1. `git merge main` into `summit-dev`.
2. `git rm -r -q --cached .claude` (new `.claude/` files on `main` would otherwise ride in silently; modify/delete conflicts on `.claude/` files resolve the same way).
3. `git checkout upstream/main -- .jest-components-results.json`, and remove the `.claude/*` and `.jest-components-results.json` lines from `.gitignore`.
4. Commit, then verify before pushing: `git ls-tree -r --name-only HEAD | grep '^\.claude/'` must print nothing.
5. Confirm with the user, then `git push github summit-dev`.

**Never merge `summit-dev` back into `main`**: its `.claude/` deletion would delete the folder from `main`.

## COMMENTS

Upstream maintainer prefers a near-zero-comment codebase. Rules:

- Make code self-explanatory through naming and small extracted functions first.
- Keep only gotchas/learnings (non-obvious "why", Terrain/browser quirks, cross-file sync rules), as a short header above the function or constant, prefixed `Gotcha:` or `Learning:` where it helps.
- No history ("requested live", "previously…", "Stage N"), no restating code, no section banners, no commented-out code. History goes in commit messages / PR descriptions.
- Tests: keep a one-line "why this test exists" note when it records a past bug.

The original long-form comments (design reasoning, history, rejected approaches) were removed on 2026-10-20. They are preserved at git tag `pre-comment-cleanup` (commit `d05617b`, Summit 3.2.4 + our work). To read them: `git show pre-comment-cleanup:<path>` or `git log -p pre-comment-cleanup -- <path>`.

## SPECIFICATIONS

See .claude/INITIAL_SPECS.md for detailed specifications. It may not exist yet.

## AGENTS

See .claude/AGENTS.md for agent policy.

## DESIGN / STYLING

See .claude/DESIGN.md before adding or changing any UI — covers Summit's existing
design tokens/CSS conventions and what Terrain (the host site) is built with.

## MEMBER NAME HANDLING

See .claude/NAME_RESOLUTION.md before writing any code that sorts, formats, or displays a
Terrain member's name, on any page — Terrain's real API gives separate first_name/last_name
fields; never concatenate them and re-split the combined string later.

## PROJECT SETUP

Before anything else, check whether the development environment is setup and operational before any new code is written. The user has never used this type of stack or created an Edge extension before.
Items to consider:

- [x] Pull all the reference repo's into the correct folders, for reference. They should not be under source control.
      Topo-Blazor cloned to `p:\Dev\personal\terrain_summit\reference\Topo-Blazor` (outside `code/`, not tracked).
- [x] Create a working copy of the original Summit repo, which will be considered the local version for modification.
      `pete-mc/Summit` cloned directly into `code/` — it IS the working git repo for this project Remotes: see GIT REMOTES below and `.claude/DEVENV.local.md`.
- [x] Make sure all dependancies are available, or guide the user through their installation.
      Node v24.15.0 / npm 11.12.1 already installed, matches Summit's `engines.node: 24.x`. `npm ci` completed (1232 packages; 27 pre-existing upstream vulnerabilities reported by npm audit — not addressed, flagged for awareness only).
- [x] Make sure all needs set out in Summit Repo are met.
      `npm run build` succeeds (outputs to `dist/`). `npm run lint` runs and reports 40 pre-existing upstream lint errors (mostly CRLF/Prettier line-ending mismatches from checking out on Windows, plus some `no-explicit-any`/`camelcase` issues in existing test files) — tooling works, code isn't clean, not something setup should "fix". `npm test` runs: 178/179 tests pass; the 1 failure (`tests/unit/smoke/lint_stack_loads.spec.ts`) is a Node/ESLint UNC-path bug triggered by `code/` living on the `\\sun\...` network share, not a real regression — see `.claude/DEVENV.local.md` for detail.
- [x] Run a test of the local Summit version from my browser.
      Loaded `code/dist/` as an unpacked extension in Edge (`edge://extensions` → Developer mode → Load unpacked). Confirmed working.

[x] Project setup complete

## TOOLCHAIN

- **Runtime**: Node.js 24.x, npm (project pins `engines.node: 24.x`)
- **Language**: TypeScript 5.9
- **UI**: Vue 2.7 + Vuetify 2 is the default for new/reworked pages (Vuex/vue-router also present); React 18.2 remains live for pages not yet rebuilt — see `.claude/DESIGN.md`
- **Bundler**: Webpack 5 (`npm run build` / `build-prod` / `build-watch` / `start`)
- **Testing**: Jest 29 (unit, `npm test`), Playwright 1.59 (browser, `npm run test:browser`)
- **Linting/formatting**: ESLint 9 (flat config) + Prettier, via `npm run lint`
- **Extension target**: Manifest V3, content script injected into `https://terrain.scouts.com.au/*` (see `manifest.json`)
- **Load for testing**: build to `dist/`, then load unpacked in Chrome/Edge dev mode
- **Known environment quirk**: this repo lives on a mapped network drive (`P:` → `\\sun\...`); required a `git config --global --add safe.directory` exception, and causes one Jest smoke test to fail spuriously (UNC path handling) — see `.claude/DEVENV.local.md`.
