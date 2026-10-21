/**
 * Listed explicitly because the files mix .jpg and .png, so a guessed name would be a broken image.
 * Gotcha: MAIN world has no chrome.runtime; the base URL comes from the attribute summitloader.js sets on <html>.
 */
const SECTION_LOGO_FILES: Record<string, string> = {
  joey: "Section_Joey_Vert_FullCol.jpg",
  cub: "Section_Cub_Vert_FullCol.png",
  scout: "Section_Scout_Vert_FullCol.jpg",
  venturer: "Section_Venturer_Vert_FullCol.jpg",
  rover: "Section_Rover_Vert_FullCol.jpg",
};

const SECTION_LABELS: Record<string, string> = {
  joey: "Joey Scouts",
  cub: "Cub Scouts",
  scout: "Scouts",
  venturer: "Venturer Scouts",
  rover: "Rover Scouts",
};

export function getSectionLogoUrl(section: string | null | undefined): string | null {
  const file = section ? SECTION_LOGO_FILES[section.toLowerCase()] : undefined;
  if (!file) return null;
  const extensionUrl = document.documentElement.getAttribute("data-summit-extension-url");
  if (!extensionUrl) return null;
  return `${extensionUrl}images/sections/${file}`;
}

export function getSectionLabel(section: string | null | undefined): string {
  if (!section) return "";
  return SECTION_LABELS[section.toLowerCase()] ?? section;
}
