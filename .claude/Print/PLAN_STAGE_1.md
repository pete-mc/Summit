# Stage 1: Port the core and use it on the Summary tab

Parent plan: [PLAN.md](PLAN.md). Source being ported: `resources/Print module/oas-print/src/`.

## Scope

1. Port `oas-print` into `src/print/` as TypeScript, renamed to `summit-print`:
   - `summitPrint.ts`: profiles, page geometry, document build, header/footer, print via a hidden srcdoc iframe.
   - `printFit.ts`: fit/zoom and column bands, dependency-free.
   - `printStyles.ts`: base print CSS. Classes are `summit-print-*`, and the font is `SummitPrintSans` with Arial as fallback.
   - `printFonts.ts`: copies Terrain's `NunitoSans-*` `@font-face` rules into the print document, re-declared as one family with real weights (regular 400, semibold 600, bold 700).
   - `printSettings.ts`: page-setup choices per profile in `localStorage` (`summit.print.settings`).
   - `printContext.ts`: `{unit}`, `{group}` and `{section}` vars, plus the section logo URL, from `TerrainState`.
   - `sectionLogo.ts`: an explicit section → filename map for `src/images/sections/`.
   - `profiles/peakAwardSummary.ts` and `index.ts`.
2. `columnWidths` can be a function of the cloned table, which fixes the optional Special column (I6).
3. Add `TerrainState.getUnitName()` and `getGroupName()`.
4. Add `src/components/SummitPrintButton.vue` + `.ts`: the button, the page-setup dialog and the warning snackbar.
5. On the Summary tab, replace "PDF Export" with `SummitPrintButton`. `onSummaryPdfExportClick` stays in the code, unused.
6. Jest specs in `tests/unit/print/`.

## Header and footer for the Summary tab

- **Page 1:**
  - section logo;
  - "Peak Award Summary";
  - "{group} · {unit}";
  - meta: Section · Members (if a name filter is set) · Patrols · Sort · Names · Generated.
- **Every page:** "Peak Award Summary · {unit}" | "Generated {generated}" | "Page X of Y".

## Not in this stage

- The print-frame CSP fallback. It's added only if the live check shows Terrain's CSP blocks the srcdoc styles.
- The old-browser footer fallback (Stage 3).
- The Heatmap tab (Stage 2).

## Status (2026-10-10): built, awaiting live check

- Code is done. `npm test`: 965/966 passing (the 1 failure is the known UNC smoke test). Lint is clean on the changed files. `npm run build` succeeds.
- **Deviation from the port:** profiles are registered from a list (`src/print/profiles/index.ts`) rather than by an import side effect. Webpack's `sideEffects` list could otherwise drop the registration silently. Confirmed in `dist/scripts/summit.js`.
- **Font:** Terrain's family names were confirmed from the captured CSS (`NunitoSans-regular/-semibold/-bold`, each at weight 400). They still need confirming live (check 2).
- **Follow-up, not done:** `.oas-vue-pill-btn` is now declared in four scoped places (three pages plus `SummitPrintButton.vue`). Consolidating it is a separate decision.
### Live check results (user, 2026-10-10)
1. No CSP warning: the srcdoc iframe works on Terrain, so **the print-frame fallback isn't needed**.
2. The output prints in Nunito Sans.
3. Only one page of data was available. It looked correct, but multi-page footers still need checking (Stage 2's heatmap will produce several pages).
4. Settings are remembered.

### Round 2 changes (user feedback)
- The dialog's Portrait/Landscape `v-btn-toggle` rendered as dark rounded pills on Terrain, so it's replaced with a radio row. The selects now use `hide-details` to remove the empty gaps.
- Logos resized to fit 10 cm × 10 cm at 300 dpi (see PLAN.md "Section logos").
- The header no longer has the Section line or Sort by.
- The Summary title is now "OAS Progression - Summary for Peak Award".

## Live checks for the user (Edge, hard refresh on the OAS Progression page)

1. Click **Print / PDF** on the Summary tab, choose A4 landscape, and click Continue. Does the print preview appear with styled output?
   - If an error snackbar mentions "print styles were blocked", Terrain's CSP is the cause, and the print-frame fallback gets added.
2. Is the text in Nunito Sans, with bold headers in the true semibold face?
   - Check in DevTools: run `document.fonts` on the live page, and confirm the families are `NunitoSans-regular` / `NunitoSans-semibold`.
3. Do the section logo, title, group · unit, the meta line and the footers all appear?
4. Re-open the dialog. Are your last choices remembered?
5. Hide "Special" by checking a Joey/Cub/Scout unit if one is available, or otherwise just confirm Venturer columns line up.
