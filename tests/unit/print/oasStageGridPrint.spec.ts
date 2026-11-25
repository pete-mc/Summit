import { buildPrintDocument, getPrintProfile } from "@/print/summitPrint";
import { stageGridRepeatColumns, unmergeGroupBands } from "@/print/profiles/oasStageGrid";
import { buildStageGridPrintMeta } from "@/pages/OasProgressVue/services/oasPrintMeta";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";

const VARS = { unit: "Example Venturer Unit", group: "1st Example Group", section: "Venturer Scouts" };
const GENERATED = new Date(2026, 10, 3, 9, 0);

const COLUMNS_TABLE = `
<table><thead><tr><th class="oas-stage-grid-group-header oas-stage-grid-page-title" colspan="2">Stage 1 - Bushcraft</th><th class="oas-stage-grid-member-header" style="width: 70px; min-width: 70px">A<span class="oas-tab-jump-menu"><button>v</button></span></th></tr></thead>
<tbody><tr><td class="oas-stage-grid-group-band" rowspan="1">Plan</td><td class="oas-stage-grid-statement" style="width: 420px">I can plan.</td><td class="oas-stage-grid-cell" style="width: 70px; min-width: 70px"><span class="oas-stage-grid-tick-box"></span></td></tr></tbody></table>`;

const ROWS_TABLE = `
<table><thead><tr class="oas-stage-grid-group-span-row"><th class="oas-stage-grid-member-name-header">Stage 1 - Bushcraft</th><th colspan="1">Plan</th></tr>
<tr><th class="oas-stage-grid-member-name-header">Member</th><th class="oas-stage-grid-statement-header" style="width: 72px">I can plan.</th></tr></thead>
<tbody><tr><td class="oas-stage-grid-member-name-cell" style="width: 120px">Member A</td><td class="oas-stage-grid-cell"></td></tr></tbody></table>`;

function tableFrom(html: string): HTMLTableElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host.querySelector("table") as HTMLTableElement;
}

describe("oas-stage-grid profile", () => {
  it("is titled per the OAS Progress pattern and defaults to A4 landscape fit", () => {
    const profile = getPrintProfile("oas-stage-grid");
    expect(profile.header.title).toBe("OAS Progress - Stage Grid");
    expect(profile.defaults).toMatchObject({ pageSize: "A4", orientation: "landscape", layout: "fit" });
  });

  it("repeats the group band and I-statement for members as columns, and the name for members as rows", () => {
    expect(stageGridRepeatColumns(tableFrom(COLUMNS_TABLE))).toBe(2);
    expect(stageGridRepeatColumns(tableFrom(ROWS_TABLE))).toBe(1);
  });

  // A few members used to be stretched across the whole printed page.
  it("drops the screen's inline widths and doesn't stretch the table to the page width", () => {
    const source = tableFrom(COLUMNS_TABLE);
    const doc = new DOMParser().parseFromString(buildPrintDocument({ source, profile: "oas-stage-grid", vars: VARS, generated: GENERATED }), "text/html");
    const printed = doc.querySelector("table.summit-print-table") as HTMLTableElement;

    expect(printed.querySelectorAll("[style*=width]")).toHaveLength(0);
    expect(source.querySelectorAll("[style*=width]").length).toBeGreaterThan(0);
    expect(doc.head.textContent).toContain("table.summit-print-profile-oas-stage-grid { width: auto;");
  });

  it("strips the Open-in menus", () => {
    const doc = new DOMParser().parseFromString(buildPrintDocument({ source: tableFrom(COLUMNS_TABLE), profile: "oas-stage-grid", vars: VARS, generated: GENERATED }), "text/html");
    expect(doc.querySelector("table.summit-print-table th.oas-stage-grid-member-header")?.textContent).toBe("A");
    expect(doc.querySelector("table.summit-print-table .oas-tab-jump-menu")).toBeNull();
  });

  it("prints the screen's status boxes in the screen's colours, with no dates or tick boxes", () => {
    const profile = getPrintProfile("oas-stage-grid");
    expect(profile.copyComputed.map((rule) => rule.selector)).toEqual([".oas-heatmap-square"]);
    expect(profile.css).toContain(".oas-heatmap-square {");
    expect(profile.css).not.toMatch(/tick-box|cell-date/);
  });
});

describe("unmergeGroupBands", () => {
  // A merged Plan cell stopped the page breaking inside its group, leaving half-empty pages.
  it("gives every I-statement row its own group cell, labelled only on the first, so pages can break on any row", () => {
    const table = tableFrom(`<table><tbody>
<tr><td class="oas-stage-grid-group-band" rowspan="3">Plan</td><td>a</td></tr>
<tr><td>b</td></tr>
<tr><td>c</td></tr>
<tr><td class="oas-stage-grid-group-band" rowspan="1">Do</td><td>d</td></tr>
</tbody></table>`);

    unmergeGroupBands(table);

    const rows = Array.from(table.querySelectorAll("tr"));
    expect(rows.map((r) => r.cells.length)).toEqual([2, 2, 2, 2]);
    expect(Array.from(table.querySelectorAll("td[rowspan]")).map((td) => (td as HTMLTableCellElement).rowSpan)).toEqual([1, 1]);
    expect(rows.map((r) => r.cells[0].textContent)).toEqual(["Plan", "", "", "Do"]);
    expect(table.querySelectorAll(".oas-stage-grid-group-band-continued")).toHaveLength(2);
  });
});

describe("buildStageGridPrintMeta", () => {
  const filters = (overrides: Partial<OASProgressVueFilterState> = {}) => ({ stageGridSelectedPatrols: ["Possum", "Wombat"], stageGridShowApproved: true, ...overrides }) as OASProgressVueFilterState;

  it("lists only the Skill and Stage when nothing else narrows the sheets", () => {
    expect(buildStageGridPrintMeta(filters(), "Bushcraft - Pioneering", 2, ["Possum", "Wombat"], false)).toEqual([
      { label: "Skill", value: "Bushcraft - Pioneering" },
      { label: "Stage", value: "2" },
    ]);
  });

  it("adds patrols and hidden members when they narrow the sheets", () => {
    expect(buildStageGridPrintMeta(filters({ stageGridSelectedPatrols: ["Possum"], stageGridShowApproved: false }), "Camping", 3, ["Possum", "Wombat"], true)).toEqual([
      { label: "Skill", value: "Camping" },
      { label: "Stage", value: "3" },
      { label: "Patrol", value: "Possum" },
      { label: "Hidden", value: "Members approved for the stage" },
    ]);
  });
});
