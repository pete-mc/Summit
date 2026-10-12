# Stage 5: Badge in the Award column, cleanup, Table tab, Worksheets font, pill buttons

Parent plan: [PLAN.md](PLAN.md). Builds on Stage 4 (`7ddd7a8`). Requested by the user on 2026-10-12.

## A. Badge inside the Award column (Present Awards), done
- There's no separate Badge column any more. Each Award cell shows the badge, then the name, about 8 px apart (`#item.achievementName` slot).
- Every badge sits centred in a fixed 41 px slot (the width of the widest artwork), so names line up. Awards without artwork keep the dashed placeholder circle (user's choice).
- The image is decorative (`alt=""`, no tooltip), because the name is beside it. Sorting and filtering still use the name.
- Print uses the same structure (a 10.3 mm slot, 2.1 mm gap).

## Status (2026-10-12): A–D built, awaiting live check; E waiting on Terrain's CSS

- `npm test`: 992/993 passing (the 1 failure is the known UNC smoke test). Lint is clean on the changed files, and the build succeeds.
- **Also removed:** `grid-export-pagination-tiers.spec.ts`, which asserted the snapdom export's page-break tiers. The equivalent print behaviour (section and patrol rows kept with the next row) is covered in `heatmapPrint.spec.ts`.
- **Kept, deliberately:** the duplicated table border on the Heatmap and Summary tables, which the snapdom export originally needed. Removing it is a visual change to judge live, so their comments now say why it's there.
- **Mistake caught and reverted:** a broad `eslint --fix` reformatted four unrelated calendar/home specs. They were restored with `git checkout`.

## B. Cleanup (item 1)
- Remove the unwired old export handlers: OAS `onPdfExportClick` / `onSummaryPdfExportClick` and Present Awards `onPdfExportClick`.
- Remove `exportElementToPdf` (the snapdom rasteriser) from `gridExport.ts`, along with its test, the Jest stub/mapping and the `@zumer/snapdom` dependency.
- **jsPDF stays:** the React pages still export through `DataGrid.tsx` → `exportGridToPdf`. The React pages are out of scope (DESIGN.md).
- Fix comments that still justify code by the old snapdom export.
- Add a "Printing" section to DESIGN.md.

## C. OAS Table tab (item 2), kept simple
The user may revamp this tab, so:
- An `oas-table` profile: title "OAS Progression - Table", A4 landscape, fit. Its transform removes the in-table filter row.
- `prepareForPrint` shows every row and restores paging, the same pattern as Present Awards minus the groups. The `items-per-page` literal becomes `.sync`-bound.
- Filter line: the column filters that are set, using the table's own column names.
- "PDF Export" is replaced by Print / PDF, and the old jsPDF handler is removed. Excel Export is unchanged.

## D. Worksheets font (item 4)
- `printWorksheets` puts the same borrowed Nunito Sans faces into its print window, so `font-weight: 600` uses the real semibold face.
- It waits for the fonts (capped) before `print()`. Previously it printed on `load`/500 ms, whatever the fonts were doing.
- `waitForPrintFonts` moves into `printFonts.ts` so both print paths share it.

## E. Pill buttons (item 3): built 2026-10-12, awaiting live check

- **Result:** the user pasted Terrain's live rules. Both `.minor[data-v-ac713568]` and `.major[data-v-ac713568]` are **scoped** to Terrain's own Button component, so the classes can't be reused, and the values are copied instead.
- **New `src/components/SummitPillButton.vue` (+ .ts):** it wraps `v-btn` and passes all attributes and listeners through.
  - `.medium` shape: 14px/600, 35px, min-width 80px, `0 18px`, radius 25px.
  - `variant="minor"`, the default: outlined in `--color-base-blue` on white.
  - `variant="major"`: filled `--color-scouts-medium-blue`, white text.
  - Colours go through v-btn's `color` prop (Vuetify accepts `var(--…)`), so Present Awards' green Save (`!important`) still overrides `major`.
- **Replaces the four scoped `.oas-vue-pill-btn` copies:** OasProgressionVueContent, PresentAwardsVueContent, IStatementsContent and SummitPrintButton.
  - **Behaviour change:** the I Statements **Reset** button now actually gets the pill look. Its rule lived in the parent's scoped CSS and never reached it.
- Guarded by `tests/unit/components/summit-pill-button.spec.ts`. DESIGN.md is updated.

### Original note
- The user suggested Terrain's own `medium minor` (outlined) / `medium major` (filled) button classes.
- Those rules aren't in the captured Terrain assets (`docs/terrain.scouts.com.au/` has no `.major`/`.minor` selectors), and the live button carries Terrain's scoped attribute (`data-v-ac713568`).
- **Needs the live selectors** before choosing an approach:
  - plain `.medium.major` → use the classes directly;
  - `[data-v-…]`-scoped → they can't apply to Summit's buttons, so copy the values into one shared component.
- The user is fetching the CSS from DevTools.
