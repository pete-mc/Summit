import type { PrintProfile } from "../summitPrint";

/**
 * OAS Progression → Table tab (OASProgressionTableVue). Kept deliberately simple — the user may
 * rework this tab (.claude/Print/PLAN_STAGE_5.md §C). Columns: Member | Skill | Stream | Stage |
 * Group | I-Statement | Answered | Awarded | Date.
 *
 * The page's prepareForPrint() has already put every row in the DOM; this only removes the
 * in-table filter row, which is screen-only.
 */
const oasTable: PrintProfile = {
  name: "oas-table",
  tableSelector: ".oas-vue-data-table table",
  defaults: { pageSize: "A4", orientation: "landscape", margins: "normal", layout: "fit" },
  repeatColumns: 1,

  header: {
    title: "OAS Progression - Table",
  },

  transform(table) {
    Array.from(table.querySelectorAll("tr.oas-vue-column-filter-row")).forEach((row) => row.parentNode?.removeChild(row));
  },

  css: `
table.summit-print-profile-oas-table td { vertical-align: top; }
`,
};

export default oasTable;
