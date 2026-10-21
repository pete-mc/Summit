# OAS Progression > Summary tab: print and Excel for both tables

Follows `PLAN_OVERALL_PROGRESS.md`, which added the Overall table but left print and Excel as Peak Award only.
Agreed in chat 2026-10-21.

## Decisions (agreed)

| Topic | Decision |
| --- | --- |
| Scope | One Print button and one Excel button output **both** tables. |
| Include | **Always both**, in print and Excel (user decision 2026-10-22, after trying tick boxes: Edge's Pages box picks pages; Excel tabs can be deleted). |
| Print order | Towards Peak Award first, then Overall. **Page break between them.** |
| Print page setup | **One** page setup for the whole printout, fit/split included (see spike result below; user simplified it 2026-10-22, since the Peak Award part fits one page either way). Default orientation: landscape when Overall is included, portrait when only Peak Award is. Remembered under one settings key for the Summary printout. |
| Titles | "OAS Progression - Summary - Towards Peak Award" and "OAS Progression - Summary - Overall". Used as the printed heading of each part and the title row of each sheet. |
| Print header | Each part gets the full header (logo, title, `{group} · {unit}`, filters line), so each stands alone. Same filters line on both. Footer title follows its part. |
| Excel file | One file, two sheets. File name unchanged: `Summit - OAS Progression - Summary - {Unit} - {yyyymmdd}.xlsx`. |
| Sheet tabs | "Towards Peak Award" and "Overall" (Excel caps tab names at 31 chars). |
| Excel cells | Stage values as **text** exactly as on screen (`3.04`, `3.10`, `-`), centred. Numbers would turn 3.10 into 3.1. |
| Order | Both outputs follow the screen, including the Overall table's column sort. |
| Overall headers | Rotated 90° (two lines: skill / stream) in print and in Excel (`textRotation: 90`). |

## Stage 1: Excel (small, independent)

- `src/excel/summitExcel.ts`: add `exportExcelWorkbook({ sheets: [{ printProfile, build }], meta, fileNameParts })`.
  One timestamp and one logo load for the whole file. Each sheet resolves its own header from its own print
  profile. `exportExcelSheet` becomes a one-sheet wrapper, so other pages are untouched. Uses write-excel-file's
  multi-sheet form (`writeXlsxFile([{ data, sheet, ...options }])`).
- `ExcelSheet` gains a `name` (tab). The Peak Award sheet's tab changes from "Summary" to "Towards Peak Award".
- New `src/excel/sheets/overallProgress.ts`: header block, one rotated header row (skill + line break + stream),
  member rows of text cells, the Member column and header frozen, narrow equal stage columns. Built from the
  same `overallProgressColumns` / `overallProgressRows` the screen uses, so it can't drift.
- Excel button → small `v-menu` with the two tick boxes and an "Export" button.
- Tests: the sheet builder (header text and rotation, cell text, column count, row order) and the workbook
  wrapper (two sheets, tab names, one file name).

## Stage 2: print module, several tables in one printout

**Spike result (2026-10-21, live in Edge): mixed orientation is NOT possible.** Named pages work (each part had its
own footer, page numbers ran through, bands split), but Edge prints every page at the first page's size, both via
the hidden srcdoc frame and directly. User chose one printout with a shared page setup.

Original spike plan (kept for the record): a hand-built two-part document where part 1 is A4 portrait and part 2 is
A4 landscape, using named pages (`page: summit-part-2` + `@page summit-part-2 { size: … }`). Check that the preview and
Save as PDF really mix orientations, and that the footers still print. **If not:** stop and come back to the user. The
fallback is one shared orientation.

Then, in `src/print/`:

- New `printTables({ parts: [{ source, profile, settings, header/meta }], … })`. `printTable` becomes a one-part
  wrapper, so other pages are unchanged and their tests still pass as they are.
- `buildMultiPartDocument` builds one `<section class="summit-print-part summit-print-layout-{fit|split}">` per part,
  each with its own header, its table and a named page (`summit-part-N`). The shared `@page` sets size and margins,
  and `@page summit-part-N` sets that part's footer. Each part starts on a new page. `buildPrintDocument` (one table)
  produces exactly the same output as before.
- `printFit.layoutTable` takes a part root and that part's printable width instead of `doc.body` / the first
  table. Split bands get part-scoped page names (`summit-part-N-band-M`), inheriting the part's page rule.
- Profile CSS from every part's profile goes into the one document (already scoped by profile name).
- One printable width for every part (shared page setup). Each part is laid out (fit/split) on its own.
- Tests (jsdom): two parts produce two headers, two page rules and the part order. Single-part output
  is unchanged from today (compare against `printTable`).

## Stage 3: dialog and Summary tab wiring

- New print profile `overall-progress` (`src/print/profiles/overallProgress.ts`): landscape default, rotated header
  text kept, fixed equal stage columns, Member column repeats when split, strip the sort arrows and the click styling.
- Rename the Peak Award profile title to "OAS Progression - Summary - Towards Peak Award".
- `SummitPrintButton` takes an optional `parts` prop (`[{ profile, label, target, prepare? }]`). With parts, the dialog
  shows a tick box per part, each with its own collapsible page-setup group. With `profile`/`target` as today, it
  looks and works exactly as it does now.
- `OasProgressionVueContent`: the Summary tab passes both parts. The include choices are remembered (localStorage,
  `summit.oasProgressionVue.summaryInclude`).
- DESIGN.md: document multi-part printing and the workbook export in the summit-print / summit-excel sections.

## Verification (each stage)

`npm test`, `npm run lint`, `npm run build`, then live in Edge:
- Excel opens with two tabs, the right titles, rotated headers, and `3.10` not `3.1`.
- The print preview shows Peak Award (portrait) → page break → Overall (landscape), each with its header and
  correct footers, and Save as PDF keeps the orientations. A single tick prints just that table. The Heatmap,
  Table and Present Awards printouts are unchanged.

## Risks

- Mixed orientation: rejected by the spike, so the page setup is shared.
- Old-browser footer fallback (`footerMode: "table"`): has to put each part's footer on its own table. This is covered by a test.
