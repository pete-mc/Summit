/**
 * Prints via a fresh window, not a rasterised image: real text and a repeating <thead>.
 * Learning: a new window also avoids losing cascade ties to Terrain's CSS, so there's no Terrain chrome to hide.
 */

import { collectPrintFontCss, declaredPrintWeights, waitForPrintFonts } from "@/print/printFonts";
import { PRINT_PAGE_MARGIN_MM, STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX, TRANSPOSED_COLUMN_WRAP_WIDTH_PRINT_PX, TRANSPOSED_COLUMN_WIDTH_PRINT_PX } from "./worksheetPrintPageSize";

const PRINT_WINDOW_NAME = "oasWorksheetsPrint";

/** SummitPrintSans gives a true semibold. NunitoSans-regular matches WORKSHEET_FONT_FAMILY used for measuring. */
const WORKSHEET_PRINT_FONT_STACK = '"SummitPrintSans", NunitoSans-regular, arial, sans-serif';

export type WorksheetPrintOrientation = "landscape" | "portrait";

/** Gotcha: self-contained, because the print window has no Summit/Terrain CSS variables. Colours are literal copies of the tokens. */
export function buildPrintStylesheet(orientation: WorksheetPrintOrientation, fontCss = ""): string {
  return `
    ${fontCss}
    @page { size: A4 ${orientation}; margin: ${PRINT_PAGE_MARGIN_MM}mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ${WORKSHEET_PRINT_FONT_STACK};
      font-size: 10pt;
      color: #201f1e;
    }

    .oas-worksheet-print-close-btn {
      display: block;
      margin: 0 0 10px 0;
      padding: 6px 14px;
      font-size: 10pt;
      font-family: ${WORKSHEET_PRINT_FONT_STACK};
      cursor: pointer;
      border: 1px solid #c8c6c4;
      border-radius: 4px;
      background: #f3f2f1;
      color: #201f1e;
    }
    @media print {
      .oas-worksheet-print-close-btn { display: none; }
    }
    table.oas-worksheet-page {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8mm;
      /* Chromium still needs the legacy page-break-after too. */
      break-after: page;
      page-break-after: always;
    }
    table.oas-worksheet-page:last-of-type {
      break-after: auto;
      page-break-after: auto;
    }
    table.oas-worksheet-page thead { display: table-header-group; }
    table.oas-worksheet-page tr { break-inside: avoid; page-break-inside: avoid; }

    th, td {
      border: 1px solid #c8c6c4;
      padding: 3px 6px;
      text-align: left;
      vertical-align: middle;
    }
    th { background: #fff; font-weight: 600; text-align: center; white-space: nowrap; }
    td.oas-worksheet-group-band { text-align: center; font-weight: 600; }
    td.oas-worksheet-statement, th.oas-worksheet-group-header { text-align: left; }
    /* Fallback only: the inline per-page widths win. */
    td.oas-worksheet-statement { width: ${STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX}px; white-space: normal; }
    td.oas-worksheet-cell { min-width: 70px; text-align: center; }
    .oas-worksheet-cell-date { white-space: nowrap; }

    .oas-worksheet-patrol-group-start { border-left: 2px solid #c8c6c4; }
    .oas-worksheet-patrol-group-end { border-right: 2px solid #c8c6c4; }
    /* Chromium skips backgrounds unless "Background graphics" is on, so awarded cells also always show their date. */
    .oas-worksheet-cell-awarded { background: #b3c9b3; }
    .oas-worksheet-cell-na { background: #f3f2f1; }
    .oas-worksheet-cell-na-label { font-size: 8pt; color: #748494; }

    /* Gotcha: must match OASWorksheetsVue.vue's .oas-worksheet-rotated-text, because the print markup is a clone. */
    .oas-worksheet-rotated-text {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      white-space: nowrap;
      display: inline-block;
    }

    th.oas-worksheet-statement-header .oas-worksheet-rotated-text {
      white-space: normal;
      word-break: break-word;
    }

    th.oas-worksheet-member-header { width: 28px; min-width: 28px; max-width: 28px; height: 140px; padding: 6px 2px; }
    td.oas-worksheet-group-band { width: 28px; min-width: 28px; max-width: 28px; padding: 4px 2px; }

    th.oas-worksheet-member-name-header, td.oas-worksheet-member-name-cell { text-align: left; min-width: 140px; padding: 4px 8px; white-space: nowrap; }
    tr.oas-worksheet-group-span-row th.oas-worksheet-member-name-header { white-space: normal; }
    /* Gotcha: rotated text swaps axes (see OASWorksheetsVue.vue). */
    th.oas-worksheet-statement-header { width: ${TRANSPOSED_COLUMN_WIDTH_PRINT_PX}px; min-width: ${TRANSPOSED_COLUMN_WIDTH_PRINT_PX}px; height: ${TRANSPOSED_COLUMN_WRAP_WIDTH_PRINT_PX}px; padding: 4px 2px; font-weight: normal; text-align: left; vertical-align: bottom; }
    .oas-worksheet-patrol-divider-row td { background: #f3f2f1; font-weight: 600; text-align: left; }

    /* Bigger than on screen: it's ticked with a pen. */
    .oas-worksheet-tick-box {
      display: inline-block;
      width: 7mm;
      height: 7mm;
      border: 1px solid #b7c2cc;
      border-radius: 1px;
    }

  `;
}

export interface PrintWorksheetsOptions {
  pageTables: HTMLTableElement[];
  documentTitle: string;
  orientation: WorksheetPrintOrientation;
}

/** Clones the live tables so print matches the screen. Returns false if the popup was blocked. */
export function printWorksheets(options: PrintWorksheetsOptions): boolean {
  const printWindow = window.open("", PRINT_WINDOW_NAME, "width=1000,height=800");
  if (!printWindow) {
    return false;
  }

  // Learning: opened from a content script, the window doesn't reliably come to the front, so focus it immediately as well as before print().
  printWindow.focus();

  const tablesHtml = options.pageTables.map((table) => table.outerHTML).join("\n");
  // A new window gets none of Terrain's @font-face rules.
  const fontCss = collectPrintFontCss(document);

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${options.documentTitle}</title>
<style>${buildPrintStylesheet(options.orientation, fontCss)}</style>
</head>
<body>
<!-- The popup has no tab strip, so give users a way to close it. -->
<button type="button" class="oas-worksheet-print-close-btn" onclick="window.close()">Close this window</button>
${tablesHtml}
</body>
</html>`);
  printWindow.document.close();

  // Gotcha: `load` can fire before write()'s content is parsed, so a 500ms timeout is a fallback. `printed` stops print() firing twice.
  let printed = false;
  const triggerPrint = async () => {
    if (printed || printWindow.closed) {
      return;
    }
    printed = true;
    await waitForPrintFonts(printWindow.document, declaredPrintWeights(fontCss));
    if (printWindow.closed) {
      return;
    }
    printWindow.focus();
    printWindow.print();
  };
  printWindow.onload = triggerPrint;
  window.setTimeout(triggerPrint, 500);

  return true;
}
