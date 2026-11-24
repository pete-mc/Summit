import type { PrintProfile } from "../summitPrint";
import { SQUARE_COLOUR_PROPS } from "./heatmapShared";

const P = "table.summit-print-profile-oas-next-steps";

const oasNextSteps: PrintProfile = {
  name: "oas-next-steps",
  tableSelector: ".oas-vue-data-table table",
  defaults: { pageSize: "A4", orientation: "portrait", margins: "normal", layout: "fit" },
  repeatColumns: 1,

  header: {
    title: "OAS Progress - Next Steps",
  },

  copyComputed: [{ selector: ".oas-heatmap-square", props: SQUARE_COLOUR_PROPS }],

  css: `
${P} td { vertical-align: middle; }
${P} td.oas-next-steps-inputGroup { font-weight: 600; white-space: nowrap; }
${P} td.oas-next-steps-answered { text-align: center; }
${P} td.oas-next-steps-date { white-space: nowrap; }
${P} .oas-heatmap-square { display: inline-block; width: 3.2mm; height: 3.2mm; vertical-align: middle; }
`,
};

export default oasNextSteps;
