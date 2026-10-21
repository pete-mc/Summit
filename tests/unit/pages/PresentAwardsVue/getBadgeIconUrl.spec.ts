import { existsSync } from "fs";
import { resolve } from "path";
import { getBadgeIconUrl, hasBadgeIcon, hasWideIcon } from "@/pages/PresentAwardsVue/services/getBadgeIconUrl";

const EXTENSION_URL = "chrome-extension://abcdef/";

describe("getBadgeIconUrl", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-summit-extension-url", EXTENSION_URL);
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-summit-extension-url");
  });

  it("resolves an OAS skill badge to its bundled artwork", () => {
    expect(getBadgeIconUrl("bushwalking")).toBe(`${EXTENSION_URL}images/oas-skills/oas-bushwalking.svg`);
  });

  it("resolves an additional award to its bundled artwork", () => {
    expect(getBadgeIconUrl("walkabout_100")).toBe(`${EXTENSION_URL}images/aawards/aawards-walkabout-100.svg`);
    expect(getBadgeIconUrl("camper_award_25")).toBe(`${EXTENSION_URL}images/aawards/aawards-camperaward-25.svg`);
  });

  it("keys the camper awards as Terrain names them, not after the artwork filename", () => {
    // Terrain's bundle says camper_award_N. Keying these "camping_N" silently showed placeholders.
    expect(getBadgeIconUrl("camper_award_10")).not.toBeNull();
    expect(getBadgeIconUrl("camping_10")).toBeNull();
  });

  it("resolves every additional award that has artwork", () => {
    const awards = ["camper_award_10", "camper_award_25", "camper_award_50", "camper_award_75", "camper_award_100", "walkabout_10", "walkabout_50", "walkabout_100"];

    awards.forEach((award) => {
      expect(getBadgeIconUrl(award)).toContain("images/aawards/");
      expect(hasBadgeIcon(award)).toBe(true);
    });
  });

  it("accepts hyphen and space variants of an award id, so punctuation drift cannot break a lookup", () => {
    const expected = `${EXTENSION_URL}images/aawards/aawards-walkabout-100.svg`;

    expect(getBadgeIconUrl("walkabout-100")).toBe(expected);
    expect(getBadgeIconUrl("Walkabout 100")).toBe(expected);
  });

  it("points every mapped filename at a file that actually exists on disk", () => {
    // A typo'd filename 404s silently in the browser, showing nothing rather than an error.
    const awards = ["camper_award_10", "camper_award_25", "camper_award_50", "camper_award_75", "camper_award_100", "walkabout_10", "walkabout_50", "walkabout_100"];
    const oasSkills = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];

    [...awards, ...oasSkills].forEach((key) => {
      const url = getBadgeIconUrl(key);
      expect(url).not.toBeNull();
      const relativePath = (url as string).slice(EXTENSION_URL.length);
      expect(existsSync(resolve(__dirname, "../../../../src", relativePath))).toBe(true);
    });
  });

  it("flags additional awards as wide so the caller does not squash them into a square box", () => {
    // OAS icons are 85x85, additional awards 96x66 — the column sizes by height for the latter.
    expect(hasWideIcon("walkabout_100")).toBe(true);
    expect(hasWideIcon("bushwalking")).toBe(false);
    expect(hasWideIcon("milestone")).toBe(false);
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
