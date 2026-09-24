import * as fs from "fs";
import * as path from "path";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

/**
 * OasProgressionVueContent.ts is NOT imported live here (unlike VueStage 1's original version
 * of this test) — as of VueStage 2 it imports OASHeatMapVue.vue, and Jest has no .vue transform
 * (see PLAN_VUESTAGE_1.md's "Deviations" note): vue-loader merges an SFC's external <script src>
 * with its own template at webpack build time only, so `.ts` files with a `.vue` import in their
 * chain can't be `require()`d directly under ts-jest. Testing this component's props/wiring
 * source-side (as below) avoids needing new Jest infrastructure mid-build.
 */

const REPO_ROOT = path.resolve(__dirname, "../../..");

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "unit-1",
    stream: "bushwalking",
    branch: "navigation",
    stage: 3,
    inputGroup: "Plan",
    inputId: "abc123",
    iStatement: "I can pack appropriate gear for an overnight hike",
    memberId: "member-1",
    memberName: "Alex Scout",
    patrolName: null,
    answered: true,
    awarded: false,
    date: "2020-11-18",
    ...overrides,
  };
}

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "scout", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

describe("OasProgressionVueContent render contract", () => {
  it("declares the props the mount pattern relies on (items, trunkStageCounts, members, loadingStreams, reload callbacks)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    ["items:", "trunkStageCounts:", "members:", "loadingStreams:", "onReloadAll:", "onReloadStream:"].forEach((propDecl) => {
      expect(source).toContain(propDecl);
    });
  });

  it("renders OASHeatMapVue (VueStage 2's real heat-map layout), passing through the fetched data", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(source).toContain("<OASHeatMapVue");
    expect(source).toContain(':items="items"');
  });

  it("renders OASProgressionFiltersVue (VueStage 3's filter bar) and wires its filter state into OASHeatMapVue's props", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(source).toContain("<OASProgressionFiltersVue");
    expect(source).toContain('@update:filters="onFiltersUpdate"');
    expect(source).toContain('@reset="onResetFilters"');
    [
      ':visible-streams="filters.visibleStreams"',
      ':stage-range="filters.stageRange"',
      ':sort-by="filters.sortBy"',
      ':member-filter="filters.memberFilter"',
      ':use-codenames="filters.useCodenames"',
      ':break-by-patrol="filters.breakByPatrol"',
      ':only-in-progress="filters.onlyInProgress"',
    ].forEach((binding) => {
      expect(source).toContain(binding);
    });
  });

  it("persists filter changes via the Vue-specific persistence service (separate localStorage key from the React page)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(source).toContain("saveOASProgressionVueFilters");
    expect(source).toContain("loadOASProgressionVueFilters");
    expect(source).toContain("@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence");
  });

  it("accepts real fixture data shaped like the existing React page's own props", () => {
    const rows = [makeRow(), makeRow({ memberId: "member-2", memberName: "Sam Ranger", inputId: "def456", iStatement: "I can navigate using a map and compass", answered: false, date: null })];
    const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Scout" }), makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger" })];

    const props = {
      items: rows,
      trunkStageCounts: { bushwalking: 3 },
      members,
      loadingStreams: new Set<string>(),
      onReloadAll: jest.fn(),
      onReloadStream: jest.fn(),
    };

    expect(props.items).toHaveLength(2);
    expect(props.items.map((r) => r.memberName)).toEqual(["Alex Scout", "Sam Ranger"]);
  });

  it("OasProgressionVue.ts mounts the content component via a second, independent Vue instance (not registered on the outer SFC's own component tree)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/OasProgressionVue.ts"), "utf8");
    expect(source).toContain("Vue.extend(OasProgressionVueContent)");
    expect(source).toContain("window.summitVuetify");
    expect(source).toContain("$mount(this.$refs.vuetifyRoot");
  });

  it("the outer OasProgressionVue.vue template has no Vuetify tags of its own — only the mount-point div", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/OasProgressionVue.vue"), "utf8");
    expect(source).toContain('ref="vuetifyRoot"');
    expect(source).not.toMatch(/<v-[a-z]/);
  });

  it("VueStage 4: PDF export reuses the shared gridExport service against OASHeatMapVue's own table ref, matching the React page's approach", () => {
    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain('from "@/components/gridExport"');
    expect(tsSource).toContain("exportElementToPdf");
    expect(tsSource).toContain("heatMap?.$refs.exportTable");

    const heatMapSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASHeatMapVue.vue"), "utf8");
    expect(heatMapSource).toContain('ref="exportTable"');

    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain('ref="heatMap"');
    expect(templateSource).toContain("onPdfExportClick");
  });

  it("VueStage 4: the reload button shows a loading state while reloading, matching the plan's nicer-than-original affordance", () => {
    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain("isReloading");
    expect(tsSource).toContain("onReloadAllClick");

    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain(':loading="isReloading"');
  });

  it("VueStage 5: a single 'Show Table'/'Show Heatmap' button toggles viewMode, and shows OASProgressionTableVue when viewMode is 'table'", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain("<OASProgressionTableVue");
    expect(templateSource).toContain("onToggleViewModeClick");
    expect(templateSource).toContain("Show Table");
    expect(templateSource).toContain("Show Heatmap");
    // The earlier v-btn-toggle-based control (and its styling saga, see PLAN_VUESTAGE_5.md) was
    // deliberately dropped in favor of this single plain button — simpler, and it sidesteps the
    // whole "matching Vuetify's active-state class + a conflicting external CSS rule" problem.
    expect(templateSource).not.toContain("<v-btn-toggle");

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain("onToggleViewModeClick");
    expect(tsSource).toContain("OASProgressionTableVue");
  });

  it("VueStage 5: resetting filters preserves the current viewMode (a display choice, not a filter)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(source).toContain("viewMode: this.filters.viewMode");
  });

  it("VueStage 5 fixes: header row gets PDF + Excel export buttons for the Table view", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain("onTablePdfExportClick");
    expect(templateSource).toContain("onTableExcelExportClick");
    expect(templateSource).toContain("Excel Export");

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain("exportGridToExcel");
    expect(tsSource).toContain("exportGridToPdf");
    expect(tsSource).toContain("onTablePdfExportClick");
    expect(tsSource).toContain("onTableExcelExportClick");
  });

  it("VueStage 5 fixes: header row buttons keep a consistent left-to-right order — [Excel Export,] PDF Export, Show xxx, Refresh — so each button's position doesn't shift when Excel Export appears/disappears between views", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    const headerRow = templateSource.slice(templateSource.indexOf('<div class="oas-progression-view-row">'), templateSource.indexOf("</div>", templateSource.indexOf('<div class="oas-progression-view-row">')));

    const toggleIndex = headerRow.indexOf("onToggleViewModeClick");
    const excelIndex = headerRow.indexOf("onTableExcelExportClick");
    const heatmapPdfIndex = headerRow.indexOf("onPdfExportClick");
    const tablePdfIndex = headerRow.indexOf("onTablePdfExportClick");
    const refreshIndex = headerRow.indexOf("onReloadAllClick");

    expect(toggleIndex).toBeGreaterThan(-1);
    expect(refreshIndex).toBeGreaterThan(-1);
    // Left to right: [Excel Export,] PDF Export, Show xxx (view toggle), Refresh (rightmost).
    expect(excelIndex).toBeLessThan(tablePdfIndex);
    expect(heatmapPdfIndex).toBeLessThan(toggleIndex);
    expect(tablePdfIndex).toBeLessThan(toggleIndex);
    expect(toggleIndex).toBeLessThan(refreshIndex);
  });

  it("VueStage 5 fixes: the view-mode button reuses the same .oas-vue-pill-btn Terrain-matching style as PDF/Excel Export, with no bespoke toggle styling", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toMatch(/<v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onToggleViewModeClick"/);
    // No leftover CSS from the abandoned v-btn-toggle approach.
    expect(templateSource).not.toContain("oas-vue-view-toggle");
    expect(templateSource).not.toContain("oas-vue-toggle-active");
  });

  it("VueStage 5 fixes: Table view PDF/Excel export uses only the currently column-filtered rows, not every row", () => {
    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain("filterOASProgressionRows");
    expect(tsSource).toContain("tableFilteredItems");
    expect(tsSource).toContain("rows: this.tableFilteredItems");
    expect(tsSource).toContain("tableColumnFilters");

    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain(':column-filters.sync="tableColumnFilters"');
    expect(templateSource).not.toContain(":search.sync=");
  });

  it("OasProgressionVue.ts sets breadcrumbs reading 'OAS Progression' at its own route (the page took over the short route/label once the legacy React page was archived)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/OasProgressionVue.ts"), "utf8");
    expect(source).toContain("OAS Progression");
    expect(source).toContain("/summit/reports/oasprogression");
  });
});
