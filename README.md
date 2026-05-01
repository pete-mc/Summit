# Summit

## Another Important Project Annoucement

I have put my hand up to take over the Summit project. I have been in contact with Peter and we are working through the steps to get everything handed over with the least distruption possible. Please feel free to raise issues for things you see that aren't working. Hopefully the should be an updated version released very soon.
--Riggs

~~## Important Project Annoucement~~

~~Sorry everyone, I have moved to Scotland and as such dont have proper access anymore to Terrain to further develop summit. I am happy to hand over access to the code if someone is interested in taking over the project. Please reach out if this if of interest.~~

## Summary

This tool is to help provide usability features to the Scouts | Terrain website. Feel free to let us know about any issues or request new features in the issues tab.

To get started install the add on for your browser below:

[![Chome Logo](https://github.com/pete-mc/Summit/wiki/images/chrome.png)](https://chromewebstore.google.com/detail/terrain-summit/fkpdafjknodpembpmogbcblabonpmhoo?hl=en&pli=1) [![Edge Logo](https://github.com/pete-mc/Summit/wiki/images/edge.png)](https://microsoftedge.microsoft.com/addons/detail/terrain-summit/eoemenakogcfmmhkoiejhefmdijgpgnb)

[![Build and Release Chrome Extension](https://github.com/pete-mc/Summit/actions/workflows/build.yaml/badge.svg?branch=main)](https://github.com/pete-mc/Summit/actions/workflows/build.yaml)

## Pull request quality gate

- Unit tests run on pull requests targeting `main` via `.github/workflows/build.yaml`.
- Configure branch protection (or a ruleset) on `main` to require the `Build / test` status check before merge.

## Unit testing conventions

- Centralized test folders:
  - `tests/unit/helpers`
  - `tests/unit/models`
  - `tests/unit/services`
  - `tests/unit/smoke`
- Naming convention:
  - Use `*.spec.ts` for unit tests.
  - Name files to mirror source behavior (for example: `CompressGuids.spec.ts`, `fetchActivity.spec.ts`).
- Mock strategy:
  - Keep mocks local to the test where possible for readability.
  - Reuse shared service mocks via `tests/unit/services/mocks/*` when multiple tests require the same setup.
  - Mock external/runtime boundaries (network, Terrain host/runtime globals), not pure helper/model logic.

## Test and coverage behavior in CI

- Pull requests must pass tests (`npm test`) before merge.
- Coverage (`npm run test:coverage`) is informational only and is used for visibility/tracking.
- No hard coverage threshold is enforced in Jest/CI, so coverage does not block merges by itself.

## Browser layout tests

`npm run test:browser` runs Playwright browser-level layout tests. Fresh environments may need to install Chromium first with `npx playwright install chromium`.

## Local build

You can build Summit locally with the bundled npm scripts.

### Prerequisite: Node.js 24

This project targets Node.js `24.x`.

- If you use `nvm`, run `nvm use` in the repository root (the version is pinned via `.nvmrc`).
- If you use another version manager, use `.node-version` (`24`) as the local runtime target.

1. Install dependencies with `npm ci`.
2. Run `npm run build` for a development build.
3. Run `npm run build-prod` for a production build.
4. Run the `Package Summit extension artifact` VS Code task to produce a zip archive for distribution.

The output is written to `dist/`.

Packaged artifacts are written to `artifacts/Summit.zip`.

### Local development server

Run `npm start` to launch the local webpack dev server.

- It serves over HTTPS using the certificates in `certs/`.
- It binds to `https://localhost:443`.
- On Windows, port `443` may require elevated privileges or may already be in use.

### VS Code tasks

This repository includes VS Code tasks for dependency install, development build, production build, packaging the extension artifact, watch mode, and starting the local dev server.

## Examples

A few of the features are showcased below. [Visit the Wiki to see the full list of features and how-to guides](https://github.com/pete-mc/Summit/wiki).

## Peak Award Progress Report

User friendly single page report to see where each of the youth members are traveling on the peak award journey.
![Peak Award](https://github.com/pete-mc/Summit/wiki/images/peak-award.png)

## OAS Report

This report will give you a nice summary of the OAS levels each youth member is at and the related streams. This is a nice one pager to help you see where all the members of your unit are up to.
![OAS Report](https://github.com/pete-mc/Summit/wiki/images/oas-report.png)

## Bulk Calendar Entry Form

This is to help you submit a full term or more of activities to your plan. It simplifies the process by only asking the basic questions and you can enter many on a single page.
![Bulk Calendar Tool](https://github.com/pete-mc/Summit/wiki/images/bulk-events.png)

## Export events to your own calendar

Sick of adding events in Terrain and also your own calendar. Use the shiny new button contained in a planned activity and you will recieve a ical file ready to be imported into whichever calendar application you use.
![Export Events](https://github.com/pete-mc/Summit/wiki/images/save-calendar.png)
