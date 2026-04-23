import HasPropAtPath from "@/helpers/HasPropAtPath";

describe("HasPropAtPath", () => {
  it("returns true for nested properties with matching value", () => {
    const target = {
      profile: {
        details: {
          name: "Alex",
        },
      },
    };

    expect(HasPropAtPath(target, "profile.details.name", "Alex")).toBe(true);
  });

  it("returns false for missing paths", () => {
    const target = {
      profile: {
        details: {
          name: "Alex",
        },
      },
    };

    expect(HasPropAtPath(target, "profile.details.rank", "Leader")).toBe(false);
  });

  it("returns false for missing paths with null intermediate object", () => {
    const target = {
      profile: null,
    } as unknown as Record<string, unknown>;

    expect(HasPropAtPath(target as Record<string, unknown>, "profile.details.name", "Alex")).toBe(false);
  });

  it("handles falsey values correctly", () => {
    const target = {
      zero: 0,
      empty: "",
      disabled: false,
    };

    expect(HasPropAtPath(target, "zero", 0)).toBe(true);
    expect(HasPropAtPath(target, "empty", "")).toBe(true);
    expect(HasPropAtPath(target, "disabled", false)).toBe(true);
    expect(HasPropAtPath(target, "zero", 1)).toBe(false);
  });
});
