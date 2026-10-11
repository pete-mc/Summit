import type { PrintProfile } from "../summitPrint";
import { columnCount } from "../printFit";
import { SQUARE_COLOUR_PROPS, stripInlineSizes } from "./heatmapShared";

/**
 * OAS Progression → Summary tab (OASPeakAwardSummaryVue).
 * Columns: Member | Progress | Bushcraft | Bushwalking | Camping | Progressions | Special
 *
 * Special only exists for sections with a Special condition (hasSpecial), so the widths are
 * worked out from the table actually being printed rather than fixed (PLAN.md I6).
 */
const WIDTHS_WITH_SPECIAL = [14, 11, 13, 13, 13, 23, 13];

/** Exported for tests. Unknown column counts fall back to automatic widths. */
export function peakAwardSummaryWidths(table: HTMLTableElement): number[] | null {
  const n = columnCount(table);
  if (n === WIDTHS_WITH_SPECIAL.length) return WIDTHS_WITH_SPECIAL;
  if (n === WIDTHS_WITH_SPECIAL.length - 1) return WIDTHS_WITH_SPECIAL.slice(0, -1);
  return null;
}

const peakAwardSummary: PrintProfile = {
  name: "peak-award-summary",
  tableSelector: ".oas-heatmap-data-table table",
  // Portrait matches the old export's choice for this narrower table; the user can change it.
  defaults: { pageSize: "A4", orientation: "portrait", margins: "normal", layout: "fit" },

  // No "Section" meta line: the section logo and the unit name already say it (user, 2026-10-10).
  header: {
    title: "OAS Progression - Summary for Peak Award",
  },

  columnWidths: peakAwardSummaryWidths,

  // Colours and shapes come from the live screen CSS so the print matches the app; sizes are set
  // in print units below instead.
  copyComputed: [
    { selector: ".oas-heatmap-square", props: SQUARE_COLOUR_PROPS },
    { selector: ".oas-heatmap-stage-bar", props: ["background-color", "border-radius"] },
  ],

  transform(table) {
    // Screen pixel sizes (the bar's inline width from barWidthPx, square sizes) don't belong on paper.
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
