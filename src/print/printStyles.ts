/**
 * Base print stylesheet shared by every table Summit prints (see .claude/Print/PLAN.md).
 *
 * Kept as a string rather than a .css import because it is written straight into the isolated
 * print document — Summit's own content-script CSS and Vue scoped styles never reach that
 * document, which is the point: nothing on Terrain's page can leak into the printout.
 *
 * Font: SummitPrintSans is Terrain's own Nunito Sans, re-declared inside the print document by
 * printFonts.ts with real weights. Arial is the fallback if Terrain's fonts can't be found.
 */
export const PRINT_FONT_STACK = '"SummitPrintSans", arial, sans-serif';

export const BASE_PRINT_CSS = `
:root {
  --summit-print-font: ${PRINT_FONT_STACK};
  --summit-print-border: #b9bec4;
  --summit-print-head-bg: #eceff2;
}

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  color: #111;
  font: 9pt/1.3 var(--summit-print-font);
}

/* ---------- First-page header (in normal flow, so page 1 only) ---------- */
.summit-print-header {
  display: flex;
  align-items: center;
  gap: 4mm;
  margin: 0 0 4mm;
  padding: 0 0 2.5mm;
  border-bottom: 1.2pt solid #333;
}
.summit-print-logo {
  flex: 0 0 auto;
  height: 18mm;
  width: auto;
}
.summit-print-header-text { flex: 1 1 auto; min-width: 0; }
.summit-print-header h1 {
  margin: 0;
  font-size: 15pt;
  font-weight: 700;
  line-height: 1.2;
}
.summit-print-subtitle {
  margin-top: 0.8mm;
  font-size: 10pt;
  color: #444;
}
.summit-print-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1mm 7mm;
  margin: 2mm 0 0;
  font-size: 8.5pt;
  color: #333;
}
.summit-print-meta div { white-space: nowrap; }
.summit-print-meta dt { display: inline; font-weight: 600; }
.summit-print-meta dd { display: inline; margin: 0 0 0 1.5mm; }

/* ---------- Table ---------- */
/* 1pt short of full width: with collapsed borders, half of the outer border sits OUTSIDE the
   table's box, so a 100%-wide table puts its right edge in the page margin, where it isn't drawn
   (right edge missing on Present Awards, A4 portrait/normal margins, 2026-10-11). */
table.summit-print-table {
  width: calc(100% - 1pt);
  border-collapse: collapse;
}
table.summit-print-table.summit-print-fixed { table-layout: fixed; }

/* Repeat the (multi-row) header on every page, never split a row */
table.summit-print-table thead { display: table-header-group; }
table.summit-print-table tr { break-inside: avoid; page-break-inside: avoid; }

table.summit-print-table th,
table.summit-print-table td {
  border: 0.5pt solid var(--summit-print-border);
  padding: 1.2mm 1.6mm;
  vertical-align: middle;
  text-align: left;
  overflow: hidden;
}
table.summit-print-table th {
  background: var(--summit-print-head-bg);
  font-weight: 600;
  font-size: 8.5pt;
  line-height: 1.2;
}
/* No zebra striping: rows print on white (user, 2026-10-11). Alternating grey obscured the
   patrol title rows when "Break by patrol" was on. A profile that wants striping adds its own. */
table.summit-print-table tbody td { background: #fff; }

/* ---------- Fallback footer (browsers without page-margin boxes) ----------
   A <tfoot> row: repeated at the foot of the table on every printed page. No page numbers —
   CSS page counters only work in margin boxes. See .claude/Print/PLAN_STAGE_3.md. */
table.summit-print-table tfoot.summit-print-tfoot { display: table-footer-group; }
table.summit-print-table tfoot.summit-print-tfoot td {
  border: 0;
  border-top: 0.5pt solid var(--summit-print-border);
  padding: 1.5mm 0 0;
  background: #fff;
  font-size: 7.5pt;
  font-weight: 400;
  color: #555;
}
.summit-print-foot { display: flex; justify-content: space-between; gap: 4mm; }
.summit-print-foot-center { flex: 1 1 auto; text-align: center; }

/* ---------- Wide tables split into column bands ---------- */
.summit-print-band + .summit-print-band { break-before: page; }
.summit-print-band-label {
  margin: 0 0 2mm;
  font-size: 8.5pt;
  font-weight: 600;
  color: #333;
}

/* Screen-only bits that may be cloned from Vuetify */
.v-data-footer, .v-data-table-header__icon, .v-ripple__container { display: none !important; }
`;
