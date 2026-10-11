import type { PrintProfile } from "../summitPrint";
import { columnCount } from "../printFit";

/**
 * Present Awards (PresentAwardsTableVue). See .claude/Print/PLAN_STAGE_4.md.
 * Columns on screen: [Name] | Type | Award | badge | Date | Presented | Present — Name is absent
 * when grouped by member (Vuetify moves it into the group header row).
 *
 * The page's prepareForPrint() has already put every row and every expanded group into the DOM
 * before this runs; this profile only removes what is screen-only.
 */

/** Exported for tests. */
export function removeScreenOnlyParts(table: HTMLTableElement): void {
  const remove = (selector: string) => Array.from(table.querySelectorAll(selector)).forEach((el) => el.parentNode?.removeChild(el));
  // The in-table column filter boxes.
  remove("tr.oas-vue-column-filter-row");
  // The Present tick-box column, by the class its header definition gives it — not by position.
  remove(".present-awards-present-header, .present-awards-present-cell");
  // Group collapse chevrons.
  remove(".present-awards-group-toggle");
  // Full-width cells (group headers, Vuetify's "no data" row) still span the old column count.
  const columns = columnCount(table);
  Array.from(table.querySelectorAll<HTMLTableCellElement>("tbody td[colspan]")).forEach((td) => {
    if (td.colSpan > columns) td.colSpan = columns;
  });
}

const presentAwards: PrintProfile = {
  name: "present-awards",
  tableSelector: ".present-awards-data-table table",
  defaults: { pageSize: "A4", orientation: "portrait", margins: "normal", layout: "fit" },
  repeatColumns: 1,

  header: {
    title: "Present Awards",
  },

  transform: removeScreenOnlyParts,

  css: `
table.summit-print-profile-present-awards td { vertical-align: middle; }

/* Badge artwork: the screen's 28px box, in print units. Wide (additional award) art keeps its aspect. */
.summit-print-profile-present-awards .present-awards-badge-icon,
.summit-print-profile-present-awards .present-awards-badge-placeholder {
  display: block;
  width: 7mm;
  height: 7mm;
}
.summit-print-profile-present-awards .present-awards-badge-icon { object-fit: contain; }

/* Narrow badge column, badge pushed right beside the award name it illustrates (~16px / 4.2mm gap
   on screen: 2.1mm each side here). User, 2026-10-11/12. Same classes the screen uses (Vuetify
   header class/cellClass), so print and screen match. */
table.summit-print-profile-present-awards th.present-awards-badge-header,
table.summit-print-profile-present-awards td.present-awards-badge-cell {
  width: 1%;
  padding-left: 3.7mm;
  padding-right: 2.1mm;
  text-align: right;
}
table.summit-print-profile-present-awards th.present-awards-award-header,
table.summit-print-profile-present-awards td.present-awards-award-cell { padding-left: 2.1mm; }
.summit-print-profile-present-awards td.present-awards-badge-cell .present-awards-badge-icon,
.summit-print-profile-present-awards td.present-awards-badge-cell .present-awards-badge-placeholder { margin-left: auto; }
.summit-print-profile-present-awards .present-awards-badge-icon--wide { width: 10.3mm; }
.summit-print-profile-present-awards .present-awards-badge-placeholder {
  border: 0.5pt dashed #c8c6c4;
  border-radius: 50%;
  background: #f3f2f1;
}

/* Member group header rows: a tinted band, kept with the first award beneath it. */
table.summit-print-profile-present-awards tr.v-row-group__header { break-after: avoid; page-break-after: avoid; }
table.summit-print-profile-present-awards td.present-awards-group-header {
  background: #f3f2f1;
  font-weight: 600;
  font-size: 9.5pt;
}

/* The presented date is a click target on screen (dotted underline); plain text on paper. */
.summit-print-profile-present-awards .present-awards-date-activator { border: 0; }
`,
};

export default presentAwards;
