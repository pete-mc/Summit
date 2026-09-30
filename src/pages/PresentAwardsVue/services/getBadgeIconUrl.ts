/**
 * Badge artwork lookup for the Present Awards table's icon column.
 *
 * Every badge Summit knows about — which artwork it has, and which it does not — lives in the
 * shared manifest at src/shared/badgeManifest.ts. This module is only the URL-building half.
 * To add artwork, edit the manifest, not this file.
 *
 * Awards with no artwork yet resolve to null, and the caller renders a neutral placeholder so the
 * column stays visually aligned and the Badger can still scan down it.
 */

import { getBadgeEntry } from "@/shared/badgeManifest";

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
  if (!extensionUrl) {
    return null;
  }

  const file = getBadgeEntry(badgeKey)?.file;
  return file ? `${extensionUrl}images/${file}` : null;
}

/** True when real artwork exists for this key — i.e. the placeholder is not being used. */
export function hasBadgeIcon(badgeKey: string): boolean {
  return Boolean(getBadgeEntry(badgeKey)?.file);
}

/**
 * True when this key's artwork is wide (96x66) rather than a square OAS icon (85x85). The table's
 * icon column is a fixed square, so a wide badge needs extra width or it letterboxes down to a
 * visibly smaller badge than its neighbours.
 */
export function hasWideIcon(badgeKey: string): boolean {
  const entry = getBadgeEntry(badgeKey);
  return Boolean(entry?.file && entry.wide);
}
