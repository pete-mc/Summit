/** A string, not a .css import: it's written into the isolated print document, which nothing on Terrain's page can reach. */
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

/* Gotcha: 1pt short of full width. With collapsed borders half the outer border sits outside the box, so 100% loses the right edge in the margin. */
table.summit-print-table {
  width: calc(100% - 1pt);
  border-collapse: collapse;
}
table.summit-print-table.summit-print-fixed { table-layout: fixed; }

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
/* No striping: grey hid the patrol title rows. */
table.summit-print-table tbody td { background: #fff; }

/* Fallback footer (no page-margin boxes): no page numbers, since counters only work in margin boxes. */
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

.summit-print-band + .summit-print-band { break-before: page; }
.summit-print-band-label {
  margin: 0 0 2mm;
  font-size: 8.5pt;
  font-weight: 600;
  color: #333;
}

.v-data-footer, .v-data-table-header__icon, .v-ripple__container { display: none !important; }
`;
