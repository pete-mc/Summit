import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const HEAT_MAP = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASHeatMapVue.vue"), "utf8");
const FILTERS = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue"), "utf8");
const EXPORT = fs.readFileSync(path.resolve(REPO_ROOT, "src/components/gridExport.ts"), "utf8");

describe("OAS heat map — group by Skill or Member", () => {
  it("renders a member-first body when grouped by member", () => {
    expect(HEAT_MAP).toContain(`v-if="isGroupedByMember"`);
    expect(HEAT_MAP).toContain("memberSections");
  });

  it("keeps the skill-first body as the other branch", () => {
    expect(HEAT_MAP).toContain("v-else #body");
    expect(HEAT_MAP).toContain("section in sections");
  });

  it("relabels the first column to whatever is not the section heading", () => {
    // Member names under a skill heading; skill names under a member heading.
    expect(HEAT_MAP).toContain(`isGroupedByMember ? "Skill" : "Member"`);
  });

  it("moves the skill icon onto the row when the heading is a person", () => {
    // Per the DEV_NOTES entry: group by skill keeps the icon on the heading, group by member does
    // not — so it has to appear on the rows instead, or the skills become unidentifiable at a
    // glance.
    const memberBranch = HEAT_MAP.slice(HEAT_MAP.indexOf(`v-if="isGroupedByMember"`), HEAT_MAP.indexOf("v-else #body"));
    expect(memberBranch).toContain("row.iconUrl");
    expect(memberBranch).toContain("oas-heatmap-skill-icon");
  });

  it("reuses the section heading class the PDF export paginates on", () => {
    // exportElementToPdf breaks pages on SECTION_HEADING_ROW_SELECTOR. The member-grouped heading
    // reuses .oas-heatmap-skill-title-row precisely so the export keeps working unchanged.
    const memberBranch = HEAT_MAP.slice(HEAT_MAP.indexOf(`v-if="isGroupedByMember"`), HEAT_MAP.indexOf("v-else #body"));
    expect(memberBranch).toContain("oas-heatmap-skill-title-row");
    expect(EXPORT).toContain(".oas-heatmap-skill-title-row");
  });

  it("shows the member's patrol beside their name rather than as a divider", () => {
    // A member belongs to one patrol, so there is nothing for a divider to divide.
    expect(HEAT_MAP).toContain("oas-heatmap-member-patrol");
  });
});

describe("OAS table view — grouping", () => {
  const TABLE = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");
  const TABLE_TS = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.ts"), "utf8");

  it("maps the shared setting onto this table's own column names", () => {
    expect(TABLE_TS).toContain('if (this.groupBy === "member") return ["memberName"]');
    expect(TABLE_TS).toContain('if (this.groupBy === "skill") return ["stream"]');
  });

  it("leaves the table flat for any other value", () => {
    expect(TABLE_TS).toContain("return [];");
  });

  it("builds the filter row from the rendered headers, not the raw ones", () => {
    // Vuetify drops the grouped column from its own header row, so iterating `headers` emits one
    // <th> too many and shifts every filter box left — the same bug already fixed in Present
    // Awards.
    expect(TABLE).toContain('v-for="header in renderedHeaders"');
    expect(TABLE_TS).toContain("this.headers.filter((header) => !this.groupByFields.includes(header.value))");
  });

  it("sizes the group heading to the rendered header count", () => {
    expect(TABLE).toContain(':colspan="renderedHeaders.length"');
  });

  it("uses a custom group header without Vuetify's remove-grouping button", () => {
    // That button clears groupBy directly, which would leave the page's own Group by control
    // saying one thing while the table does another.
    expect(TABLE).toContain("#group.header");
    expect(TABLE).toContain("mdi-chevron-down");
  });

  it("shows no count in the group heading", () => {
    // Unlike Present Awards, which counts outstanding awards because that is the task there.
    const headerSlot = TABLE.slice(TABLE.indexOf("#group.header"), TABLE.indexOf("#body.prepend"));
    expect(headerSlot).toContain("{{ group }}");
    expect(headerSlot).not.toMatch(/\(\{\{.*length/);
  });
});

describe("OAS filters — the Group by control", () => {
  it("offers Skill and Member as exclusive options", () => {
    expect(FILTERS).toContain('label="Group by"');
    expect(FILTERS).toContain("groupByOptions");
  });

  it("hides the patrol divider checkbox when grouped by member", () => {
    // Leaving an inert control on screen is worse than removing it.
    expect(FILTERS).toContain(`filters.groupBy !== 'member'`);
  });
});
