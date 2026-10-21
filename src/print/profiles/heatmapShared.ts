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
