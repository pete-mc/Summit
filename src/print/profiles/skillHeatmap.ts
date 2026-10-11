import type { PrintProfile } from "../summitPrint";
import { columnCount } from "../printFit";
import { SQUARE_COLOUR_PROPS, stripInlineSizes } from "./heatmapShared";

/**
 * OAS Progression → Heatmap tab (OASHeatMapVue). See .claude/Print/PLAN_STAGE_2.md.
 * Columns: Member (or Skill, when grouped by member) | Stage | one column per visible stage.
 * One <tbody> per section, each opening with a title row (skill, or member when grouped by
 * member), optionally followed by patrol title rows ("Break by patrol").
 *
 * Layouts:
 *   fit   – one page wide. Square strips wrap, one line per Plan/Do/Review group, so each
 *           in-progress cell becomes a small block of lines.
 *   split – squares stay on one line at full size; the columns are split across as many
 *           page-wide parts as needed, with Member repeated on every part.
 */
const NAME_WEIGHT = 12;
const STAGE_WEIGHT = 5.5;
const STAGE_COLUMN_WEIGHT = 9;

/**
 * Widths for the table actually being printed: the Stages filter and "Empty top stages" change
 * how many stage columns there are (PLAN.md I5). Exported for tests.
 */
export function skillHeatmapWidths(table: HTMLTableElement): number[] | null {
  const stageColumns = columnCount(table) - 2;
  if (stageColumns < 1) return null;
  return [NAME_WEIGHT, STAGE_WEIGHT].concat(Array.from({ length: stageColumns }, () => STAGE_COLUMN_WEIGHT));
}

const skillHeatmap: PrintProfile = {
  name: "skill-heatmap",
  tableSelector: ".oas-heatmap-data-table table",
  defaults: { pageSize: "A4", orientation: "landscape", margins: "normal", layout: "fit" },

  columnWidths: skillHeatmapWidths,
  // Only Member repeats on split parts; Stage prints on part 1 only (user, 2026-10-11, "at this time").
  repeatColumns: 1,
  bandLabel: "Stages {first} – {last}",
  minZoom: 0.7,

  // No "Section" meta line: the section logo and the unit name already say it (user, 2026-10-10).
  header: {
    title: "OAS Progression - Heatmap",
  },

  copyComputed: [
    { selector: ".oas-heatmap-square", props: SQUARE_COLOUR_PROPS },
    // Unstarted bars are drawn by their border as much as their fill.
    { selector: ".oas-heatmap-stage-bar", props: SQUARE_COLOUR_PROPS },
  ],

  transform(table) {
    stripInlineSizes(table, ".oas-heatmap-stage-bar, .oas-heatmap-square");
    // A zero-height line break before each Plan/Do/Review group (used in 'fit'; hidden in 'split').
    // On screen the groups are separated by a ::before dash from index.css, which doesn't reach
    // the print document.
    Array.from(table.querySelectorAll(".oas-heatmap-square-group-start")).forEach((sq) => {
      if (sq.previousElementSibling) {
        const br = table.ownerDocument.createElement("i");
        br.className = "oas-sq-break";
        sq.parentNode?.insertBefore(br, sq);
      }
    });
  },

  css: `
.summit-print-profile-skill-heatmap { --summit-print-square: 2.1mm; --summit-print-gap: 0.4mm; }

table.summit-print-profile-skill-heatmap th { text-align: center; }
table.summit-print-profile-skill-heatmap th.oas-heatmap-member-header { text-align: left; }
table.summit-print-profile-skill-heatmap td { padding: 0.9mm 1.2mm; }

/* Section title rows (skill, or member when grouped by member): a band across the table, kept
   with the first row beneath it. */
table.summit-print-profile-skill-heatmap tr.oas-heatmap-skill-title-row > td {
  background: #dfe7ee;
  font-weight: 700;
  font-size: 9.5pt;
  padding: 1.2mm 1.6mm;
}
table.summit-print-profile-skill-heatmap tr.oas-heatmap-skill-title-row,
table.summit-print-profile-skill-heatmap tr.oas-heatmap-patrol-title-row {
  break-after: avoid;
  page-break-after: avoid;
}
/* Patrol beside the member's name when grouped by member — qualifies rather than identifies. */
.summit-print-profile-skill-heatmap .oas-heatmap-member-patrol { font-weight: 400; color: #555; }

/* "Break by patrol" rows: a lighter band than the section title above them. */
table.summit-print-profile-skill-heatmap tr.oas-heatmap-patrol-title-row > td {
  background: #f0f3f6;
  font-weight: 600;
  font-size: 8.5pt;
  padding: 0.9mm 1.6mm;
}

.summit-print-profile-skill-heatmap .oas-heatmap-skill-icon {
  width: 4.5mm; height: 4.5mm; vertical-align: middle; margin-right: 1.5mm;
}

.summit-print-profile-skill-heatmap .oas-heatmap-member-name { font-weight: 600; }
.summit-print-profile-skill-heatmap .oas-heatmap-highest-stage { text-align: center; font-weight: 600; }
.summit-print-profile-skill-heatmap .oas-heatmap-stage-progress { font-weight: 400; font-size: 7pt; color: #555; }

.summit-print-profile-skill-heatmap .oas-heatmap-stage-bar {
  display: block; width: 100%; min-width: 10mm; height: 2.3mm;
}

.summit-print-profile-skill-heatmap .oas-heatmap-squares {
  display: flex;
  flex-wrap: wrap;
  gap: var(--summit-print-gap);
}
.summit-print-profile-skill-heatmap .oas-heatmap-square {
  flex: 0 0 auto;
  width: var(--summit-print-square);
  height: var(--summit-print-square);
}
/* "Show > Answered" off: the square keeps its slot but prints nothing (PLAN.md I7). */
.summit-print-profile-skill-heatmap .oas-heatmap-square-hidden { visibility: hidden; }
.summit-print-profile-skill-heatmap .oas-sq-break { flex-basis: 100%; height: 0; }

/* split layout: keep each strip on one line, gap between groups instead */
.summit-print-layout-split .summit-print-profile-skill-heatmap .oas-heatmap-squares { flex-wrap: nowrap; }
.summit-print-layout-split .summit-print-profile-skill-heatmap .oas-sq-break { display: none; }
.summit-print-layout-split .summit-print-profile-skill-heatmap .oas-heatmap-square-group-start { margin-left: 1mm; }
.summit-print-layout-split .summit-print-profile-skill-heatmap .oas-heatmap-squares > .oas-heatmap-square:first-child { margin-left: 0; }
`,
};

export default skillHeatmap;
