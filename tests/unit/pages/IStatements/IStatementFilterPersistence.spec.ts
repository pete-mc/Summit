import { defaultIStatementFilters, loadIStatementFilters, saveIStatementFilters } from "@/pages/IStatements/services/IStatementFilterPersistence";
import { OAS_STREAMS } from "@/pages/OasProgression/services/buildOASProgressionRows";

const KEY = "summit.iStatements.filters";

beforeEach(() => {
  window.localStorage.clear();
});

describe("defaultIStatementFilters", () => {
  it("opens on stages 1-5 with empty statements hidden", () => {
    const defaults = defaultIStatementFilters();
    expect(defaults.stageFrom).toBe(1);
    expect(defaults.stageTo).toBe(5);
    expect(defaults.hideEmptyRows).toBe(true);
    expect(defaults.hideEmptyStages).toBe(false);
    expect(defaults.hideEmptyGroups).toBe(false);
    expect(defaults.skills).toEqual([...OAS_STREAMS]);
  });
});

describe("loadIStatementFilters", () => {
  it("returns defaults when nothing is stored", () => {
    expect(loadIStatementFilters()).toEqual(defaultIStatementFilters());
  });

  it("round-trips saved filters", () => {
    const saved = { ...defaultIStatementFilters(), skills: ["camping"], stageFrom: 2, stageTo: 7, hideEmptyGroups: true };
    saveIStatementFilters(saved);
    expect(loadIStatementFilters()).toEqual(saved);
  });

  it("falls back to defaults on malformed json", () => {
    window.localStorage.setItem(KEY, "{not json");
    expect(loadIStatementFilters()).toEqual(defaultIStatementFilters());
  });

  it("drops skills that no longer exist", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ ...defaultIStatementFilters(), skills: ["camping", "underwater-basket-weaving"] }));
    expect(loadIStatementFilters().skills).toEqual(["camping"]);
  });

  it("defaults the skill list when a stored one is emptied entirely", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ ...defaultIStatementFilters(), skills: ["nope"] }));
    expect(loadIStatementFilters().skills).toEqual([...OAS_STREAMS]);
  });

  it("rejects out-of-range stages", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ ...defaultIStatementFilters(), stageFrom: 0, stageTo: 42 }));
    const loaded = loadIStatementFilters();
    expect(loaded.stageFrom).toBe(1);
    expect(loaded.stageTo).toBe(5);
  });

  it("normalises an inverted stored range", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ ...defaultIStatementFilters(), stageFrom: 8, stageTo: 3 }));
    const loaded = loadIStatementFilters();
    expect(loaded.stageFrom).toBe(3);
    expect(loaded.stageTo).toBe(8);
  });

  it("ignores non-boolean toggles", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ ...defaultIStatementFilters(), hideEmptyRows: "yes" }));
    expect(loadIStatementFilters().hideEmptyRows).toBe(true);
  });
});
