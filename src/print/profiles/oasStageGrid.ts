import type { PrintProfile } from "../summitPrint";
import { SQUARE_COLOUR_PROPS } from "./heatmapShared";

const P = "table.summit-print-profile-oas-stage-grid";

/** Inline screen widths would beat the print CSS. */
function stripInlineWidths(table: HTMLTableElement): void {
  Array.from(table.querySelectorAll<HTMLElement>("[style]")).forEach((el) => {
    el.style.removeProperty("width");
    el.style.removeProperty("min-width");
  });
}

/**
 * Gotcha: Chromium never breaks a page inside a rowspan, so a merged Plan / Do / Review cell moved its whole group to the
 * next page. Unmerged, each I-statement row can break on its own; hidden inner borders keep it looking like one cell.
 */
export function unmergeGroupBands(table: HTMLTableElement): void {
  Array.from(table.querySelectorAll<HTMLTableCellElement>("td.oas-stage-grid-group-band")).forEach((band) => {
    const span = band.rowSpan;
    if (span <= 1) return;
    band.rowSpan = 1;
    let row = band.parentElement as HTMLTableRowElement | null;
    for (let i = 1; i < span; i++) {
      row = row?.nextElementSibling as HTMLTableRowElement | null;
      if (!row) return;
      const continued = table.ownerDocument.createElement("td");
      continued.className = "oas-stage-grid-group-band oas-stage-grid-group-band-continued";
      row.insertBefore(continued, row.firstChild);
    }
  });
}

/** Members as columns repeats the group band and the I-statement; members as rows repeats the name. */
export function stageGridRepeatColumns(table: HTMLTableElement): number {
  return table.querySelector("td.oas-stage-grid-group-band") ? 2 : 1;
}

const oasStageGrid: PrintProfile = {
  name: "oas-stage-grid",
  tableSelector: "table",
  defaults: { pageSize: "A4", orientation: "landscape", margins: "normal", layout: "fit" },
  repeatColumns: stageGridRepeatColumns,
  bandLabel: "",
  // "Fit to page width" should fit every column and let rows run onto more pages, not split columns early.
  minZoom: 0.5,

  header: {
    title: "OAS Progress - Stage Grid",
  },

  copyComputed: [{ selector: ".oas-heatmap-square", props: SQUARE_COLOUR_PROPS }],

  transform(table) {
    stripInlineWidths(table);
    unmergeGroupBands(table);
  },

  css: `
${P} { width: auto; font-size: 9pt; }
${P} th { text-align: center; font-weight: 400; }
${P} th.oas-stage-grid-page-title,
${P} tr.oas-stage-grid-group-span-row th.oas-stage-grid-member-name-header { text-align: left; font-weight: 700; font-size: 10pt; }
${P} th.oas-stage-grid-group-header { font-weight: 600; }
${P} .oas-stage-grid-patrol-group-end { border-right: 1pt solid #8a96a3; }

${P} .oas-stage-grid-rotated-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  display: inline-block;
}

${P} th.oas-stage-grid-member-header { width: 6mm; height: 32mm; padding: 1mm 0.5mm; vertical-align: bottom; font-size: 9pt; }
${P} td.oas-stage-grid-group-band { width: 7mm; padding: 1mm 0.5mm; text-align: center; font-weight: 600; }
${P} td.oas-stage-grid-group-band-continued { border-top-style: hidden; }
${P} td.oas-stage-grid-statement { width: 85mm; min-width: 60mm; white-space: normal; }
${P} td.oas-stage-grid-cell { min-width: 6mm; padding: 0.8mm 0.5mm; text-align: center; vertical-align: middle; }
${P} .oas-heatmap-square { display: inline-block; width: 3.2mm; height: 3.2mm; vertical-align: middle; }
${P} td.oas-stage-grid-cell-na { background: #f3f2f1; }
${P} .oas-stage-grid-cell-na-label { font-size: 7pt; color: #748494; }
${P} th.oas-stage-grid-patrol-header,
${P} tr.oas-stage-grid-patrol-header-row th { background: #f0f3f6; font-weight: 600; }

${P} th.oas-stage-grid-statement-header { padding: 1mm 0.5mm; text-align: left; vertical-align: bottom; font-size: 9pt; }
/* Gotcha: rotated text swaps axes. The span's height is the wrap length; the column grows only as wide as its wrapped lines. */
${P} th.oas-stage-grid-statement-header .oas-stage-grid-rotated-text { height: 62mm; white-space: normal; word-break: break-word; }
${P} th.oas-stage-grid-member-name-header,
${P} td.oas-stage-grid-member-name-cell { text-align: left; white-space: nowrap; }
${P} tr.oas-stage-grid-patrol-divider-row td { background: #f0f3f6; font-weight: 600; text-align: left; }
${P} tr.oas-stage-grid-patrol-divider-row { break-after: avoid; page-break-after: avoid; }
`,
};

export default oasStageGrid;
