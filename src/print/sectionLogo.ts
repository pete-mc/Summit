/**
 * Logos follow one pattern: images/sections/Section_<Section>_Vert_FullCol.jpg. A new or replaced logo must keep it.
 * Gotcha: MAIN world has no chrome.runtime; the base URL comes from the attribute summitloader.js sets on <html>.
 */
const SECTION_LABELS: Record<string, string> = {
  joey: "Joey Scouts",
  cub: "Cub Scouts",
  scout: "Scouts",
  venturer: "Venturer Scouts",
  rover: "Rover Scouts",
};

function isKnownSection(section: string): boolean {
  return Object.prototype.hasOwnProperty.call(SECTION_LABELS, section);
}

export function getSectionLogoFile(section: string): string {
  return `Section_${section.charAt(0).toUpperCase()}${section.slice(1)}_Vert_FullCol.jpg`;
}

export function getSectionLogoUrl(section: string | null | undefined): string | null {
  const key = section?.toLowerCase();
  if (!key || !isKnownSection(key)) return null;
  const extensionUrl = document.documentElement.getAttribute("data-summit-extension-url");
  if (!extensionUrl) return null;
  return `${extensionUrl}images/sections/${getSectionLogoFile(key)}`;
}

export function getSectionLabel(section: string | null | undefined): string {
  if (!section) return "";
  return SECTION_LABELS[section.toLowerCase()] ?? section;
}

export const SECTION_KEYS = Object.keys(SECTION_LABELS);
