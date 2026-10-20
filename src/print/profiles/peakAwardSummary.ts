import type { PrintProfile } from "../summitPrint";
import { columnCount } from "../printFit";
import { SQUARE_COLOUR_PROPS, stripInlineSizes } from "./heatmapShared";

/** Widths depend on the printed table, because the Special column only exists for some sections. */
const WIDTHS_WITH_SPECIAL = [14, 8, 6, 12, 12, 12, 23, 13];

/** Unknown column counts fall back to automatic widths. */
export function peakAwardSummaryWidths(table: HTMLTableElement): number[] | null {
  const n = columnCount(table);
  if (n === WIDTHS_WITH_SPECIAL.length) return WIDTHS_WITH_SPECIAL;
  if (n === WIDTHS_WITH_SPECIAL.length - 1) return WIDTHS_WITH_SPECIAL.slice(0, -1);
  return null;
}

const peakAwardSummary: PrintProfile = {
  name: "peak-award-summary",
  tableSelector: ".oas-heatmap-data-table table",
  defaults: { pageSize: "A4", orientation: "portrait", margins: "normal", layout: "fit" },

  // No "Section" line: the logo and unit name already say it.
  header: {
    title: "OAS Progression - Summary for Peak Award",
  },

  columnWidths: peakAwardSummaryWidths,
  repeatColumns: 1,

  copyComputed: [
    { selector: ".oas-heatmap-square", props: SQUARE_COLOUR_PROPS },
    { selector: ".oas-heatmap-stage-bar", props: ["background-color", "border-radius"] },
  ],

  transform(table) {
    stripInlineSizes(table, ".oas-heatmap-stage-bar, .oas-heatmap-square");
  },

  css: `
.summit-print-profile-peak-award-summary { --summit-print-square: 2.6mm; --summit-print-gap: 0.6mm; }
table.summit-print-profile-peak-award-summary th { text-align: center; }
table.summit-print-profile-peak-award-summary th.oas-heatmap-member-header { text-align: left; }
.summit-print-profile-peak-award-summary .oas-heatmap-member-name { font-weight: 600; }

.summit-print-profile-peak-award-summary .oas-heatmap-stage-bar {
  display: block;
  width: 100%;
  min-height: 2.6mm;
}

.summit-print-profile-peak-award-summary .oas-peak-award-summary-row {
  display: flex;
  flex-wrap: wrap;            /* narrow columns: text drops below the squares */
  align-items: center;
  gap: 0.8mm 1.5mm;
}
.summit-print-profile-peak-award-summary .oas-heatmap-squares {
  display: flex;
  flex-wrap: wrap;            /* wraps in narrow (portrait) columns */
  gap: var(--summit-print-gap);
  min-width: 0;
}
.summit-print-profile-peak-award-summary .oas-heatmap-square {
  flex: 0 0 auto;
  width: var(--summit-print-square);
  height: var(--summit-print-square);
}
.summit-print-profile-peak-award-summary .oas-peak-award-summary-text {
  flex: 0 0 auto;
  white-space: nowrap;
  font-size: 8pt;
  color: #333;
}
`,
};

export default peakAwardSummary;
