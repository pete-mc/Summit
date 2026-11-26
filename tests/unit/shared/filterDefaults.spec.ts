import { loadFilterDefaults, loadFilterDefaultsAppliedAt, markFilterDefaultsApplied, resetFilterDefaults, saveFilterDefaults, SYSTEM_FILTER_DEFAULTS } from "@/shared/filterDefaults";

const STORAGE_KEY = "summit.filterDefaults";

describe("filterDefaults", () => {
  beforeEach(() => window.localStorage.clear());

  it("uses the system defaults when nothing is saved", () => {
    expect(loadFilterDefaults()).toEqual(SYSTEM_FILTER_DEFAULTS);
    expect(loadFilterDefaultsAppliedAt()).toBeNull();
  });

  it("round-trips saved defaults", () => {
    const defaults = { ...SYSTEM_FILTER_DEFAULTS, nameFormat: "codename" as const, sortBy: "lastName" as const, breakByPatrol: true };
    saveFilterDefaults(defaults);
    expect(loadFilterDefaults()).toEqual(defaults);
  });

  it("falls back field by field when a saved value is unknown", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ defaults: { nameFormat: "nickname", sortBy: "progress", showApproved: "no", breakByPatrol: true } }));
    expect(loadFilterDefaults()).toEqual({ ...SYSTEM_FILTER_DEFAULTS, breakByPatrol: true });
  });

  it("ignores malformed storage", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadFilterDefaults()).toEqual(SYSTEM_FILTER_DEFAULTS);
  });

  it("reset puts the system defaults back but keeps the last Apply time", () => {
    saveFilterDefaults({ ...SYSTEM_FILTER_DEFAULTS, showApproved: false });
    markFilterDefaultsApplied(1234);

    resetFilterDefaults();

    expect(loadFilterDefaults()).toEqual(SYSTEM_FILTER_DEFAULTS);
    expect(loadFilterDefaultsAppliedAt()).toBe(1234);
  });

  it("survives localStorage throwing", () => {
    const getSpy = jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation(() => {
      throw new Error("access denied");
    });
    const setSpy = jest.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(loadFilterDefaults()).toEqual(SYSTEM_FILTER_DEFAULTS);
    expect(() => saveFilterDefaults(SYSTEM_FILTER_DEFAULTS)).not.toThrow();
    expect(() => markFilterDefaultsApplied()).not.toThrow();

    getSpy.mockRestore();
    setSpy.mockRestore();
  });
});
