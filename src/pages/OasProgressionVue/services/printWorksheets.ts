/**
 * Prints the Worksheets view by opening its already-rendered tables in a brand-new, blank window
 * and calling print() there — NOT by rasterising it (Summit's old snapdom exportElementToPdf, since
 * removed — .claude/Print/PLAN_STAGE_5.md).
 *
 * See .claude/OASWorksheets/PLAN_STAGE_4.md §3 for why: that export rasterized its element
 * to a single JPEG canvas and slices that into pages, which is the wrong shape here (a worksheet
 * set is many independent tables, each needing a real repeating <thead> via
 * `display: table-header-group` — only possible on a genuine <table>, not a bitmap slice — and
 * real, searchable/selectable text rather than an image). It also hardcodes its own section-break
 * selectors to the heat map's classes.
 *
 * Printing via a fresh window sidesteps a harder problem too: Summit's CSS is injected as a
 * content-script stylesheet that loses cascade ties against Terrain's own page (DESIGN.md), so
 * `@media print { .terrain-chrome { display: none } }` rules written against Terrain's live DOM
 * are not guaranteed to win. A brand-new window contains only what this function writes into it —
 * no Terrain chrome, no cascade fight, nothing to hide.
 */

import { collectPrintFontCss, declaredPrintWeights, waitForPrintFonts } from "@/print/printFonts";
import { PRINT_PAGE_MARGIN_MM, STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX, TRANSPOSED_COLUMN_WRAP_WIDTH_PRINT_PX, TRANSPOSED_COLUMN_WIDTH_PRINT_PX } from "./worksheetPrintPageSize";

const PRINT_WINDOW_NAME = "oasWorksheetsPrint";

/**
 * SummitPrintSans is Terrain's Nunito Sans re-declared at real weights (printFonts.ts), so the
 * sheets' font-weight: 600 headers use the true semibold face. NunitoSans-regular stays next as
 * the same family the on-screen measurement (WORKSHEET_FONT_FAMILY) uses.
 */
const WORKSHEET_PRINT_FONT_STACK = '"SummitPrintSans", NunitoSans-regular, arial, sans-serif';

export type WorksheetPrintOrientation = "landscape" | "portrait";

/**
 * The print stylesheet, self-contained (no var(--summit-*)/var(--oas-vue-*) tokens — this document
 * never loads Summit's own stylesheet, only what is written here). Visual states (tick-box border,
 * awarded green, patrol tint) are restated as literal colours matching those tokens' current
 * values, since a fresh window has no access to Terrain's or Summit's CSS custom properties.
 *
 * Both layouts print landscape (PLAN_STAGE_5_LARGE_UNITS.md decision 4 dropped portrait entirely for
 * Layout A; a later attempt to print Layout B portrait specifically was reverted — requested live,
 * portrait made its output too small/cramped). `orientation` stays an explicit parameter rather than
 * a hardcoded "landscape" string so a layout-specific orientation remains easy to reintroduce later
 * if ever wanted again — every other rule below is identical regardless of orientation; only the
 * `@page` size line varies.
 */
