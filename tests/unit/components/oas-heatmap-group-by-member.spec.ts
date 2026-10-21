import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const HEAT_MAP = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASHeatMapVue.vue"), "utf8");
const FILTERS = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue"), "utf8");
const FILTERS_TS = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionFiltersVue.ts"), "utf8");
const PRINT_PROFILE = fs.readFileSync(path.resolve(REPO_ROOT, "src/print/profiles/skillHeatmap.ts"), "utf8");

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
    // Grouped by member, the icon moves to the rows, or skills become unidentifiable.
    const memberBranch = HEAT_MAP.slice(HEAT_MAP.indexOf(`v-if="isGroupedByMember"`), HEAT_MAP.indexOf("v-else #body"));
    expect(memberBranch).toContain("row.iconUrl");
    expect(memberBranch).toContain("oas-heatmap-skill-icon");
  });

  it("reuses the section heading class the printout keeps with its rows", () => {
    // summit-print's skill-heatmap profile keeps .oas-heatmap-skill-title-row with the row beneath
    // it (break-after: avoid). The member-grouped heading reuses that class, so printing works
    // unchanged in both group modes.
    const memberBranch = HEAT_MAP.slice(HEAT_MAP.indexOf(`v-if="isGroupedByMember"`), HEAT_MAP.indexOf("v-else #body"));
    expect(memberBranch).toContain("oas-heatmap-skill-title-row");
    expect(PRINT_PROFILE).toContain("tr.oas-heatmap-skill-title-row");
  });

  it("shows the member's patrol beside their name rather than as a divider", () => {
    // A member belongs to one patrol, so there is nothing for a divider to divide.
    expect(HEAT_MAP).toContain("oas-heatmap-member-patrol");
  });
});

describe("OAS table view — deliberately not grouped", () => {
  const TABLE = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");

  it("stays flat", () => {
    // Table grouping was deliberately removed; re-adding it is a design decision.
    expect(TABLE).not.toContain(":group-by=");
    expect(TABLE).not.toContain("#group.header");
  });

  it("builds its filter row from the plain header list", () => {
    // With no grouping there is no dropped column, so renderedHeaders has nothing to mirror.
    expect(TABLE).toContain('v-for="header in headers"');
  });
});

describe("OAS filters — the Group by control", () => {
  it("offers Skill and Member as exclusive options", () => {
    expect(FILTERS).toContain('label="Group by"');
    expect(FILTERS).toContain("groupByOptions");
  });

  it("hides the Break-by-patrol Show-dropdown item when grouped by member", () => {
    // An inert control is worse than none.
    expect(FILTERS_TS).toContain(`filters.groupBy !== "member"`);
  });
});
