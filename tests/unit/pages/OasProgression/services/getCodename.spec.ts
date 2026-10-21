import { getCodename } from "@/pages/OasProgression/services/getCodename";

describe("getCodename", () => {
  it("returns the same codename for the same member id every time", () => {
    expect(getCodename("member-123")).toBe(getCodename("member-123"));
  });

  it("returns different codenames for a reasonable sample of different ids", () => {
    const ids = Array.from({ length: 30 }, (_, i) => `member-${i}`);
    const codenames = new Set(ids.map((id) => getCodename(id)));
    expect(codenames.size).toBeGreaterThan(1);
  });

  it("does not crash on an empty id", () => {
    expect(() => getCodename("")).not.toThrow();
    expect(typeof getCodename("")).toBe("string");
  });

  it("does not crash on an unusual id", () => {
    expect(() => getCodename("🦘-!@#$%^&*()_+ünïçödé")).not.toThrow();
  });

  it("always returns a non-empty string from the fixed list", () => {
    const result = getCodename("some-member-id");
    expect(result.length).toBeGreaterThan(0);
  });
});
