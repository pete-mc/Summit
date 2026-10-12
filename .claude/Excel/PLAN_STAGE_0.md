# Stage 0: Library spike (write-excel-file)

Parent plan: [PLAN.md](PLAN.md). Started 2026-10-12.

## Status: approved by the user 2026-10-12 (looks right in all three apps; titles stay frozen; box width fine). Spike test deleted.

## What was done
- `write-excel-file` ^4.1.1 added to `package.json`. Its one dependency is `fflate`, the zip compressor.
- **Temporary** `tests/unit/excel/stage0-spike.spec.ts`. When `SPIKE_OUT` is set, it writes a Summary-shaped sample workbook:
  - Venturer layout: 5 + 5 + 5 core boxes, 12 progressions, 4 special;
  - six fake members;
  - logo, title block, two-row merged header, frozen panes, the `%` column.

  It's skipped in normal test runs, and is deleted when Stage 0 is decided.

## Results (risks from PLAN.md)
1. **Logo image: works.** The browser build accepts an `ArrayBuffer` and the image is embedded (`xl/media`, drawing anchored at A1).
   - Under Jest, the bytes must be copied into a test-realm `ArrayBuffer`: Node's Buffer memory fails the library's `instanceof ArrayBuffer` check. This is a jsdom quirk; a browser `fetch()` result is fine.
   - **Not yet proven live:** fetching the logo from `chrome-extension://…/images/sections/…` inside Terrain's page. That's checked in Stage 1.
2. **Size: small.** The library's own minified browser bundle, including fflate, is **71 KB**. For comparison, `xlsx` is 251 KB (mini) to 882 KB (full).
3. **Apps: waiting on the user** (Excel desktop, Excel online, Google Sheets).
4. **Build: works.**
   - A temporary import in `OasProgressionVueContent.ts` compiled through webpack (only the existing react-datepicker warning) and landed in `dist/scripts/summit.js`.
   - The import was then removed and `dist/` rebuilt clean.
   - TypeScript types resolve with the repo's `moduleResolution: node`, and Jest runs the library (via its `require` build).

## Confirmed inside the generated file
- Merges: `A5:A6`, `B5:B6`, `C5:C6` (Member / Progress / %), `D5:R5` (Core Skills), `D6:H6`, `I6:M6`, `N6:R6` (skills), `S5:AE6` (Progressions), `AF5:AJ5` / `AF6:AJ6` (Special).
- Frozen at `B7`: rows 1–6 (title block + header) and column A.

## Questions for the user's review of the sample
- Do the colours, merged headers, box cells and logo look right in all three apps?
- **Freeze includes the 4 title rows** (rows 1–6 stay on screen). Alternative: freeze only from the table header. That's only possible if the title block moves, because Excel freezes from the top.
- Box width (about 2.6 characters) and the gap between boxes (thin white borders) are first guesses.
