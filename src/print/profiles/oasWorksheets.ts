import type { PrintProfile } from "../summitPrint";

const P = "table.summit-print-profile-oas-worksheets";

/** Inline screen widths would beat the print CSS. */
function stripInlineWidths(table: HTMLTableElement): void {
  Array.from(table.querySelectorAll<HTMLElement>("[style]")).forEach((el) => {
    el.style.removeProperty("width");
    el.style.removeProperty("min-width");
  });
}

/** Members as columns repeats the group band and the I-statement; members as rows repeats the name. */
export function worksheetRepeatColumns(table: HTMLTableElement): number {
  return table.querySelector("td.oas-worksheet-group-band") ? 2 : 1;
}

const oasWorksheets: PrintProfile = {
  name: "oas-worksheets",
  tableSelector: "table",
  defaults: { pageSize: "A4", orientation: "landscape", margins: "normal", layout: "fit" },
  repeatColumns: worksheetRepeatColumns,
  bandLabel: "",
  // "Fit to page width" should fit every column and let rows run onto more pages, not split columns early.
  minZoom: 0.5,

  header: {
    title: "OAS Progress - Worksheets",
  },

  transform: stripInlineWidths,

  // Gotcha: colours are literal. Chromium skips backgrounds unless "Background graphics" is on, so awarded cells also show their date.
  css: `
${P} { width: auto; font-size: 9pt; }
${P} th { text-align: center; font-weight: 400; }
${P} th.oas-worksheet-page-title,
${P} tr.oas-worksheet-group-span-row th.oas-worksheet-member-name-header { text-align: left; font-weight: 700; font-size: 10pt; }
${P} th.oas-worksheet-group-header { font-weight: 600; }
${P} .oas-worksheet-patrol-group-end { border-right: 1pt solid #8a96a3; }

${P} .oas-worksheet-rotated-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  display: inline-block;
}

${P} th.oas-worksheet-member-header { height: 32mm; padding: 1mm 0.5mm; vertical-align: bottom; font-size: 9pt; }
${P} td.oas-worksheet-group-band { width: 7mm; padding: 1mm 0.5mm; text-align: center; font-weight: 600; }
${P} td.oas-worksheet-statement { width: 85mm; min-width: 60mm; white-space: normal; }
${P} td.oas-worksheet-cell { min-width: 14mm; padding: 0.8mm 1mm; text-align: center; }
${P} .oas-worksheet-cell-date { white-space: nowrap; }
${P} td.oas-worksheet-cell-awarded { background: #b3c9b3; }
${P} td.oas-worksheet-cell-na { background: #f3f2f1; }
${P} .oas-worksheet-cell-na-label { font-size: 7pt; color: #748494; }
${P} .oas-worksheet-tick-box { display: inline-block; width: 6mm; height: 6mm; border: 0.5pt solid #b7c2cc; border-radius: 1px; }
${P} th.oas-worksheet-patrol-header,
${P} tr.oas-worksheet-patrol-header-row th { background: #f0f3f6; font-weight: 600; }

${P} th.oas-worksheet-statement-header { padding: 1mm 0.5mm; text-align: left; vertical-align: bottom; font-size: 9pt; }
/* Gotcha: rotated text swaps axes. The span's height is the wrap length; the column grows only as wide as its wrapped lines. */
${P} th.oas-worksheet-statement-header .oas-worksheet-rotated-text { height: 62mm; white-space: normal; word-break: break-word; }
${P} th.oas-worksheet-member-name-header,
${P} td.oas-worksheet-member-name-cell { text-align: left; white-space: nowrap; }
${P} tr.oas-worksheet-patrol-divider-row td { background: #f0f3f6; font-weight: 600; text-align: left; }
${P} tr.oas-worksheet-patrol-divider-row { break-after: avoid; page-break-after: avoid; }
`,
};

export default oasWorksheets;
