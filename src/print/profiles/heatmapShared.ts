/** Colours come from the live screen so print tracks Summit's tokens. Sizes are set in print units instead. */
export const SQUARE_COLOUR_PROPS = [
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-radius",
];

/** Inline screen sizes would beat the print CSS. */
export function stripInlineSizes(table: HTMLTableElement, selector: string): void {
  Array.from(table.querySelectorAll<HTMLElement>(selector)).forEach((el) => {
    el.style.removeProperty("width");
    el.style.removeProperty("height");
  });
}

/** Gotcha: kept in sync by hand with the patrol rows in skillHeatmap.ts. */
export function patrolTitleRowCss(profileName: string): string {
  const row = `table.summit-print-profile-${profileName} tr.oas-heatmap-patrol-title-row`;
  return `
${row} { break-after: avoid; page-break-after: avoid; }
${row} > td { background: #f0f3f6; font-weight: 600; font-size: 8.5pt; padding: 0.9mm 1.6mm; text-align: left; }
`;
}
