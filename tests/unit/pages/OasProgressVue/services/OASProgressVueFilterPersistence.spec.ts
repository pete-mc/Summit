import { saveOASProgressVueFilters, loadOASProgressVueFilters, migrateRenamedFilters, type OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";

const STORAGE_KEY = "summit.oasProgressVue.filters";
const REACT_PAGE_STORAGE_KEY = "summit.oasProgress.filters";

function makeFilters(overrides: Partial<OASProgressVueFilterState> = {}): OASProgressVueFilterState {
  return {
    viewMode: "heatmap",
    groupBy: "skill",
    memberFilter: "",
    nameFormat: "full",
    selectedPatrols: [],
    breakByPatrol: false,
    showEmptySkillRows: true,
    showEmptyTopStages: true,
    showApproved: true,
    showNotStarted: true,
    showAnswered: true,
    visibleStreams: ["bushcraft", "bushwalking"],
    visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    sortBy: "firstName",
    stageGridSkillStream: "bushcraft::pioneering",
    stageGridVisibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    stageGridNameFormat: "full",
    stageGridSortBy: "firstName",
    stageGridBreakByPatrol: false,
    stageGridShowApproved: true,
    stageGridLayout: "membersAsColumns",
    ...overrides,
  };
}

describe("OASProgressVueFilterPersistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips filter state through localStorage", () => {
    const filters = makeFilters({ nameFormat: "first", selectedPatrols: ["Kookaburras"], visibleStages: [3, 4, 5, 6] });

    saveOASProgressVueFilters(filters);

    expect(loadOASProgressVueFilters()).toEqual(filters);
  });

  it("uses a separate storage key from the React OAS Progress page, so saved filters never collide", () => {
    saveOASProgressVueFilters(makeFilters({ memberFilter: "vue page" }));
    window.localStorage.setItem(REACT_PAGE_STORAGE_KEY, JSON.stringify({ ...makeFilters(), viewMode: "heatmap", memberFilter: "react page" }));

    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(loadOASProgressVueFilters()?.memberFilter).toBe("vue page");
  });

  it("returns null when nothing has been saved", () => {
    expect(loadOASProgressVueFilters()).toBeNull();
  });

  it("returns null when stored value is malformed JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadOASProgressVueFilters()).toBeNull();
  });

  it("returns null when stored value is not an object", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify("just a string"));
    expect(loadOASProgressVueFilters()).toBeNull();
  });

  it("is resilient when localStorage throws on write", () => {
    const spy = jest.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() => saveOASProgressVueFilters(makeFilters())).not.toThrow();

    spy.mockRestore();
  });

  it("is resilient when localStorage throws on read", () => {
    const spy = jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation(() => {
      throw new Error("access denied");
    });

    expect(loadOASProgressVueFilters()).toBeNull();

    spy.mockRestore();
  });
});

describe("migrateRenamedFilters", () => {
  it("moves the old table* / worksheet* keys and tab names to Next Steps / Stage Grid", () => {
    expect(migrateRenamedFilters({ viewMode: "worksheets", worksheetStage: 3, tableMemberId: "m1", worksheetLayout: "membersAsRows", summarySortBy: "lastName" })).toEqual({
      viewMode: "stageGrid",
      stageGridStage: 3,
      nextStepsMemberId: "m1",
      stageGridLayout: "membersAsRows",
      summarySortBy: "lastName",
    });
    expect(migrateRenamedFilters({ viewMode: "table" }).viewMode).toBe("nextSteps");
  });

  it("keeps a value already saved under the new name", () => {
    expect(migrateRenamedFilters({ worksheetStage: 2, stageGridStage: 4 })).toEqual({ stageGridStage: 4 });
  });

  it("moves the old Awarded / Completed filters to their Approved names", () => {
    expect(migrateRenamedFilters({ showAwarded: false, stageGridShowCompleted: false })).toEqual({ showApproved: false, stageGridShowApproved: false });
    expect(migrateRenamedFilters({ worksheetShowCompleted: false })).toEqual({ stageGridShowApproved: false });
  });

  it("applies when loading saved state", () => {
    window.localStorage.setItem("summit.oasProgressVue.filters", JSON.stringify({ viewMode: "table", tableStage: 2 }));
    expect(loadOASProgressVueFilters()).toEqual({ viewMode: "nextSteps", nextStepsStage: 2 });
  });
});
