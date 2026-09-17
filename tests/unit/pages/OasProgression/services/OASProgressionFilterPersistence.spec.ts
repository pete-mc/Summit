import { saveOASProgressionFilters, loadOASProgressionFilters, type OASProgressionFilterState } from "@/pages/OasProgression/services/OASProgressionFilterPersistence";

const STORAGE_KEY = "summit.oasProgression.filters";

function makeFilters(overrides: Partial<OASProgressionFilterState> = {}): OASProgressionFilterState {
  return {
    viewMode: "heatmap",
    memberFilter: "",
    hideLastName: false,
    useCodenames: false,
    selectedPatrols: [],
    breakByPatrol: false,
    hideEmptyStreams: false,
    hideEmptyTopColumns: false,
    visibleStreams: ["bushcraft", "bushwalking"],
    stageRange: [1, 9],
    sortBy: "firstName",
    ...overrides,
  };
}

describe("OASProgressionFilterPersistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips filter state through localStorage", () => {
    const filters = makeFilters({ hideLastName: true, selectedPatrols: ["Kookaburras"], stageRange: [3, 6] });

    saveOASProgressionFilters(filters);

    expect(loadOASProgressionFilters()).toEqual(filters);
  });

  it('migrates a legacy sortBy: "surname" value to "lastName"', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...makeFilters(), sortBy: "surname" }));

    expect(loadOASProgressionFilters()?.sortBy).toBe("lastName");
  });

  it("migrates a legacy hideSurname key to hideLastName", () => {
    const legacy = makeFilters() as unknown as Record<string, unknown>;
    delete legacy.hideLastName;
    legacy.hideSurname = true;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const loaded = loadOASProgressionFilters();
    expect(loaded?.hideLastName).toBe(true);
    expect((loaded as Record<string, unknown> | null)?.hideSurname).toBeUndefined();
  });

  it("returns null when nothing has been saved", () => {
    expect(loadOASProgressionFilters()).toBeNull();
  });

  it("returns null when stored value is malformed JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadOASProgressionFilters()).toBeNull();
  });

  it("returns null when stored value is not an object", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify("just a string"));
    expect(loadOASProgressionFilters()).toBeNull();
  });

  it("is resilient when localStorage throws on write", () => {
    const spy = jest.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() => saveOASProgressionFilters(makeFilters())).not.toThrow();

    spy.mockRestore();
  });

  it("is resilient when localStorage throws on read", () => {
    const spy = jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation(() => {
      throw new Error("access denied");
    });

    expect(loadOASProgressionFilters()).toBeNull();

    spy.mockRestore();
  });
});
