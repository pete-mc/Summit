import type { PrintProfile } from "../summitPrint";
import { columnCount } from "../printFit";
import { patrolTitleRowCss } from "./heatmapShared";

const NAME_WEIGHT = 14;
const STAGE_COLUMN_WEIGHT = 3;

export function overallProgressWidths(table: HTMLTableElement): number[] | null {
  const stageColumns = columnCount(table) - 1;
  if (stageColumns < 1) return null;
  return [NAME_WEIGHT].concat(Array.from({ length: stageColumns }, () => STAGE_COLUMN_WEIGHT));
}

const overallProgress: PrintProfile = {
  name: "overall-progress",
  tableSelector: ".oas-overall-progress-table table",
  defaults: { pageSize: "A4", orientation: "landscape", margins: "normal", layout: "fit" },

  columnWidths: overallProgressWidths,
  repeatColumns: 1,
  minZoom: 0.7,

  // No "Section" line: the logo and unit name already say it.
  header: {
    title: "OAS Progress - Summary - Overall",
  },

  transform(table) {
    Array.from(table.querySelectorAll(".oas-overall-progress-sort-icon")).forEach((icon) => icon.remove());
    Array.from(table.querySelectorAll("th[title]")).forEach((th) => th.removeAttribute("title"));
  },

  css: `
table.summit-print-profile-overall-progress th { text-align: center; vertical-align: bottom; padding: 1mm 0.6mm; }
table.summit-print-profile-overall-progress th.oas-heatmap-member-header { text-align: left; }
table.summit-print-profile-overall-progress td { text-align: center; padding: 0.9mm 0.6mm; white-space: nowrap; }
table.summit-print-profile-overall-progress td.oas-heatmap-member-name { text-align: left; font-weight: 600; padding-left: 1.2mm; }

.summit-print-profile-overall-progress .oas-overall-progress-rotated-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}
.summit-print-profile-overall-progress .oas-overall-progress-stream-label { font-weight: 400; color: #555; }
.summit-print-profile-overall-progress .oas-heatmap-stage-progress { font-size: 0.8em; }
${patrolTitleRowCss("overall-progress")}`,
};

export default overallProgress;
