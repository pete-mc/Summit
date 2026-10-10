/**
 * Section logo for the print header (.claude/Print/PLAN.md "Section logos").
 *
 * Filenames are listed explicitly rather than built from a pattern: the supplied files mix .jpg and
 * .png, and a guessed name would print as a broken image. The keys are Terrain's own section values
 * (TerrainAchievementsSection: joey/cub/scout/venturer/rover).
 *
 * Same extension-URL mechanism as getSkillIconUrl.ts: this code runs in the page's MAIN world with
 * no chrome.runtime, so the base URL comes from the attribute summitloader.js stamps on <html>.
 * images/* is already web-accessible for terrain.scouts.com.au in manifest.json.
 */
const SECTION_LOGO_FILES: Record<string, string> = {
  joey: "Section_Joey_Vert_FullCol.jpg",
  cub: "Section_Cub_Vert_FullCol.png",
  scout: "Section_Scout_Vert_FullCol.jpg",
  venturer: "Section_Venturer_Vert_FullCol.jpg",
  rover: "Section_Rover_Vert_FullCol.jpg",
};

/** Official section names, as printed on the logos' own wordmarks. */
const SECTION_LABELS: Record<string, string> = {
  joey: "Joey Scouts",
  cub: "Cub Scouts",
  scout: "Scouts",
  venturer: "Venturer Scouts",
  rover: "Rover Scouts",
};

/** Logo URL for a section, or null (unknown section, or no extension URL) — never a broken image. */
export function getSectionLogoUrl(section: string | null | undefined): string | null {
  const file = section ? SECTION_LOGO_FILES[section.toLowerCase()] : undefined;
  if (!file) return null;
  const extensionUrl = document.documentElement.getAttribute("data-summit-extension-url");
  if (!extensionUrl) return null;
  return `${extensionUrl}images/sections/${file}`;
}

/** "Venturer Scouts" for "venturer"; an unknown value is returned unchanged; empty for none. */
export function getSectionLabel(section: string | null | undefined): string {
  if (!section) return "";
  return SECTION_LABELS[section.toLowerCase()] ?? section;
}
