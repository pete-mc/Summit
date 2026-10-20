import { getMemberDisplayName } from "@/pages/OasProgression/services/getMemberDisplayName";
import { getCodename } from "@/pages/OasProgression/services/getCodename";

describe("getMemberDisplayName", () => {
  it("returns the full name (first + last) for 'full'", () => {
    expect(getMemberDisplayName("Amy", "Scout", "m1", "full")).toBe("Amy Scout");
  });

  it("returns only the first name for 'first'", () => {
    expect(getMemberDisplayName("Amy", "Scout", "m1", "first")).toBe("Amy");
  });

  it("formats as FirstName.L for 'firstInitialLast'", () => {
    expect(getMemberDisplayName("Amy", "Scout", "m1", "firstInitialLast")).toBe("Amy.S");
  });

  it("formats as F.LastName for 'firstLastInitial'", () => {
    expect(getMemberDisplayName("Amy", "Scout", "m1", "firstLastInitial")).toBe("A.Scout");
  });

  it("resolves the deterministic codename for 'codename', matching getCodename", () => {
    expect(getMemberDisplayName("Amy", "Scout", "m1", "codename")).toBe(getCodename("m1"));
  });

  it("falls back to 'Scout' for the initial-style formats when there is no last name", () => {
    expect(getMemberDisplayName("Amy", "", "m1", "firstInitialLast")).toBe("Scout");
    expect(getMemberDisplayName("Amy", "", "m1", "firstLastInitial")).toBe("Scout");
  });

  it("'first' and 'full' still work sensibly when there is no last name", () => {
    expect(getMemberDisplayName("Amy", "", "m1", "first")).toBe("Amy");
    expect(getMemberDisplayName("Amy", "", "m1", "full")).toBe("Amy");
  });

  // Regression: re-splitting a combined name lost multi-word names.
  it("handles a multi-word last name correctly, unlike the old whitespace-split approach", () => {
    expect(getMemberDisplayName("Anne", "Van Der Berg", "m1", "firstInitialLast")).toBe("Anne.V");
    expect(getMemberDisplayName("Anne", "Van Der Berg", "m1", "firstLastInitial")).toBe("A.Van Der Berg");
    expect(getMemberDisplayName("Anne", "Van Der Berg", "m1", "full")).toBe("Anne Van Der Berg");
  });

  it("handles a multi-word first name correctly", () => {
    expect(getMemberDisplayName("Mary Anne", "Smith", "m1", "first")).toBe("Mary Anne");
    expect(getMemberDisplayName("Mary Anne", "Smith", "m1", "full")).toBe("Mary Anne Smith");
  });
});
