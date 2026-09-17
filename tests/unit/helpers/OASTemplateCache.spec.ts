import { clearCache, loadCached, saveCached } from "@/helpers/OASTemplateCache";

describe("OASTemplateCache", () => {
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
    window.localStorage.setItem("summit.oas.cache.tree.bushwalking", "{not valid json");

    expect(loadCached("tree.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
  });

  it("returns null when localStorage holds a value missing cachedAt", () => {
    window.localStorage.setItem("summit.oas.cache.tree.bushwalking", JSON.stringify({ value: { foo: "bar" } }));

    expect(loadCached("tree.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
  });

  it("clearCache() with no argument removes every OAS cache entry", () => {
    saveCached("tree.bushwalking", { a: 1 });
    saveCached("template.bushwalking", { b: 1 });
    saveCached("achievements.unit-1.camping.core.2", []);
    window.localStorage.setItem("some.other.key", "untouched");

    clearCache();

    expect(loadCached("tree.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("template.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("achievements.unit-1.camping.core.2", 24 * 60 * 60 * 1000)).toBeNull();
    expect(window.localStorage.getItem("some.other.key")).toBe("untouched");
  });

  it("clearCache(stream) removes only entries for that stream, leaving other streams intact", () => {
    saveCached("tree.bushwalking", { a: 1 });
    saveCached("template.bushwalking", { b: 1 });
    saveCached("achievements.unit-1.bushwalking.core.2", []);
    saveCached("tree.camping", { c: 1 });
    saveCached("achievements.unit-1.camping.core.2", []);

    clearCache("bushwalking");

    expect(loadCached("tree.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("template.bushwalking", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("achievements.unit-1.bushwalking.core.2", 24 * 60 * 60 * 1000)).toBeNull();
    expect(loadCached("tree.camping", 24 * 60 * 60 * 1000)).toEqual({ c: 1 });
    expect(loadCached("achievements.unit-1.camping.core.2", 24 * 60 * 60 * 1000)).toEqual([]);
  });
});
