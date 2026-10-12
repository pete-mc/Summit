import { buildPrintDocument, getPrintProfile, resolveHeaderFooter } from "@/print/summitPrint";
import { buildPresentAwardsPrintMeta } from "@/pages/PresentAwardsVue/services/presentAwardsPrintMeta";
import PresentAwardsTableVue, { HEADERS, PRESENT_CELL_CLASS, PRESENT_HEADER_CLASS } from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";
import { BASE_PRINT_CSS } from "@/print/printStyles";
import fs from "fs";
import path from "path";

const VARS = { unit: "Example Scout Unit", group: "1st Example Group", section: "Scouts" };
const GENERATED = new Date(2026, 9, 11, 10, 0);

/**
 * Shaped like PresentAwardsTableVue's render with "Group by member" on: Name moved into the group
 * header, the in-table filter row, chevron toggles, the Present tick-box column. Invented content
 * (.claude/Print/PLAN.md I12).
 */
function mountGroupedAwards(): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = `
<div class="present-awards-table-panel"><div class="v-data-table present-awards-data-table"><div class="v-data-table__wrapper">
  <table>
    <thead><tr>
      <th class="text-start">Type</th><th class="text-start">Award</th><th class="text-start">Date</th><th class="text-start">Presented</th>
      <th class="text-start ${PRESENT_HEADER_CLASS}">Present</th>
    </tr></thead>
    <tbody>
      <tr class="oas-vue-column-filter-row"><th><input></th><th><input></th><th><input></th><th><input></th><th></th></tr>
      <tr class="v-row-group__header"><td colspan="5" class="present-awards-group-header">
        <button class="v-btn present-awards-group-toggle"><i class="mdi-chevron-down"></i></button>
        <span class="present-awards-group-label">Member A (1 not presented)</span>
      </td></tr>
      <tr>
        <td>OAS</td>
        <td><span class="present-awards-award"><span class="present-awards-badge-slot"><img class="present-awards-badge-icon" src="chrome-extension://abc/images/oas.png" alt=""></span><span class="present-awards-award-name">Camping Stage 2</span></span></td>
        <td>01/09/2026</td><td>No</td>
        <td class="${PRESENT_CELL_CLASS}"><div class="v-simple-checkbox"></div></td>
      </tr>
    </tbody>
  </table>
</div></div></div>`;
  document.body.appendChild(host);
  return host;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("present-awards profile", () => {
  it("uses the user's choices: 'Present Awards', A4 portrait, Member-only repeat, no meta beyond Generated", () => {
    const profile = getPrintProfile("present-awards");
    expect(profile.header.title).toBe("Present Awards");
    expect(profile.defaults).toMatchObject({ pageSize: "A4", orientation: "portrait", layout: "fit" });
    expect(profile.repeatColumns).toBe(1);
    const r = resolveHeaderFooter({ source: document.body, profile: "present-awards", vars: VARS, generated: GENERATED });
    expect(r.header.meta.map((m) => m.label)).toEqual(["Generated"]);
  });

  it("strips the filter row, the Present column and the chevrons, and keeps the badges", () => {
    const host = mountGroupedAwards();
    const doc = new DOMParser().parseFromString(buildPrintDocument({ source: host, profile: "present-awards", vars: VARS, generated: GENERATED }), "text/html");
    const table = doc.querySelector("table.summit-print-table") as HTMLTableElement;
    expect(table.querySelector(".oas-vue-column-filter-row")).toBeNull();
    expect(table.querySelectorAll(`.${PRESENT_HEADER_CLASS}, .${PRESENT_CELL_CLASS}`)).toHaveLength(0);
    expect(table.querySelector(".present-awards-group-toggle")).toBeNull();
    expect(table.querySelector(".present-awards-group-label")?.textContent).toBe("Member A (1 not presented)");
    expect(table.querySelector("img.present-awards-badge-icon")).not.toBeNull();
    // The group header now spans the 4 remaining columns, not the old 5.
    expect((table.querySelector("td.present-awards-group-header") as HTMLTableCellElement).colSpan).toBe(4);
    expect(table.querySelectorAll("thead th")).toHaveLength(4);
    // The live table is untouched.
    expect(host.querySelectorAll(`.${PRESENT_CELL_CLASS}`)).toHaveLength(1);
  });
});

