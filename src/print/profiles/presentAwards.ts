import type { PrintProfile } from "../summitPrint";
import { columnCount } from "../printFit";

/** prepareForPrint() has rendered every row and group. Gotcha: the screen's tick boxes use an icon font the print document lacks, so they become ☑ / ☐. */

const TICKED = "☑";
const UNTICKED = "☐";

export function removeScreenOnlyParts(table: HTMLTableElement): void {
  const remove = (selector: string) => Array.from(table.querySelectorAll(selector)).forEach((el) => el.parentNode?.removeChild(el));
  remove("tr.oas-vue-column-filter-row");
  Array.from(table.querySelectorAll<HTMLElement>(".present-awards-present-cell [data-present]")).forEach((box) => {
    const mark = table.ownerDocument.createElement("span");
    mark.className = "present-awards-print-tick";
    mark.textContent = box.getAttribute("data-present") === "yes" ? TICKED : UNTICKED;
    box.parentNode?.replaceChild(mark, box);
  });
  remove(".present-awards-group-toggle");
  // Full-width cells still span the old column count, so fix their colspan.
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

.summit-print-profile-present-awards .present-awards-badge-icon,
.summit-print-profile-present-awards .present-awards-badge-placeholder {
  display: block;
  width: 7mm;
  height: 7mm;
}
.summit-print-profile-present-awards .present-awards-badge-icon { object-fit: contain; }

.summit-print-profile-present-awards .present-awards-award { display: flex; align-items: center; gap: 2.1mm; }
.summit-print-profile-present-awards .present-awards-badge-slot { flex: 0 0 10.3mm; display: flex; justify-content: center; }
.summit-print-profile-present-awards .present-awards-badge-icon--wide { width: 10.3mm; }
.summit-print-profile-present-awards .present-awards-badge-placeholder {
  border: 0.5pt dashed #c8c6c4;
  border-radius: 50%;
  background: #f3f2f1;
}

table.summit-print-profile-present-awards tr.v-row-group__header { break-after: avoid; page-break-after: avoid; }
table.summit-print-profile-present-awards td.present-awards-group-header {
  background: #f3f2f1;
  font-weight: 600;
  font-size: 9.5pt;
}

table.summit-print-profile-present-awards th.present-awards-present-header,
table.summit-print-profile-present-awards td.present-awards-present-cell { text-align: center; }
.summit-print-profile-present-awards .present-awards-print-tick { font-size: 11pt; line-height: 1; }

.summit-print-profile-present-awards .present-awards-date-activator { border: 0; }
`,
};

export default presentAwards;
