import { buildPrintDocument, getPrintProfile } from "@/print/summitPrint";
import { worksheetRepeatColumns } from "@/print/profiles/oasWorksheets";
import { buildWorksheetsPrintMeta } from "@/pages/OasProgressVue/services/oasPrintMeta";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";

const VARS = { unit: "Example Venturer Unit", group: "1st Example Group", section: "Venturer Scouts" };
const GENERATED = new Date(2026, 10, 3, 9, 0);

const COLUMNS_TABLE = `
<table><thead><tr><th class="oas-worksheet-group-header oas-worksheet-page-title" colspan="2">Stage 1 - Bushcraft</th><th class="oas-worksheet-member-header" style="width: 70px; min-width: 70px">A</th></tr></thead>
<tbody><tr><td class="oas-worksheet-group-band" rowspan="1">Plan</td><td class="oas-worksheet-statement" style="width: 420px">I can plan.</td><td class="oas-worksheet-cell" style="width: 70px; min-width: 70px"><span class="oas-worksheet-tick-box"></span></td></tr></tbody></table>`;

const ROWS_TABLE = `
<table><thead><tr class="oas-worksheet-group-span-row"><th class="oas-worksheet-member-name-header">Stage 1 - Bushcraft</th><th colspan="1">Plan</th></tr>
<tr><th class="oas-worksheet-member-name-header">Member</th><th class="oas-worksheet-statement-header" style="width: 72px">I can plan.</th></tr></thead>
<tbody><tr><td class="oas-worksheet-member-name-cell" style="width: 120px">Member A</td><td class="oas-worksheet-cell"></td></tr></tbody></table>`;

function tableFrom(html: string): HTMLTableElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host.querySelector("table") as HTMLTableElement;
}

describe("oas-worksheets profile", () => {
  it("is titled per the OAS Progress pattern and defaults to A4 landscape fit", () => {
    const profile = getPrintProfile("oas-worksheets");
    expect(profile.header.title).toBe("OAS Progress - Worksheets");
    expect(profile.defaults).toMatchObject({ pageSize: "A4", orientation: "landscape", layout: "fit" });
  });

  it("repeats the group band and I-statement for members as columns, and the name for members as rows", () => {
    expect(worksheetRepeatColumns(tableFrom(COLUMNS_TABLE))).toBe(2);
    expect(worksheetRepeatColumns(tableFrom(ROWS_TABLE))).toBe(1);
  });

  // A few members used to be stretched across the whole printed page.
  it("drops the screen's inline widths and doesn't stretch the table to the page width", () => {
    const source = tableFrom(COLUMNS_TABLE);
    const doc = new DOMParser().parseFromString(buildPrintDocument({ source, profile: "oas-worksheets", vars: VARS, generated: GENERATED }), "text/html");
    const printed = doc.querySelector("table.summit-print-table") as HTMLTableElement;

    expect(printed.querySelectorAll("[style*=width]")).toHaveLength(0);
    expect(source.querySelectorAll("[style*=width]").length).toBeGreaterThan(0);
    expect(doc.head.textContent).toContain("table.summit-print-profile-oas-worksheets { width: auto;");
  });
});

describe("buildWorksheetsPrintMeta", () => {
  const filters = (overrides: Partial<OASProgressVueFilterState> = {}) =>
    ({ worksheetVisibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9], worksheetSelectedPatrols: ["Possum", "Wombat"], worksheetShowCompleted: true, ...overrides }) as OASProgressVueFilterState;

  it("lists only the Skill when nothing else narrows the sheets", () => {
    expect(buildWorksheetsPrintMeta(filters(), "Bushcraft - Pioneering", ["Possum", "Wombat"], false)).toEqual([{ label: "Skill", value: "Bushcraft - Pioneering" }]);
  });

  it("adds stages, patrols and hidden members when they narrow the sheets", () => {
    expect(buildWorksheetsPrintMeta(filters({ worksheetVisibleStages: [3, 1], worksheetSelectedPatrols: ["Possum"], worksheetShowCompleted: false }), "Camping", ["Possum", "Wombat"], true)).toEqual([
      { label: "Skill", value: "Camping" },
      { label: "Stages", value: "1, 3" },
      { label: "Patrol", value: "Possum" },
      { label: "Hidden", value: "Members awarded the stage" },
    ]);
  });
});
