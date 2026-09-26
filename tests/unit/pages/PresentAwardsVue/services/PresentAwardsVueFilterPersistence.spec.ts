import { DEFAULT_FILTERS, loadPresentAwardsVueFilters, savePresentAwardsVueFilters, type PresentAwardsVueFilterState } from "@/pages/PresentAwardsVue/services/PresentAwardsVueFilterPersistence";

const STORAGE_KEY = "summit.presentAwardsVue.filters";

const sampleState: PresentAwardsVueFilterState = {
  columnFilters: { member: "Alex", presented: "no" },
  showPreviouslyPresented: true,
};

describe("PresentAwardsVueFilterPersistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("round-trips a filter state", () => {
    savePresentAwardsVueFilters(sampleState);

    expect(loadPresentAwardsVueFilters()).toEqual(sampleState);
  });

  it("writes under its own key, leaving the OAS page's state alone", () => {
    window.localStorage.setItem("summit.oasProgressionVue.filters", '{"viewMode":"table"}');

    savePresentAwardsVueFilters(sampleState);

    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(window.localStorage.getItem("summit.oasProgressionVue.filters")).toBe('{"viewMode":"table"}');
  });

  it("returns null when nothing has been saved", () => {
    expect(loadPresentAwardsVueFilters()).toBeNull();
  });

  it("returns null rather than throwing on corrupt JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    expect(loadPresentAwardsVueFilters()).toBeNull();
  });

  it("returns null when the stored value is not an object", () => {
    window.localStorage.setItem(STORAGE_KEY, '"a string"');

    expect(loadPresentAwardsVueFilters()).toBeNull();
  });

  it("survives localStorage being unavailable on read", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("access denied");
    });

    expect(loadPresentAwardsVueFilters()).toBeNull();
  });

  it("survives localStorage being unavailable on write", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() => savePresentAwardsVueFilters(sampleState)).not.toThrow();
  });

  it("merges a partial state over the defaults, so an older saved shape still loads", () => {
    // A build that predates showPreviouslyPresented would have saved only columnFilters.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ columnFilters: { member: "Sam" } }));

    const merged = { ...DEFAULT_FILTERS, ...(loadPresentAwardsVueFilters() ?? {}) };

    expect(merged).toEqual({ columnFilters: { member: "Sam" }, showPreviouslyPresented: false });
  });

  it("defaults to hiding previously presented awards, matching the React page", () => {
    expect(DEFAULT_FILTERS.showPreviouslyPresented).toBe(false);
    expect(DEFAULT_FILTERS.columnFilters).toEqual({});
  });
});
