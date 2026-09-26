import { getBadgeIconUrl, hasBadgeIcon } from "@/pages/PresentAwardsVue/services/getBadgeIconUrl";

const EXTENSION_URL = "chrome-extension://abcdef/";

describe("getBadgeIconUrl", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-summit-extension-url", EXTENSION_URL);
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-summit-extension-url");
  });

  it("resolves an OAS skill badge to its bundled artwork", () => {
    expect(getBadgeIconUrl("bushwalking")).toBe(`${EXTENSION_URL}images/oas-skills/Bushwalking.png`);
  });

  it("resolves every OAS skill that has artwork", () => {
    const skills = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];

    skills.forEach((skill) => {
      expect(getBadgeIconUrl(skill)).toContain("images/oas-skills/");
      expect(hasBadgeIcon(skill)).toBe(true);
    });
  });

  it("returns null for an award type with no artwork yet, so the caller shows a placeholder", () => {
    expect(getBadgeIconUrl("milestone")).toBeNull();
    expect(getBadgeIconUrl("special_interest_area")).toBeNull();
    expect(hasBadgeIcon("milestone")).toBe(false);
  });

  it("returns null for an empty or unknown key rather than a broken URL", () => {
    expect(getBadgeIconUrl("")).toBeNull();
    expect(getBadgeIconUrl("not_a_real_badge")).toBeNull();
  });

  it("returns null when the extension URL attribute is missing", () => {
    // The attribute is stamped by summitloader.js; without it there is no base to build on.
    document.documentElement.removeAttribute("data-summit-extension-url");

    expect(getBadgeIconUrl("bushwalking")).toBeNull();
  });
});
