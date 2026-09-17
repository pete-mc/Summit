const SKILL_ICON_FILENAMES: Record<string, string> = {
  bushcraft: "Bushcraft.png",
  bushwalking: "Bushwalking.png",
  camping: "Camping.png",
  aquatics: "Aquatic.png",
  boating: "Boating.png",
  paddling: "Paddling.png",
  alpine: "Alpine.png",
  cycling: "Cycling.png",
  vertical: "Vertical.png",
};

/**
 * Extension-bundled icon URL for a skill, or null for an unmapped skill key (render nothing
 * rather than a broken image). This code runs in the injected page's own JS context, which has
 * no access to chrome.runtime (MV3 does not expose it to the main world) — so the extension's
 * base URL is read from a DOM attribute that summitloader.js (running in the isolated
 * content-script world, which DOES have chrome.runtime) stamps onto <html> before injecting
 * summit.js. See summitloader.js for the other half of this.
 */
export function getSkillIconUrl(skill: string): string | null {
  const filename = SKILL_ICON_FILENAMES[skill];
  if (!filename) {
    return null;
  }

  const extensionUrl = document.documentElement.getAttribute("data-summit-extension-url");
  if (!extensionUrl) {
    return null;
  }

  return `${extensionUrl}images/oas-skills/${filename}`;
}