describe("Present Awards columns (user, 2026-10-11/12)", () => {
  it("has no separate badge column — the badge is part of the Award cell", () => {
    expect(HEADERS.map((h) => h.value)).not.toContain("badge");
    expect(HEADERS.map((h) => h.text)).not.toContain("Badge");
  });

  it("has no separate 'Clear filters' link — the filter bar's Reset filters replaces it", () => {
    const template = fs.readFileSync(path.resolve(__dirname, "../../../src/pages/PresentAwardsVue/components/PresentAwardsTableVue.vue"), "utf8");
    expect(template).not.toContain("onClearFiltersClick");
    expect(template).not.toContain("oas-vue-clear-filters-row");
    const filters = fs.readFileSync(path.resolve(__dirname, "../../../src/pages/PresentAwardsVue/components/PresentAwardsFiltersVue.vue"), "utf8");
    const reset = filters.indexOf('@click="resetFilters">Reset filters</v-btn>');
    expect(reset).toBeGreaterThan(-1);
    // Last item INSIDE the Display group, so it sits to the right of the checkboxes like OAS's.
    expect(reset).toBeGreaterThan(filters.lastIndexOf("<v-checkbox"));
    expect(reset).toBeLessThan(filters.indexOf("</fieldset>"));
  });

  it("prints the badge and name on one line, badges in a fixed slot so the names line up", () => {
    const css = getPrintProfile("present-awards").css;
    expect(css).toMatch(/\.present-awards-award \{ display: flex; align-items: center; gap: 2\.1mm; \}/);
    expect(css).toMatch(/\.present-awards-badge-slot \{ flex: 0 0 10\.3mm;/);
  });
});

describe("right table edge (missing on A4 portrait / normal margins, 2026-10-11)", () => {
  it("insets every printed table so its outer border stays on the page", () => {
    expect(BASE_PRINT_CSS).toMatch(/table\.summit-print-table \{\s*width: calc\(100% - 1pt\);/);
  });
});

describe("buildPresentAwardsPrintMeta", () => {
  it("lists nothing when no column filter is set", () => {
    expect(buildPresentAwardsPrintMeta({})).toEqual([]);
    expect(buildPresentAwardsPrintMeta({ member: "  ", type: "" })).toEqual([]);
  });

  it("uses the table's own column names, in column order, worded per filter kind", () => {
    const meta = buildPresentAwardsPrintMeta({ presented: "no", achievementName: "camp", type: "OAS", member: "sam" });
    expect(meta).toEqual([
      { label: "Name", value: 'contains "sam"' },
      { label: "Type", value: "OAS" },
      { label: "Award", value: 'contains "camp"' },
      { label: "Presented", value: "No" },
    ]);
    expect(buildPresentAwardsPrintMeta({ presented: "presented" })).toEqual([{ label: "Presented", value: "Yes" }]);
  });
});

describe("PresentAwardsTableVue.prepareForPrint", () => {
  const prepareForPrint = (PresentAwardsTableVue as unknown as { methods: { prepareForPrint(this: unknown): Promise<() => void> } }).methods.prepareForPrint;

  function fakeTable(openCache: Record<string, boolean>) {
    const ctx = {
      itemsPerPage: 25,
      page: 3,
      $refs: { table: { openCache } },
      $nextTick: jest.fn(async () => {
        // Rendering every row registers groups from other pages, open by default (Vuetify behaviour).
        if (ctx.itemsPerPage === -1 && !("Member C" in openCache)) openCache["Member C"] = true;
      }),
      $set: (obj: Record<string, boolean>, key: string, value: boolean) => {
        obj[key] = value;
      },
    };
    return ctx;
  }

  it("shows every row on one page with every group open, then restores paging and collapsed groups", async () => {
    const openCache: Record<string, boolean> = { "Member A": true, "Member B": false };
    const ctx = fakeTable(openCache);

    const restore = await prepareForPrint.call(ctx);
    expect(ctx.itemsPerPage).toBe(-1);
    expect(ctx.page).toBe(1);
    expect(openCache).toEqual({ "Member A": true, "Member B": true, "Member C": true });

    restore();
    expect(ctx.itemsPerPage).toBe(25);
    expect(ctx.page).toBe(3);
    expect(openCache["Member B"]).toBe(false); // collapsed again
    expect(openCache["Member A"]).toBe(true);
  });
});
