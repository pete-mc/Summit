import { getSkillIconUrl } from "@/pages/OasProgression/services/getSkillIconUrl";

describe("getSkillIconUrl", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-summit-extension-url");
  });

  it("returns null when the extension base URL attribute is not present (e.g. main-world script not yet stamped by summitloader.js)", () => {
    expect(getSkillIconUrl("bushcraft")).toBeNull();
  });

  it("returns null for an unmapped skill key even when the base URL is present", () => {
    document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://abc/");
    expect(getSkillIconUrl("not-a-real-skill")).toBeNull();
  });

  it("builds the icon URL by joining the stamped extension base URL with the skill's icon path", () => {
    document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://abc/");
    expect(getSkillIconUrl("bushcraft")).toBe("chrome-extension://abc/images/oas-skills/Bushcraft.png");
  });

  it("uses the singular 'Aquatic.png' filename for the plural 'aquatics' skill key", () => {
    document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://abc/");
    expect(getSkillIconUrl("aquatics")).toBe("chrome-extension://abc/images/oas-skills/Aquatic.png");
  });

  it("maps every one of the 9 OAS skills to a filename", () => {
    document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://abc/");
    const skills = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];
    skills.forEach((skill) => {
      expect(getSkillIconUrl(skill)).not.toBeNull();
    });
  });
});
