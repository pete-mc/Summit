import type { PrintProfile } from "../summitPrint";

/** prepareForPrint() has already rendered every row; this only removes the screen-only filter row. */
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
