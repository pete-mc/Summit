/**
 * Shared by the OAS heat-map profiles (Summary and Heatmap), which render the same
 * .oas-heatmap-square / .oas-heatmap-stage-bar elements.
 *
 * Copied from the live screen's computed styles so the print colours track Summit's tokens
 * (--summit-color-status-*) rather than duplicating them. Sizes are set in each profile's CSS in
 * print units instead, because screen pixel sizes are exactly what shouldn't carry over.
 */
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

/** Remove inline screen sizes (e.g. the Summary bar's width from barWidthPx) — inline styles would beat the print CSS. */
export function stripInlineSizes(table: HTMLTableElement, selector: string): void {
  Array.from(table.querySelectorAll<HTMLElement>(selector)).forEach((el) => {
    el.style.removeProperty("width");
    el.style.removeProperty("height");
  });
}
