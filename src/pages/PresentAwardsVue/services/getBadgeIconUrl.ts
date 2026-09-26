/**
 * Badge artwork lookup for the Present Awards table's icon column.
 *
 * Only the nine OAS skill icons exist so far (src/images/oas-skills/, already exposed via
 * manifest.json's web_accessible_resources). Every other award type — milestones, SIAs, peak
 * awards, courses — has no artwork yet and gets a neutral placeholder, so the column stays
 * visually aligned and the Badger can still scan down it. Drop a file into src/images/badges/
 * and add a line to BADGE_ICON_FILENAMES to light one up; no other change is needed.
 */

/** OAS branch key -> filename in images/oas-skills/. Mirrors getSkillIconUrl.ts's own map. */
const OAS_SKILL_ICON_FILENAMES: Record<string, string> = {
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
 * Non-OAS badge key -> filename in images/badges/. Empty until artwork is added to the repo —
 * every key falls through to the placeholder until then.
 */
const BADGE_ICON_FILENAMES: Record<string, string> = {};

/**
 * The extension's own base URL, read from a DOM attribute rather than chrome.runtime.
 *
 * This code runs in the injected page's JS context, which MV3 does not give chrome.runtime access
 * to. summitloader.js — the isolated-world content script, which does have it — stamps the URL
 * onto <html> before injecting summit.js. See summitloader.js for the other half.
 */
function getExtensionUrl(): string | null {
  return document.documentElement.getAttribute("data-summit-extension-url");
}

/**
 * Artwork URL for a badge key, or null when there is none — callers render the placeholder in
 * that case rather than a broken image.
 */
export function getBadgeIconUrl(badgeKey: string): string | null {
  const extensionUrl = getExtensionUrl();
  if (!extensionUrl || !badgeKey) {
    return null;
  }

  const skillFilename = OAS_SKILL_ICON_FILENAMES[badgeKey];
  if (skillFilename) {
    return `${extensionUrl}images/oas-skills/${skillFilename}`;
  }

  const badgeFilename = BADGE_ICON_FILENAMES[badgeKey];
  if (badgeFilename) {
    return `${extensionUrl}images/badges/${badgeFilename}`;
  }

  return null;
}

/** True when real artwork exists for this key — i.e. the placeholder is not being used. */
export function hasBadgeIcon(badgeKey: string): boolean {
  return Boolean(OAS_SKILL_ICON_FILENAMES[badgeKey] || BADGE_ICON_FILENAMES[badgeKey]);
}
