import { buildPrintDocument, getPrintProfile, resolveHeaderFooter } from "@/print/summitPrint";
import { buildOasTablePrintMeta } from "@/pages/OasProgressionVue/services/oasPrintMeta";
import OASProgressionTableVue from "@/pages/OasProgressionVue/components/OASProgressionTableVue";

const VARS = { unit: "Example Venturer Unit", group: "1st Example Group", section: "Venturer Scouts" };
const GENERATED = new Date(2026, 9, 12, 9, 0);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("oas-table profile (.claude/Print/PLAN_STAGE_5.md §C)", () => {
  it("is titled per the OAS Progression pattern, A4 landscape, with only Generated in the meta", () => {
    const profile = getPrintProfile("oas-table");
    expect(profile.header.title).toBe("OAS Progression - Table");
    expect(profile.defaults).toMatchObject({ pageSize: "A4", orientation: "landscape", layout: "fit" });
    const r = resolveHeaderFooter({ source: document.body, profile: "oas-table", vars: VARS, generated: GENERATED });
    expect(r.header.meta.map((m) => m.label)).toEqual(["Generated"]);
  });

  it("drops the in-table filter row and keeps the data rows", () => {
    const host = document.createElement("div");
    host.innerHTML = `
<div class="v-data-table oas-vue-data-table"><div class="v-data-table__wrapper"><table>
  <thead><tr><th>Member</th><th>Skill</th></tr></thead>
  <tbody>
    <tr class="oas-vue-column-filter-row"><th><input></th><th><input></th></tr>
    <tr><td>Member A</td><td>camping</td></tr>
  </tbody>
</table></div></div>`;
    document.body.appendChild(host);
    const doc = new DOMParser().parseFromString(buildPrintDocument({ source: host, profile: "oas-table", vars: VARS, generated: GENERATED }), "text/html");
    const table = doc.querySelector("table.summit-print-table") as HTMLTableElement;
    expect(table.querySelector(".oas-vue-column-filter-row")).toBeNull();
    expect(Array.from(table.querySelectorAll("tbody td")).map((td) => td.textContent)).toEqual(["Member A", "camping"]);
  });
});

describe("buildOasTablePrintMeta", () => {
  it("lists nothing without column filters", () => {
    expect(buildOasTablePrintMeta({})).toEqual([]);
  });

  it("uses the table's column names, in column order; Yes/No for Answered/Awarded; contains for text boxes", () => {
    expect(buildOasTablePrintMeta({ awarded: "false", stage: "3", memberName: "ann", answered: "true" })).toEqual([
      { label: "Member", value: 'contains "ann"' },
      { label: "Stage", value: "3" },
      { label: "Answered", value: "Yes" },
      { label: "Awarded", value: "No" },
    ]);
  });
});

describe("OASProgressionTableVue.prepareForPrint", () => {
  it("shows every row on one page, then restores the user's paging", async () => {
    const prepareForPrint = (OASProgressionTableVue as unknown as { methods: { prepareForPrint(this: unknown): Promise<() => void> } }).methods.prepareForPrint;
    const ctx = { itemsPerPage: 50, page: 4, $nextTick: jest.fn(async () => undefined) };

    const restore = await prepareForPrint.call(ctx);
    expect(ctx).toMatchObject({ itemsPerPage: -1, page: 1 });
    expect(ctx.$nextTick).toHaveBeenCalled();

    restore();
    expect(ctx).toMatchObject({ itemsPerPage: 50, page: 4 });
  });
});
