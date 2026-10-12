# Plan: Integrate the print module into Summit as `summit-print`

> **First step on approval:** this plan is copied into the repo as `.claude/Print/PLAN.md`, with one `PLAN_STAGE_N.md` per stage, following the project convention. Each stage is reviewed by the user in live Edge before the next one starts.

## Context

Summit's existing exports are unreliable, by the user's own experience, and **are not a reference for this work**:
- **OAS Summary and Heatmap "PDF Export":** snapdom turns the table into JPEG page images (`exportElementToPdf` in `src/components/gridExport.ts`).
- **OAS Table and Present Awards "PDF Export":** jsPDF-autotable rebuilds the table from data.

The external `oas-print` module (`P:\Dev\personal\terrain_summit\resources\Print module\oas-print\`) is better and more robust, from the user's testing. It prints a cleaned clone of the real on-screen table through Edge's own print engine:
- a page-setup dialog, with choices remembered per table;
- fit-to-width with zoom, or column splitting with repeated leading columns;
- a header on page 1 and footers on every page;
- per-table "profiles".

**Goal:** port it into Summit as a shared, renamed module (`summit-print`) and use it first on the OAS Progression **Summary** and **Heatmap** tabs, then on **Present Awards**. Excel export is a later, undesigned stage that the port should leave room for.

## Decisions already made (from Q&A)

| Topic | Decision |
|---|---|
| Existing PDF Export buttons | **Replace them with Print / PDF**, but keep the old export code in the repo for now. Delete it in a later cleanup once the new path is proven. |
| OAS tabs in scope | **Summary** and **Heatmap** only. Table and Worksheets keep their current exports. `printWorksheets.ts` is untouched. |
| Excel | **Decide later.** Keep the profile and header design reusable, and don't build anything for it. |
| Header contents | Page title, Group + Unit name, section symbol, and the filters in effect, plus the ideas in the example PDF: a subtitle line, a meta line (Section · Generated), "Part n of m · Stages x–y" labels, and footers with title · date / Part n of m / Page X of Y. |
| Section symbol | From `src/images/sections/`, using the positive (dark-text) versions the user supplied. See "Section logos" below. |
| Naming | Rename to **`summit-print`**: folder, component, CSS classes (`summit-print-*`), storage key. |
| Present Awards print | All rows (ignore paging), respect "group by member" with every group expanded, drop the "Present" checkbox column, include badge images. |
| Old browsers | **Build a fallback** for browsers without CSS page-margin boxes (anything before Chromium 131). |

## Issues found in the module vs. Summit (fixed during the port)

| # | Issue | Fix |
|---|---|---|
| I1 | Webpack only runs `.ts/.tsx` through babel. Plain `.js` would ship untranspiled and unlinted. | Port everything to TypeScript. The `.vue` file follows Summit's `<script lang="ts" src="./X.ts">` pattern. |
| I2 | ES5 Set-spread trap: `[...missing]` silently becomes `[]` under ts-jest. | Use `Array.from()` throughout. Specs assert counts are non-zero. |
| I3 | Summit's page code runs in Terrain's **MAIN world**, where `chrome.storage` doesn't exist, so settings would never be remembered. | Store settings in `localStorage` under the key `summit.print.settings`, with try/catch, following `*FilterPersistence.ts`. |
| I4 | The srcdoc iframe inherits **Terrain's CSP**. The repo has no evidence either way. | Check live in Edge first, in Stage 1. If styles are blocked, add `print-frame.html/.ts` to `web_accessible_resources` and build its URL from the existing `data-summit-extension-url` attribute. |
| I5 | Heatmap column count varies: the stage filter hides columns, and group-by-member changes the first column. The fixed 11-entry `columnWidths` won't match. | Allow `columnWidths` to be a function `(table) => number[]` that reads the actual header cells. |
| I6 | The Summary "Special" column is optional (6 or 7 columns). | Same fix as I5. |
| I7 | "Hide answered" squares use `visibility:hidden` from `index.css`, which doesn't reach the print document, so they would print. | Add a profile CSS rule for `.oas-heatmap-square-hidden`, or copy `visibility`. |
| I8 | Patrol title rows (`tr.oas-heatmap-patrol-title-row`) and the group-by-member layout aren't covered by the sample profile. | Add `break-after: avoid` and styling for them, and test both group modes. |
| I9 | Present Awards paginates (25 rows). Its in-tbody filter row has inputs, group headers have chevron buttons, collapsed groups aren't in the DOM, and it has `v-menu` date activators and `v-simple-checkbox` icons. | Before printing, set items-per-page to −1, expand all groups, wait `$nextTick`, print, then restore. The profile `transform` removes the filter row, the buttons and the Present column. The DOM clone keeps Vuetify's current sort. |
| I10 | The sample button is a `v-btn small outlined`, but the toolbars use `.oas-vue-pill-btn`. | Match the pill styling. |
| I11 | Unit and group names aren't passed to the content component, and there are no helpers for them. | Add `TerrainState.getUnitName()` / `getGroupName()` (from `getCurrentProfile().unit.name` / `.group.name`) and pass them as print vars. |
| I12 | The captured fixtures (`vue-table-current.txt`, `test/index.html`, `large.html`) contain real member names and UUIDs. | Scrub them before anything is committed, following the recent fixture-scrub commit. |
| I13 | The Python harness has Linux paths. | Port the tests to Jest/jsdom (pure functions) plus a Playwright TS render check. |
| I14 | Print fonts are Segoe UI, but the screen uses Nunito Sans. The print document doesn't inherit Terrain's `@font-face` rules. | **Use Nunito Sans, borrowed from Terrain** (user decision). See "Print font" below. |
| I15 | The sample PDF predates the current profile (its footer is "title · date", not "title · unit"). | Use the current profile wording, adjusted to the agreed header contents. |

## Target structure

```
src/print/
  summitPrint.ts       core: profiles, geometry, document build, print, header/footer (from oas-print.js)
  printFit.ts          fit/zoom/band layout, dependency-free (from print-fit.js)
  printStyles.ts       BASE_PRINT_CSS (renamed classes)
  printSettings.ts     localStorage persistence (replaces chrome.storage)
  printSupport.ts      margin-box support detection + fallback switch (new)
  printFonts.ts        copies Terrain's NunitoSans @font-face rules into the print doc (new)
  sectionLogo.ts       section -> logo URL, via data-summit-extension-url (pattern of getSkillIconUrl.ts)
  index.ts             registers profiles, re-exports
  profiles/peakAwardSummary.ts, skillHeatmap.ts, presentAwards.ts
src/components/SummitPrintButton.vue + SummitPrintButton.ts   (shared component, per DESIGN.md)
tests/unit/print/*.spec.ts
```

**Reused, not rewritten:**
- `getSkillIconUrl.ts` and `getBadgeIconUrl.ts`. Their icons already resolve to web-accessible `chrome-extension://…/images/*` URLs, and `images/*` is already in `web_accessible_resources`.
- `TerrainState` (`getSectionName`, `getCurrentProfile`).
- The `TerrainAchievementSection` enum values (`joey`/`cub`/`scout`/`venturer`/`rover`), used as the logo map keys.
- The `.oas-vue-pill-btn` styling.

## Header and footer design (all profiles)

- **Page 1 header:**
  - section logo on the left;
  - title, e.g. "OAS Progression - Summary for Peak Award";
  - subtitle "{group} · {unit}";
  - meta line: Filters · Generated.
  - **No "Section" line** (user, 2026-10-10): the logo and unit name already say it.
- **Filters in effect:** each profile gets a per-print `meta` built from the page's filter state, then reviewed in each stage. Only filters that change *who or what* is shown are listed; sort order is not (user, 2026-10-10):
  - Summary: members filter, patrols;
  - Heatmap: group by, patrols, skills shown, stages shown, hide flags;
  - Present Awards: "show previously presented", grouping, any active column filters.
- **Footer, every page:**
  - left: "{title} · {unit}";
  - centre: "Generated {generated}", plus "Part n of m" when the table is split;
  - right: "Page X of Y".
- **Fallback (Chromium < 131, or no margin-box support):**
  - Detect from `navigator.userAgentData` / UA Chromium major version.
  - Emit the footer text into a repeating `<tfoot>` row (`display: table-footer-group`) on each table or band.
  - "Page X of Y" isn't possible there and is dropped. Title, unit, date and Part n of m stay.
  - The dialog shows a short note.
  - This path has to be confirmed in a real older browser, or forced by a test flag, since the user's Edge is current.

## Stages

**Stage 1: Port the core, and the Summary tab**
- Port the module to TS with the renames (I1–I3), `columnWidths` as a function (I5, I6), the settings store, the TerrainState helpers (I11) and the section logo lookup.
- First live check: does Terrain's CSP block the srcdoc styles (I4)? Add the print-frame fallback only if it does.
- Replace Summary's "PDF Export" button with `SummitPrintButton`. Keep `onSummaryPdfExportClick` and `exportElementToPdf` in the code.
- Jest specs: header/footer merge, placeholders and separator tidy, `resolvePage`, `cssContent`, `sliceColumns` / `cellGrid` with rowspan and colspan, settings persistence. Use a scrubbed Summary fixture (I12, I13).

**Stage 2: Heatmap tab**
- Profile for group-by-skill and group-by-member, patrol rows, hidden squares and stage filtering (I5, I7, I8).
- Replace the "PDF Export" button.
- Test fit and split at A4 portrait, A4 landscape and A3 landscape.

**Stage 3: Old-browser footer fallback**
- Build `printSupport.ts` and the `<tfoot>` footer path, with a test flag to force it.
- Jest spec for detection, plus a Playwright render with the fallback forced.

**Stage 4: Present Awards**
- Show-all and expand-groups wrapper, profile `transform` (I9), badge images, filter meta.
- Replace its "PDF Export" button. Its Excel Export stays as it is.

**Stage 5 (later, not scheduled): Excel**
- Revisit once print is proven. It would reuse the profile registry and the resolved header text.

**Stage 6 (later, not scheduled): Cleanup**
- Once the user is satisfied, delete `exportElementToPdf`, snapdom, the unused PDF handlers and any now-unused dependencies.
- Add a "Printing" section to `DESIGN.md`.

## To-do / follow-ups (not tied to a stage)

> Stage 5 (2026-10-12) adds the badge in the Award column, the cleanup (snapdom removed, DESIGN.md "Printing" section), the OAS Table tab print and the Worksheets font. See [PLAN_STAGE_5.md](PLAN_STAGE_5.md). The pill-button item below is in progress there (§E).

- [ ] **Merge the four copies of the rounded "pill" button style (`.oas-vue-pill-btn`).** It is declared separately, as scoped CSS, in `OasProgressionVueContent.vue`, `PresentAwardsVueContent.vue`, `IStatementsContent.vue` and `SummitPrintButton.vue`. That is the drift `DESIGN.md` warns about. It probably also explains why `IStatementFilters.vue`'s Reset button doesn't get the style: the rule lives in its parent's scoped block. Per DESIGN.md "A shared component beats a shared class", the likely fix is a shared `SummitPillButton` component, or one declaration in `index.css`. Check it against the cascade-order warning in DESIGN.md before choosing. Raised by the user on 2026-10-10.
- [x] Multi-page footers ("Page X of Y" on every page) are confirmed live on the Heatmap (Stage 2, 2026-10-11).

## Verification (every stage)

- `npm test`, `npm run lint` and `npm run build`. The known UNC smoke-test failure is expected.
- Load `dist/` unpacked in Edge and **hard-refresh directly onto the page** (DESIGN.md cascade warning).
- Run the guide's §9.2 checklist for that table:
  - every row is present;
  - colours print with "Background graphics" unticked;
  - the header appears on page 1 only;
  - footers and "Page X of Y" appear on every page;
  - the header row repeats, and no row is split;
  - fit and split both work;
  - icons and logos print;
  - Save as PDF gives selectable text;
  - settings are remembered after a reload.
- The user confirms in live Edge before the stage is marked done (memory: verify, don't guess).

## Print font: Nunito Sans, borrowed from Terrain
- New `printFonts.ts`, run at print time:
  - Walk `document.styleSheets` on the live Terrain page. Its `_nuxt` CSS is same-origin, so it's readable. Wrap every read in try/catch, because cross-origin sheets throw.
  - Collect the `CSSFontFaceRule`s whose family starts with `NunitoSans`.
  - Rewrite each relative `url()` to an absolute URL, resolved against that sheet's `href`.
  - Inject the rules at the top of the print document's `<style>`.
- **Verify the family names live before coding:** read them from Terrain's DevTools or `document.fonts`, and don't assume them. The screen uses `NunitoSans-regular`. Terrain appears to declare weights as **separate families** (Light/Regular/SemiBold files), so the print CSS must map bold text (`th`, member names, h1) to Terrain's semibold family rather than `font-weight: 600`, which would fake-bold the regular face.
- Replace `"Segoe UI", system-ui` in `BASE_PRINT_CSS` and the footer `@bottom-*` rules with `NunitoSans-regular, arial, sans-serif`. The footer margin boxes need the font too, so check that they render in it.
- The module already awaits `doc.fonts.ready` before measuring, which matters because fit/zoom measurements depend on the real font metrics.
- **Fallback:** if no NunitoSans rules are found, the stack falls back to Arial and logs a console warning, and printing still works.
- Jest spec: the url-rewrite and family-filter logic, using fake CSS rules.
- Out of scope but noted: `printWorksheets.ts` names `NunitoSans-regular` in its own print window without supplying it either, so it probably prints in Arial. The same helper could fix it later.

## Section logos (provided 2026-10-10)
- The positive versions are in `src/images/sections/`, and the reversed versions have been removed:
  - `Section_Joey_Vert_FullCol.jpg`
  - `Section_Cub_Vert_FullCol.png`
  - `Section_Scout_Vert_FullCol.jpg`
  - `Section_Venturer_Vert_FullCol.jpg`
  - `Section_Rover_Vert_FullCol.jpg`
- **Formats are mixed (.jpg/.png).** `sectionLogo.ts` maps each enum value (`joey`, `cub`, `scout`, `venturer`, `rover`) to its exact filename. Nothing is derived from the name pattern.
- They're served from `images/sections/…` by the existing webpack copy of `src/images` and `images/*` in `web_accessible_resources`. No manifest change is needed.
- An unknown or missing section shows no logo and never a broken image.
- **Resized 2026-10-10 (user request):** each logo now fits within 1181 × 1181 px, which is 10 cm × 10 cm at 300 dpi. They were JPEG q85, metadata stripped, 1.8 MB total and now ~360 KB. The originals are backed up outside the repo, in the session scratchpad.
