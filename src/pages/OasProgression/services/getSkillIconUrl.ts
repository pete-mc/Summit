import { BADGE_MANIFEST, normaliseBadgeKey, OAS_SKILL_KEYS } from "@/shared/badgeManifest";

/**
 * Extension-bundled icon URL for an OAS skill, or null for an unmapped skill key (render nothing
 * rather than a broken image).
 *
 * Artwork comes from the shared badge manifest (src/shared/badgeManifest.ts), which is the single
 * source for every badge Summit knows about. This function stays OAS-only — it deliberately will
 * not resolve an additional award or milestone, so an OAS-specific caller cannot accidentally
 * render an unrelated badge.
 *
 * This code runs in the injected page's own JS context, which has no access to chrome.runtime
 * (MV3 does not expose it to the main world) — so the extension's base URL is read from a DOM
 * attribute that summitloader.js (running in the isolated content-script world, which DOES have
 * chrome.runtime) stamps onto <html> before injecting summit.js. See summitloader.js for the
 * other half of this.
 */
export function getSkillIconUrl(skill: string): string | null {
  const key = normaliseBadgeKey(skill);
  if (!OAS_SKILL_KEYS.includes(key)) {
    return null;
  }

  const file = BADGE_MANIFEST[key]?.file;
  if (!file) {
    return null;
  }

  const extensionUrl = document.documentElement.getAttribute("data-summit-extension-url");
  if (!extensionUrl) {
    return null;
  }

  return `${extensionUrl}images/${file}`;
}
