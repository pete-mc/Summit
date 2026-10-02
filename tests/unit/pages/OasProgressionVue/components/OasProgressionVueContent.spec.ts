// The content component's .vue sibling imports several child .vue files, which Jest cannot parse
// (vue-loader only merges template + external script at webpack build time). Stub them so the
// options object under test can be required — each child is covered by its own logic tests. See
// tests/unit/pages/PresentAwardsVue/PresentAwardsVueContent.spec.ts for the same pattern.
jest.mock("@/pages/OasProgressionVue/components/OASHeatMapVue.vue", () => ({ __esModule: true, default: { name: "OASHeatMapVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASProgressionFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASProgressionTableVue.vue", () => ({ __esModule: true, default: { name: "OASProgressionTableVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASWorksheetFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASWorksheetFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASWorksheetsVue.vue", () => ({ __esModule: true, default: { name: "OASWorksheetsVue", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitLoadingState.vue", () => ({ __esModule: true, default: { name: "SummitLoadingState", render: () => null } }), { virtual: true });

// gridExport's top-level jsPDF/xlsx imports are ESM that Jest cannot parse — mocked here the same
// way PresentAwardsVueContent.spec.ts does, since nothing in this spec exercises export behaviour.
jest.mock("@/components/gridExport", () => ({
  __esModule: true,
  exportElementToPdf: jest.fn(),
  exportGridToExcel: jest.fn(),
  exportGridToPdf: jest.fn(),
}));

import OasProgressionVueContent, { sanitiseViewMode } from "@/pages/OasProgressionVue/components/OasProgressionVueContent";
import { saveOASProgressionVueFilters, type OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

// Mirrors the component's own private DEFAULT_FILTERS shape, needed here only to build a
// realistic "stored" filter object for the persistence round-trip tests below.
function makeStoredFilters(overrides: Partial<OASProgressionVueFilterState> = {}): OASProgressionVueFilterState {
  return {
    viewMode: "heatmap",
    groupBy: "skill",
    memberFilter: "",
    hideLastName: false,
    useCodenames: false,
    selectedPatrols: [],
    breakByPatrol: false,
    hideEmptyStreams: false,
    hideEmptyTopColumns: false,
    onlyInProgress: false,
    hideAnswered: false,
    visibleStreams: ["bushcraft"],
    stageRange: [1, 9],
    sortBy: "firstName",
    worksheetVisibleSkills: ["bushcraft"],
    worksheetStageRange: [1, 9],
    worksheetHideLastName: false,
    worksheetUseCodenames: false,
    worksheetBreakByPatrol: false,
    worksheetHideCompleted: false,
    worksheetLayout: "membersAsColumns",
    ...overrides,
  };
}

// The component options object's `data()` is what actually calls loadInitialFilters() — invoking
// it directly here exercises that load path without mounting the component.
function loadFiltersViaComponentData(): OASProgressionVueFilterState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (OasProgressionVueContent as any).data();
  return data.filters as OASProgressionVueFilterState;
}

describe("sanitiseViewMode", () => {
  it("passes through a recognised viewMode unchanged", () => {
    expect(sanitiseViewMode("table")).toBe("table");
    expect(sanitiseViewMode("heatmap")).toBe("heatmap");
    expect(sanitiseViewMode("worksheets")).toBe("worksheets");
  });

  it("falls back to heatmap for an unrecognised value", () => {
    expect(sanitiseViewMode("bogus")).toBe("heatmap");
    expect(sanitiseViewMode(undefined)).toBe("heatmap");
    expect(sanitiseViewMode(null)).toBe("heatmap");
  });
});

describe("OasProgressionVueContent view mode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads a persisted table viewMode on startup", () => {
    saveOASProgressionVueFilters(makeStoredFilters({ viewMode: "table" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("table");
  });

  it("loads a persisted worksheets viewMode on startup", () => {
    saveOASProgressionVueFilters(makeStoredFilters({ viewMode: "worksheets" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("worksheets");
  });

  it("sanitises a present-but-invalid persisted viewMode back to heatmap rather than selecting nothing", () => {
    saveOASProgressionVueFilters(makeStoredFilters({ viewMode: "bogus" as OASProgressionVueFilterState["viewMode"] }));

    expect(loadFiltersViaComponentData().viewMode).toBe("heatmap");
  });

  it("onViewModeTabChange stores the tab's own value string, not an index", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressionVueContent as any).methods;
    const context = { filters: makeStoredFilters({ viewMode: "heatmap" }) };

    methods.onViewModeTabChange.call(context, "table");

    expect(context.filters.viewMode).toBe("table");
  });

  it("onResetFilters leaves viewMode untouched", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressionVueContent as any).methods;
    const context = { filters: makeStoredFilters({ viewMode: "table", memberFilter: "someone" }) };

    methods.onResetFilters.call(context);

    expect(context.filters.viewMode).toBe("table");
    expect(context.filters.memberFilter).toBe("");
  });

  it("onResetFilters resets worksheet* keys too, since one shared reset covers the whole filter object", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressionVueContent as any).methods;
    const context = {
      filters: makeStoredFilters({
        viewMode: "worksheets",
        worksheetVisibleSkills: ["camping"],
        worksheetStageRange: [3, 5] as [number, number],
        worksheetHideCompleted: true,
      }),
    };

    methods.onResetFilters.call(context);

    expect(context.filters.viewMode).toBe("worksheets");
    expect(context.filters.worksheetVisibleSkills.length).toBeGreaterThan(1);
    expect(context.filters.worksheetStageRange).toEqual([1, 9]);
    expect(context.filters.worksheetHideCompleted).toBe(false);
  });
});