/** Exported so a static preview/fixture (e.g. a large-unit test page outside the real extension) can reuse the exact print appearance rather than hand-duplicating it. */
export function buildPrintStylesheet(orientation: WorksheetPrintOrientation, fontCss = ""): string {
  return `
    ${fontCss}
    @page { size: A4 ${orientation}; margin: ${PRINT_PAGE_MARGIN_MM}mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ${WORKSHEET_PRINT_FONT_STACK};
      /* Print-specific exception to the --oas-vue-font-size-body 14px scale (DESIGN.md) — a
         printed form is a different medium, not a drifting screen size; 10pt is normal for one
         and leaves more room for member columns. */
      font-size: 10pt;
      color: #201f1e;
    }

    /* On-screen only — see the button's own comment in the written HTML for why it exists. */
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
      /* One sheet per Skill x Stream x Stage (PLAN.md's paging rule) — break-after AND the
         legacy page-break-after property together, since Chromium still honours the latter. */
      break-after: page;
      page-break-after: always;
    }
    table.oas-worksheet-page:last-of-type {
      break-after: auto;
      page-break-after: auto;
    }
    /* A real <thead> (not a bitmap) so it genuinely repeats if a page's own table overflows
       onto a second sheet — this only works on a real <table>, which is why Stage 3 built one. */
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
    /*
     * A real width (not a soft min/max-width range), tuned so lines wrap at ~50 characters —
     * requested live, derived in worksheetPrintPageSize.ts's STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX
     * rather than eyeballed. Word-wraps only (no overflow-wrap/word-break set), so a long word is
     * never split mid-way.
     */
    td.oas-worksheet-statement, th.oas-worksheet-group-header { text-align: left; }
    /*
     * ${STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX}px here is only a FALLBACK — OASWorksheetsVue.ts's
     * printCurrentPages() rewrites each cloned table's own .oas-worksheet-statement/.oas-worksheet-
     * cell inline widths (via rewriteColumnsLayoutWidthsForPrint) to PER-PAGE values computed
     * against this page's real member count before handing it to printWorksheets() — the inline
     * style on each cloned cell wins over this rule regardless of selector specificity, so this is
     * only ever reached by a cell that somehow didn't get an inline width.
     */
    td.oas-worksheet-statement { width: ${STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX}px; white-space: normal; }
    td.oas-worksheet-cell { min-width: 70px; text-align: center; }
    /* A date like "03/02/24" must not wrap once its cell is squeezed, which is routine once many member columns are packed onto one sheet. */
    .oas-worksheet-cell-date { white-space: nowrap; }

    /* Border around each patrol's own block of columns — same #c8c6c4/2px as the ordinary cell borders above (toned down from an earlier 3px/#405261 attempt that live feedback called too thick and intrusive). */
    .oas-worksheet-patrol-group-start { border-left: 2px solid #c8c6c4; }
    .oas-worksheet-patrol-group-end { border-right: 2px solid #c8c6c4; }
    .oas-worksheet-cell-awarded { background: #b3c9b3; }

    /*
     * Rotated header text (Layout A's group-band/member-name headers, Layout B's own I-Statement
     * headers) — must match OASWorksheetsVue.vue's own .oas-worksheet-rotated-text exactly, since
     * this is a literal clone of that live markup/classes (see printWorksheets()'s own comment).
     */
    .oas-worksheet-rotated-text {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      white-space: nowrap;
      display: inline-block;
    }

    /*
     * Layout B's I-Statement header text WRAPS (requested live — fixed font, never shrinking,
     * wrapping instead) rather than staying on one line like Layout A's own rotated headers (short,
     * fixed single words/names, never meant to wrap) — scoped to this layout's own header class so
     * Layout A's .oas-worksheet-rotated-text rule above is untouched. word-break only engages for a
     * single word that alone exceeds the column's fixed width.
     */
    th.oas-worksheet-statement-header .oas-worksheet-rotated-text {
      white-space: normal;
      word-break: break-word;
    }

    /* Layout A's rotated member-name/group-band columns — narrow width, tall header, matching the screen CSS's own 28px/140px. */
    th.oas-worksheet-member-header { width: 28px; min-width: 28px; max-width: 28px; height: 140px; padding: 6px 2px; }
    td.oas-worksheet-group-band { width: 28px; min-width: 28px; max-width: 28px; padding: 4px 2px; }

    /*
     * Layout B ("members as rows") — member-name column width is MEASURED per table (the longest
     * member name actually on it, in full — requested live: never wrap, truncate, or ellipsise a
     * name) and set inline by splitRowsTableColumnsForPrint; the 140px min-width here is only a
     * FALLBACK for a cell that somehow didn't get an inline width. I-Statement columns are a FIXED
     * width (TRANSPOSED_COLUMN_WIDTH_PRINT_PX, set inline per column by the component — same
     * fallback reasoning as Layout A's own .oas-worksheet-statement rule above), wrapping at ~50
     * characters instead of shrinking a shared font size to fit every column on one page.
     */
    th.oas-worksheet-member-name-header, td.oas-worksheet-member-name-cell { text-align: left; min-width: 140px; padding: 4px 8px; white-space: nowrap; }
    /*
     * The page TITLE lives on the group-span row's own member-name-header header cell (see
     * splitRowsTableColumnsForPrint's own comment on where the title text actually sits) - without
     * this override it inherits the generic th nowrap rule above, and a long title (e.g.
     * "Stage 1 - Bushcraft (statements 1-3 of 20)") would wrap onto an unpredictable width. Same fix
     * shape as Layout A's own .oas-worksheet-page-title override.
     */
    tr.oas-worksheet-group-span-row th.oas-worksheet-member-name-header { white-space: normal; }
    /*
     * Rotating text 90 degrees swaps which box dimension is "the ~50-char wrap LENGTH" vs "the
     * dimension that grows as more lines wrap" — see the matching comment in OASWorksheetsVue.vue
     * for the full explanation of why height carries the wrap-length number
     * (TRANSPOSED_COLUMN_WRAP_WIDTH_PRINT_PX) and width carries the multi-line budget
     * (TRANSPOSED_COLUMN_WIDTH_PRINT_PX) rather than the reverse, which an earlier version had
     * backwards and wrapped text at ~30 characters instead of the requested ~50. text-align: left
     * (requested live, replacing the browser's default centered th text) reads, in this rotated
     * frame, as hugging the near edge of the column rather than floating centered across its width.
     */
    th.oas-worksheet-statement-header { width: ${TRANSPOSED_COLUMN_WIDTH_PRINT_PX}px; min-width: ${TRANSPOSED_COLUMN_WIDTH_PRINT_PX}px; height: ${TRANSPOSED_COLUMN_WRAP_WIDTH_PRINT_PX}px; padding: 4px 2px; font-weight: normal; text-align: left; vertical-align: bottom; }
    .oas-worksheet-patrol-divider-row td { background: #f3f2f1; font-weight: 600; text-align: left; }

    /*
     * The handwritten-tick box — at least ~6mm tall in print (PLAN_STAGE_4.md §5), bigger than the
     * 18px/~5mm screen size, since a worksheet is written on with a pen.
     */
    .oas-worksheet-tick-box {
      display: inline-block;
      width: 7mm;
      height: 7mm;
      border: 1px solid #b7c2cc;
      border-radius: 1px;
    }

    /*
     * Chromium does not print background colours unless the user enables "Background graphics",
     * so the awarded green must not be the only carrier of meaning — it never is, since every
     * awarded cell also carries its date text (PLAN_STAGE_4.md §5).
     */
  `;
}

