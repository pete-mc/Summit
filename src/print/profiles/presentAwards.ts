import type { PrintProfile } from "../summitPrint";
import { columnCount } from "../printFit";

/**
 * Present Awards (PresentAwardsTableVue). See .claude/Print/PLAN_STAGE_4.md.
 * Columns on screen: [Name] | Type | Award (with badge) | Date Awarded | Date Presented | Presented
 * (Yes/No) | Present (tick box) — Name is absent
 * when grouped by member (Vuetify moves it into the group header row).
 *
 * The page's prepareForPrint() has already put every row and every expanded group into the DOM
 * before this runs; this profile only removes what is screen-only, and turns the Present tick
 * boxes into printable ☑ / ☐ (the screen draws them with an icon font the print document lacks).
 */

const TICKED = "☑";
const UNTICKED = "☐";

/** Exported for tests. */
export function removeScreenOnlyParts(table: HTMLTableElement): void {
  const remove = (selector: string) => Array.from(table.querySelectorAll(selector)).forEach((el) => el.parentNode?.removeChild(el));
  // The in-table column filter boxes.
  remove("tr.oas-vue-column-filter-row");
  // The Present tick box: printed as ☑ / ☐, read from the data-present the table sets (user, 2026-10-13).
  Array.from(table.querySelectorAll<HTMLElement>(".present-awards-present-cell [data-present]")).forEach((box) => {
    const mark = table.ownerDocument.createElement("span");
    mark.className = "present-awards-print-tick";
    mark.textContent = box.getAttribute("data-present") === "yes" ? TICKED : UNTICKED;
    box.parentNode?.replaceChild(mark, box);
  });
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

/* Award cell: badge then name on one line, every badge centred in a slot as wide as the widest
   (additional award) artwork so the names line up — same structure as the screen (user, 2026-10-12). */
.summit-print-profile-present-awards .present-awards-award { display: flex; align-items: center; gap: 2.1mm; }
.summit-print-profile-present-awards .present-awards-badge-slot { flex: 0 0 10.3mm; display: flex; justify-content: center; }
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

/* Present column: the tick mark, centred like the screen's tick box. */
table.summit-print-profile-present-awards th.present-awards-present-header,
table.summit-print-profile-present-awards td.present-awards-present-cell { text-align: center; }
.summit-print-profile-present-awards .present-awards-print-tick { font-size: 11pt; line-height: 1; }

/* The presented date is a click target on screen (dotted underline); plain text on paper. */
.summit-print-profile-present-awards .present-awards-date-activator { border: 0; }
`,
};

export default presentAwards;
