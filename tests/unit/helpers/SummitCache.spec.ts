import { clearCache, loadCached, saveCached } from "@/helpers/SummitCache";

describe("SummitCache", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a saved value through loadCached", () => {
    saveCached("tree.bushwalking", { stream: "bushwalking", children: [] });

    const result = loadCached<{ stream: string; children: unknown[] }>("tree.bushwalking", 24 * 60 * 60 * 1000);

    expect(result).toEqual({ stream: "bushwalking", children: [] });
  });

  it("returns null for a cache miss", () => {
    expect(loadCached("template.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
  });

  it("returns null once the entry is older than maxAgeMs", () => {
    const realNow = Date.now;
    let now = 1_000_000;
    Date.now = jest.fn(() => now);

    try {
      saveCached("tree.bushwalking", { value: 1 });
      now += 2000;

      expect(loadCached("tree.bushwalking", 1000)).toBeNull();
    } finally {
      Date.now = realNow;
    }
  });

  it("returns null and does not throw when localStorage holds malformed JSON", () => {
    window.localStorage.setItem("summit.cache.tree.bushwalking", "{not valid json");

    expect(loadCached("tree.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
  });

  it("returns null when localStorage holds a value missing cachedAt", () => {
    window.localStorage.setItem("summit.cache.tree.bushwalking", JSON.stringify({ value: { foo: "bar" } }));

    expect(loadCached("tree.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
  });

  it("clearCache() with no argument removes every Summit cache entry, from any feature", () => {
    saveCached("tree.bushwalking", { a: 1 });
    saveCached("template.bushwalking", { b: 1 });
    saveCached("achievements.unit-1.camping.core.2", []);
    saveCached("milestones.template.123", { d: 1 });
    window.localStorage.setItem("some.other.key", "untouched");

    clearCache();

    expect(loadCached("tree.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("template.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("achievements.unit-1.camping.core.2", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("milestones.template.123", 24 * 60 * 60 * 1000)).toBeNull();
    expect(window.localStorage.getItem("some.other.key")).toBe("untouched");
  });

  it("clearCache(filter) removes only entries the filter matches, leaving others intact", () => {
    saveCached("tree.bushwalking", { a: 1 });
    saveCached("milestones.template.123", { b: 1 });

    clearCache((key) => key.startsWith("tree."));

    expect(loadCached("tree.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("milestones.template.123", 24 * 60 * 60 * 1000)).toEqual({ b: 1 });
  });
});
