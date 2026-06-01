describe("Phase 1 summit calendar contrast text helper contract", () => {
  it("returns white text for dark backgrounds and black text for light backgrounds", () => {
    const helpers = require("@/helpers") as Record<string, unknown>;
    const contrastSelector = helpers.getContrastTextColor;

    expect(typeof contrastSelector).toBe("function");

    const getContrastTextColor = contrastSelector as (backgroundColor: string) => string;

    expect(getContrastTextColor("#004c00")).toBe("#ffffff");
    expect(getContrastTextColor("#9e1b32")).toBe("#ffffff");
    expect(getContrastTextColor("#ffc82e")).toBe("#000000");
    expect(getContrastTextColor("#f3f2f1")).toBe("#000000");
  });
});