import { saveOASProgressionVueFilters, loadOASProgressionVueFilters, type OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

const STORAGE_KEY = "summit.oasProgressionVue.filters";
const REACT_PAGE_STORAGE_KEY = "summit.oasProgression.filters";

function makeFilters(overrides: Partial<OASProgressionVueFilterState> = {}): OASProgressionVueFilterState {
  return {
    viewMode: "heatmap",
    groupBy: "skill",
    memberFilter: "",
    nameFormat: "full",
    selectedPatrols: [],
    breakByPatrol: false,
    showEmptySkillRows: true,
    showEmptyTopStages: true,
    showAwarded: true,
    showNotStarted: true,
    showAnswered: true,
    visibleStreams: ["bushcraft", "bushwalking"],
    visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    sortBy: "firstName",
    worksheetVisibleSkills: ["bushcraft", "bushwalking"],
    worksheetVisibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    worksheetNameFormat: "full",
    worksheetBreakByPatrol: false,
    worksheetShowCompleted: true,
    worksheetLayout: "membersAsColumns",
    ...overrides,
  };
}

describe("OASProgressionVueFilterPersistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips filter state through localStorage", () => {
    const filters = makeFilters({ nameFormat: "first", selectedPatrols: ["Kookaburras"], visibleStages: [3, 4, 5, 6] });

    saveOASProgressionVueFilters(filters);

    expect(loadOASProgressionVueFilters()).toEqual(filters);
  });

  it("uses a separate storage key from the React OAS Progression page, so saved filters never collide", () => {
    saveOASProgressionVueFilters(makeFilters({ memberFilter: "vue page" }));
    window.localStorage.setItem(REACT_PAGE_STORAGE_KEY, JSON.stringify({ ...makeFilters(), viewMode: "heatmap", memberFilter: "react page" }));

    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(loadOASProgressionVueFilters()?.memberFilter).toBe("vue page");
  });

  it("returns null when nothing has been saved", () => {
    expect(loadOASProgressionVueFilters()).toBeNull();
  });

  it("returns null when stored value is malformed JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadOASProgressionVueFilters()).toBeNull();
  });

  it("returns null when stored value is not an object", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify("just a string"));
    expect(loadOASProgressionVueFilters()).toBeNull();
  });

  it("is resilient when localStorage throws on write", () => {
    const spy = jest.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() => saveOASProgressionVueFilters(makeFilters())).not.toThrow();

    spy.mockRestore();
  });

  it("is resilient when localStorage throws on read", () => {
    const spy = jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation(() => {
      throw new Error("access denied");
    });

    expect(loadOASProgressionVueFilters()).toBeNull();

    spy.mockRestore();
  });
});
