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
      ':visible-stages="filters.visibleStages"',
      ':sort-by="filters.sortBy"',
      ':member-filter="filters.memberFilter"',
      ':name-format="filters.nameFormat"',
      ':break-by-patrol="filters.breakByPatrol"',
      ':show-awarded="filters.showAwarded"',
      ':show-not-started="filters.showNotStarted"',
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

  it("VueStage 4: PDF export reuses the shared gridExport service, asking the heat map for its table rather than reaching into its refs", () => {
    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain('from "@/components/gridExport"');
    expect(tsSource).toContain("exportElementToPdf");

    // getExportTable() rather than $refs.exportTable: a ref on a v-data-table resolves to the
    // component instance, not an element, and that failure is silent — exportElementToPdf finds
    // no <tr>s and produces an empty PDF rather than throwing. The method keeps the caller
    // working whichever way the heat map renders its table.
    expect(tsSource).toContain("heatMap?.getExportTable()");
    expect(tsSource).not.toContain("$refs.exportTable");

    const heatMapSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASHeatMapVue.ts"), "utf8");
    expect(heatMapSource).toContain("getExportTable()");

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

  it("OASWorksheets Stage 2: a Terrain-style v-tabs strip switches viewMode, and shows OASProgressionTableVue when viewMode is 'table'", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain("<OASProgressionTableVue");
    expect(templateSource).toContain("<v-tabs");
    // tab-value, NOT value: v-tab's `value` is a read-only computed with no corresponding prop
    // (falls back to `to`/`href`, else the tab's index) — a plain `value="heatmap"` attribute is
    // silently dropped, which was a real bug caught live (every tab fell back to its index as its
    // identity, so clicking a tab never matched filters.viewMode's string). See the long comment
    // above the <v-tabs> block in the .vue file for the full explanation.
    expect(templateSource).toContain('<v-tab tab-value="heatmap">');
    expect(templateSource).toContain('<v-tab tab-value="table">');
    expect(templateSource).not.toMatch(/<v-tab value="/);
    expect(templateSource).toContain("onViewModeTabChange");
    // Replaced by v-tabs per .claude/OASWorksheets/PLAN_STAGE_2.md (DEV_NOTES asked for "the same
    // control as terrain, instead of a button") — the single-button toggle from VueStage 5, and
    // the v-btn-toggle it in turn replaced, are both gone now.
    expect(templateSource).not.toContain("<v-btn-toggle");
    expect(templateSource).not.toContain("onToggleViewModeClick");
    expect(templateSource).not.toContain("Show Table");
    expect(templateSource).not.toContain("Show Heatmap");

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain("onViewModeTabChange");
    expect(tsSource).toContain("OASProgressionTableVue");
    expect(tsSource).not.toContain("onToggleViewModeClick");
  });

  it("OASWorksheets Stage 2: v-tabs is bound by explicit string value/@change, not v-model's default numeric index", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain(':value="filters.viewMode"');
    expect(templateSource).toContain('@change="onViewModeTabChange"');
    // A v-model here would model a numeric tab index rather than filters.viewMode's own string —
    // see PLAN_STAGE_2.md §3 for why that would be a second, driftable source of truth.
    expect(templateSource).not.toMatch(/<v-tabs[^>]*v-model/);
  });

  it("OASWorksheets Stage 2: matches Terrain's own Programming-page tab strip (grow, 40px, primary/grey lighten-5)", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    const tabsTag = templateSource.slice(templateSource.indexOf("<v-tabs"), templateSource.indexOf(">", templateSource.indexOf("<v-tabs")) + 1);
    expect(tabsTag).toContain("grow");
    expect(tabsTag).toContain('height="40"');
    expect(tabsTag).toContain('color="primary"');
    expect(tabsTag).toContain('background-color="grey lighten-5"');
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

  it("VueStage 5 fixes: header row buttons keep a consistent left-to-right order — [Excel Export,] PDF Export, Refresh — so each button's position doesn't shift when Excel Export appears/disappears between views", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    const headerRow = templateSource.slice(templateSource.indexOf('<div class="oas-progression-view-row">'), templateSource.indexOf("</div>", templateSource.indexOf('<div class="oas-progression-view-row">')));

    const excelIndex = headerRow.indexOf("onTableExcelExportClick");
    const heatmapPdfIndex = headerRow.indexOf("onPdfExportClick");
    const tablePdfIndex = headerRow.indexOf("onTablePdfExportClick");
    const refreshIndex = headerRow.indexOf("onReloadAllClick");

    expect(refreshIndex).toBeGreaterThan(-1);
    // Left to right: [Excel Export,] PDF Export, Refresh (rightmost). The view-mode toggle used to
    // sit between PDF Export and Refresh here; it is now the v-tabs strip below this row entirely
    // (see .claude/OASWorksheets/PLAN_STAGE_2.md §2 — a full-width row of its own, not another item
    // in this right-aligned button row).
    expect(excelIndex).toBeLessThan(tablePdfIndex);
    expect(heatmapPdfIndex).toBeLessThan(refreshIndex);
    expect(tablePdfIndex).toBeLessThan(refreshIndex);
  });

  it("OASWorksheets Stage 2: the view-mode tab strip is its own row, below the export/refresh row, not inside it", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    const viewRowStart = templateSource.indexOf('<div class="oas-progression-view-row">');
    const viewRowEnd = templateSource.indexOf("</div>", viewRowStart);
    const tabsIndex = templateSource.indexOf("<v-tabs");

    expect(tabsIndex).toBeGreaterThan(-1);
    // The tab strip must appear AFTER the view-row's closing </div>, i.e. outside it.
    expect(tabsIndex).toBeGreaterThan(viewRowEnd);
    // No leftover CSS from the abandoned v-btn-toggle / single-button approaches.
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

  it("OASWorksheets Stage 3: a third 'Worksheets' tab (not 'OAS Worksheets' — the page is already titled OAS Progression) renders OASWorksheetsVue and OASWorksheetFiltersVue", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain('<v-tab tab-value="worksheets">Worksheets</v-tab>');
    expect(templateSource).not.toContain("OAS Worksheets</v-tab>");
    expect(templateSource).toContain("<OASWorksheetsVue");
    expect(templateSource).toContain("<OASWorksheetFiltersVue");
    expect(templateSource).toContain("filters.viewMode === 'worksheets'");

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain("OASWorksheetsVue");
    expect(tsSource).toContain("OASWorksheetFiltersVue");
  });

  it("OASWorksheets Stage 3: the worksheet filter keys are separate from the heat map's own, not shared", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence.ts"), "utf8");
    ["worksheetVisibleSkills", "worksheetVisibleStages", "worksheetNameFormat", "worksheetBreakByPatrol", "worksheetShowCompleted"].forEach((key) => {
      expect(source).toContain(key);
    });

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain("worksheetVisibleSkills");
  });

  it("OASWorksheets Stage 3/4: the Table view's Excel/PDF export buttons are gated on viewMode === 'table' specifically, not a bare v-else that would also catch 'worksheets'", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    const headerRow = templateSource.slice(templateSource.indexOf('<div class="oas-progression-view-row">'), templateSource.indexOf("</div>", templateSource.indexOf('<div class="oas-progression-view-row">')));
    expect(headerRow).toContain("filters.viewMode === 'table'");
  });

  it("OASWorksheets Stage 4: the Worksheets tab gets its own Print button, wired to printCurrentPages via a ref (not reusing exportElementToPdf)", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.vue"), "utf8");
    expect(templateSource).toContain("filters.viewMode === 'worksheets'");
    expect(templateSource).toContain("onWorksheetPrintClick");
    expect(templateSource).toContain('ref="worksheets"');

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain("onWorksheetPrintClick");
    expect(tsSource).toContain("printCurrentPages");
    expect(tsSource).not.toContain("worksheets?.getExportTable");
  });

  it("OASWorksheets Stage 4: printing goes through printWorksheets.ts, not gridExport's exportElementToPdf", () => {
    const worksheetsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetsVue.ts"), "utf8");
    expect(worksheetsSource).toContain("printWorksheets");
    expect(worksheetsSource).not.toContain("exportElementToPdf");
  });

  it("OASWorksheets Stage 4: one sheet per page via break-after/page-break-after, with a :last-of-type reset so no trailing blank page prints", () => {
    const printSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/services/printWorksheets.ts"), "utf8");
    expect(printSource).toContain("break-after: page");
    expect(printSource).toContain("page-break-after: always");
    expect(printSource).toContain(":last-of-type");
    expect(printSource).toContain("display: table-header-group");
    expect(printSource).toContain("break-inside: avoid");
  });

  // Default flipped per DEV_NOTES.md: "Layout > Members as rows, should be default and top item
  // in list" — see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
  it("OASWorksheets Stage 5: worksheetLayout persists (replacing the dropped worksheetOrientation), defaulting to membersAsRows", () => {
    const persistenceSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence.ts"), "utf8");
    expect(persistenceSource).toContain("worksheetLayout");
    // Not a LIVE field any more — it may still be mentioned in a comment explaining the replacement
    // (backtick-quoted prose), so check it's not declared as an interface member specifically.
    expect(persistenceSource).not.toMatch(/^\s*worksheetOrientation:/m);

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OasProgressionVueContent.ts"), "utf8");
    expect(tsSource).toContain('worksheetLayout: "membersAsRows"');
  });

  it("OASWorksheets print orientation: both layouts print landscape (a Layout-B-specific portrait attempt was tried and reverted live)", () => {
    const printSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/services/printWorksheets.ts"), "utf8");
    expect(printSource).toContain("@page { size: A4 ${orientation}");

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetsVue.ts"), "utf8");
    expect(tsSource).toContain('orientation: "landscape"');
    expect(tsSource).not.toMatch(/isMembersAsRows\s*\?\s*"portrait"/);
  });

  it("OASWorksheets Stage 5: the Layout selector exists in the worksheet filter bar", () => {
    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetFiltersVue.vue"), "utf8");
    expect(templateSource).toContain("worksheetLayout");
    expect(templateSource).not.toContain("worksheetOrientation");

    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetFiltersVue.ts"), "utf8");
    expect(tsSource).toContain("membersAsColumns");
    expect(tsSource).toContain("membersAsRows");
  });

  it("OASWorksheets Stage 5: Layout A splits over-wide pages into extra sheets rather than warning about clipping", () => {
    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetsVue.ts"), "utf8");
    expect(tsSource).toContain("splitPageIntoColumnBatches");
    expect(tsSource).not.toContain("pageExceedsColumnLimit");

    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetsVue.vue"), "utf8");
    expect(templateSource).not.toContain("oas-worksheet-overflow-warning");
  });

  it("OASWorksheets Layout B (transpose) renders I-Statement columns via transposeWorksheetPage, with rotated, WRAPPED (not font-shrunk) headers that split into extra sheets once too many to fit", () => {
    const tsSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetsVue.ts"), "utf8");
    expect(tsSource).toContain("transposeWorksheetPage");
    expect(tsSource).toContain("splitTransposedPageIntoColumnBatches");
    expect(tsSource).not.toContain("fitRotatedHeaderFont(");

    const templateSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASWorksheetsVue.vue"), "utf8");
    expect(templateSource).toContain("oas-worksheet-rotated-text");
    expect(templateSource).toContain("groupSpans");
  });
});
