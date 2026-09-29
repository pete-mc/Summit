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

describe("OAS table view — deliberately not grouped", () => {
  const TABLE = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionTableVue.vue"), "utf8");

  it("stays flat", () => {
    // Table grouping was built and then removed: how it should behave alongside this view's own
    // sorting and per-column filters needs more thought than it had. Re-adding it is a deliberate
    // decision, not a tidy-up — see PLAN_GROUP_BY_MEMBER.md.
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

  it("hides the patrol divider checkbox when grouped by member", () => {
    // Leaving an inert control on screen is worse than removing it.
    expect(FILTERS).toContain(`filters.groupBy !== 'member'`);
  });
});
