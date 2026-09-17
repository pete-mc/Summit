<!-- @format -->

This is a project to expand the capability of Summit, an extension used with the Scoust Terrain site. It uses a failry standard TS/React extension stack.

The user should be prompted to describe what they want, in a chat or through a specification md file.
Coding agent firms up requirements via collaborative dialog, writes PLAN.md or multiple PLAN_STAGE_X.md files for each stage or component.
Coding agent then writes code against plan.
You can update these instructions based on the specific project.

You educate the user along the way so they can learn a bit about what's going on but you understand that they are not highly skilled or highly experienced with creating this type of code. You handle all of that on their behalf, or adapt based on the user's skill.

## DEVELOPMENT ENVIRONMENT

See .claude/DEVENV.md for development environment details.

## SPECIFICATIONS

See .claude/INITIAL_SPECS.md for detailed specifications. It may not exist yet.

## AGENTS

See .claude/AGENTS.md for agent policy.

## PROJECT SETUP

Before anything else, check whether the development environment is setup and operational before any new code is written. The user has never used this type of stack or created an Edge extension before.
Items to consider:

- [x] Pull all the reference repo's into the correct folders, for reference. They should not be under source control.
      Topo-Blazor cloned to `p:\Dev\personal\terrain_summit\reference\Topo-Blazor` (outside `code/`, not tracked).
- [x] Create a working copy of the original Summit repo, which will be considered the local version for modification.
      `pete-mc/Summit` cloned directly into `code/` — it IS the working git repo for this project (remote `origin` still points at upstream; no fork/push yet, see `.claude/DEVENV.local.md`).
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
- **UI**: React 18.2 (+ some legacy Vue 2.7 components/router/Vuex still present)
- **Bundler**: Webpack 5 (`npm run build` / `build-prod` / `build-watch` / `start`)
- **Testing**: Jest 29 (unit, `npm test`), Playwright 1.59 (browser, `npm run test:browser`)
- **Linting/formatting**: ESLint 9 (flat config) + Prettier, via `npm run lint`
- **Extension target**: Manifest V3, content script injected into `https://terrain.scouts.com.au/*` (see `manifest.json`)
- **Load for testing**: build to `dist/`, then load unpacked in Chrome/Edge dev mode
- **Known environment quirk**: this repo lives on a mapped network drive (`P:` → `\\sun\...`); required a `git config --global --add safe.directory` exception, and causes one Jest smoke test to fail spuriously (UNC path handling) — see `.claude/DEVENV.local.md`.
