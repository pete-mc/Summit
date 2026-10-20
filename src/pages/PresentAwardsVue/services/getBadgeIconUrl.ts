/** URL-building only. To add artwork, edit src/shared/badgeManifest.ts. */

import { getBadgeEntry } from "@/shared/badgeManifest";

/** Gotcha: MV3 gives the page context no chrome.runtime, so summitloader.js stamps the extension URL onto <html>. */
function getExtensionUrl(): string | null {
  return document.documentElement.getAttribute("data-summit-extension-url");
}

/** Null = no artwork; callers show the placeholder. */
export function getBadgeIconUrl(badgeKey: string): string | null {
  const extensionUrl = getExtensionUrl();
  if (!extensionUrl) {
    return null;
  }

  const file = getBadgeEntry(badgeKey)?.file;
  return file ? `${extensionUrl}images/${file}` : null;
}

export function hasBadgeIcon(badgeKey: string): boolean {
  return Boolean(getBadgeEntry(badgeKey)?.file);
}

/** Wide = 96x66 additional-award art, not an 85x85 OAS square. */
export function hasWideIcon(badgeKey: string): boolean {
  const entry = getBadgeEntry(badgeKey);
  return Boolean(entry?.file && entry.wide);
}
