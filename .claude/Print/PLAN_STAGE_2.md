# Stage 2: Heatmap tab

Parent plan: [PLAN.md](PLAN.md). Builds on Stage 1 (`c815fb7`).

## Scope

1. A `skill-heatmap` profile (`src/print/profiles/skillHeatmap.ts`), ported from the example's `skill-heatmap.js`. It extends the example for things the example didn't cover:
   - **Variable columns (I5):** widths are worked out from the printed table (Member/Skill, Stage, then however many stage columns the Stages filter and "Empty top stages" leave).
   - **Group by member (I8):** the title row is the member, the patrol sits beside the name in lighter text, and each row's first cell holds the skill icon and name.
   - **Patrol rows (I8):** "Break by patrol" rows are styled as a lighter band and kept with the next row.
   - **"Answered" hidden (I7):** `.oas-heatmap-square-hidden` stays invisible in print.
   - **Not-started bars:** their border is copied as well as their fill.
2. Header:
   - Title "OAS Progression - Heatmap", following the user's Summary title pattern.
   - No Section line, no sort order (user, 2026-10-10).
3. The filters line (`buildHeatmapPrintMeta`) shows only what changes *who or what* is shown, and only when it isn't the default "everything":
   - Member: contains "…", when set.
   - Patrol: All / names / None, when there's a patrol choice.
   - Skills: the skill names, when not all are shown.
   - Stages: "1, 2, 5", when not all are shown.
   - Hidden: which Show items are off, e.g. "Awarded I-Statements, Skills not started".
   - Group by and Break by patrol are left out. They're layout choices, and the printout shows them, the same reasoning as Sort by.
4. Replace the Heatmap's "PDF Export" with `SummitPrintButton`. `onPdfExportClick` stays in the code, unwired.
5. Defaults: A4 landscape, fit. With `minZoom` 0.7, anything narrower than that splits, repeating the Member and Stage columns.

## Status (2026-10-11): live-checked by user, all 7 checks pass

Multi-page footers are confirmed too (the Stage 1 follow-up).

### Build notes (2026-10-10)

- `npm test`: 974/975 passing (the 1 failure is the known UNC smoke test). Lint is clean, and the build succeeds.
- The square-colour property list is now shared by the Summary and Heatmap profiles (`profiles/heatmapShared.ts`) rather than copied.
- The button-order contract test gained a guard: a missing button's index of -1 had made its "less than" checks pass vacuously.
- **Not testable in Jest:** fit/zoom and splitting need a real layout engine (jsdom measures everything as 0 wide). Live checks 1 and 3 below are the real test.

## Live checks for the user

1. **Fit:** print A4 landscape with Fit to page width. Do all rows appear, and are the squares legible?
2. **Footers across pages:** does "Page X of Y" appear on every page (the Stage 1 follow-up)?
3. **Split:** print with "Keep full size, split across pages".
   - Member and Stage should repeat on every part.
   - Each part should be labelled "Part n of m · Stages x – y", with "Part n of m" in the footer.
4. **Group by member:** title rows show the member and patrol, rows show the skill icon and name.
5. **Break by patrol:** patrol rows appear and are never stranded at the bottom of a page.
6. **Filters:** hide "Answered" and choose some stages. Hidden squares stay blank, and the filters line lists what's hidden.
7. **Skill icons:** do they print? (`images/*` is web-accessible, but this is untested on paper.)