export interface PrintWorksheetsOptions {
  /** The already-rendered <table class="oas-worksheet-page"> elements, in display order. */
  pageTables: HTMLTableElement[];
  documentTitle: string;
  /** See buildPrintStylesheet's own comment — both layouts currently print landscape. */
  orientation: WorksheetPrintOrientation;
}

/**
 * Opens a new window containing a clone of each rendered worksheet table and prints it.
 * `pageTables` must come from the live DOM (not rebuilt from data here) so Stage 3's exact
 * rendering — including the patrol-tint/group-start classes computed from current filter state —
 * is reproduced faithfully rather than re-derived a second time with its own chance to drift.
 *
 * Returns false (and opens nothing) when the popup was blocked, so the caller can surface that to
 * the user rather than silently doing nothing.
 */
export function printWorksheets(options: PrintWorksheetsOptions): boolean {
  const printWindow = window.open("", PRINT_WINDOW_NAME, "width=1000,height=800");
  if (!printWindow) {
    return false;
  }

  // Focus as soon as the window exists, not just right before printing — reported live: opened
  // from inside Terrain's own page (a content-script context), the new window did not reliably
  // come to the front on its own, so the user didn't see it appear at all. Calling focus() here,
  // in addition to the one in triggerPrint below, gives the browser the best chance of raising it
  // immediately rather than only once print() is already underway.
  printWindow.focus();

  const tablesHtml = options.pageTables.map((table) => table.outerHTML).join("\n");
  // Terrain's Nunito Sans, borrowed into the print window (a new window gets none of Terrain's
  // @font-face rules, so this used to print in Arial) — the same mechanism as summit-print.
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
<!--
  A visible close affordance, since reported live: once this window lands behind the main
  browser window, there is nothing in it telling the user how to get rid of it — it has no tab
  strip of its own to close from. window.close() only works on a window the page's own script
  opened (true here), so this is reliable rather than a suggestion to use the OS window controls.
-->
<button type="button" class="oas-worksheet-print-close-btn" onclick="window.close()">Close this window</button>
${tablesHtml}
</body>
</html>`);
  printWindow.document.close();

  // Printing before the new document/fonts have finished loading can print a half-styled page —
  // wait for `load`, matching the standard "print a popup window" pattern. A short timeout is the
  // fallback for a window.open'd about:blank document whose `load` can fire before write()'s
  // content is fully parsed in some browsers — the `printed` guard stops both paths firing print()
  // if `load` does end up winning the race.
  let printed = false;
  const triggerPrint = async () => {
    if (printed || printWindow.closed) {
      return;
    }
    printed = true;
    // Fonts load asynchronously after the document is written — wait (capped) so the sheets print
    // in Nunito Sans rather than whatever had loaded by `load`/500ms.
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
