import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { snapdom } from "@zumer/snapdom";

export type GridExportRow = Record<string, unknown>;

export interface GridExportColumn {
  key: string;
  header: string;
  exportValue?: (row: GridExportRow) => unknown;
}

export interface ExcelGridExportOptions {
  fileName: string;
  title: string;
  rows: GridExportRow[];
  columns: GridExportColumn[];
}

export interface PdfGridExportOptions {
  fileName: string;
  title: string;
  rows: GridExportRow[];
  columns: GridExportColumn[];
  orientation?: "portrait" | "landscape";
}

const normalizeValue = (value: unknown): string | number | boolean => {
  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  return String(value);
};

export const buildExportRows = (rows: GridExportRow[], columns: GridExportColumn[]): Record<string, string | number | boolean>[] => {
  return rows.map((row) => {
    return columns.reduce(
      (accumulator, column) => {
        const resolvedValue = column.exportValue ? column.exportValue(row) : row[column.key];
        accumulator[column.header] = normalizeValue(resolvedValue);
        return accumulator;
      },
      {} as Record<string, string | number | boolean>,
    );
  });
};

export const exportGridToExcel = (options: ExcelGridExportOptions): void => {
  const exportRows = buildExportRows(options.rows, options.columns);
  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options.title);
  XLSX.writeFile(workbook, options.fileName);
};

export interface ElementPdfExportOptions {
  element: HTMLElement;
  fileName: string;
  title: string;
  orientation?: "portrait" | "landscape";
}

const PAGE_MARGIN_MM = 4;
const TITLE_HEIGHT_MM = 8;
const JPEG_QUALITY = 0.82;
/** Below this, a trailing slice is leftover sub-pixel rounding (e.g. a border a fraction of a px
 *  past the last row's measured bottom) rather than real content — skip it instead of emitting
 *  an extra near-blank page. */
const MIN_TRAILING_SLICE_PX = 4;

/**
 * Crops a horizontal strip out of a source canvas into its own canvas, at 1:1 source pixels.
 * Used so each PDF page embeds only the slice it shows, rather than the whole rasterized image
 * being re-embedded on every page (which previously produced a 100+ MB PDF for a tall heat map).
 */
const cropCanvas = (source: HTMLCanvasElement, sourceY: number, sourceHeight: number): HTMLCanvasElement => {
  const slice = document.createElement("canvas");
  slice.width = source.width;
  slice.height = sourceHeight;
  const context = slice.getContext("2d");
  // JPEG has no alpha channel, so anything the source canvas left transparent would otherwise
  // encode as black — paint white behind the slice first to match the page background.
  if (context) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, slice.width, slice.height);
  }
  context?.drawImage(source, 0, sourceY, source.width, sourceHeight, 0, 0, source.width, sourceHeight);
  return slice;
};

/**
 * Top-level section heading: a skill when grouped by skill, a member when grouped by member.
 * Breaking here keeps a whole section — heading plus all its rows — together on one page.
 */
const SECTION_HEADING_ROW_SELECTOR = ".oas-heatmap-skill-title-row";

/**
 * Sub-heading within a section: a patrol row, which only appears with "Break by patrol" on.
 *
 * Deliberately RANKED BELOW the section heading rather than treated as equivalent. When both were
 * in one selector, a patrol row counted as a section boundary, so the algorithm would happily
 * break right before one — splitting a skill across pages and stranding its heading at the foot
 * of the previous page with nothing beneath it. A patrol is a subdivision *within* a skill, so it
 * is only an acceptable break point when the skill itself is too tall to fit whole.
 */
const SUB_HEADING_ROW_SELECTOR = ".oas-heatmap-patrol-title-row";

interface RowBreakPoints {
  /** Section boundaries only (right before each top-level heading, and the table's end) — tried
   *  first, so a whole skill or member section stays on one page whenever it fits. */
  sectionBreaksPx: number[];
  /** Section boundaries plus patrol sub-headings — tried second, so an oversized skill splits at
   *  a patrol rather than mid-patrol. Only differs from sectionBreaksPx when "Break by patrol"
   *  is on. */
  subSectionBreaksPx: number[];
  /** Every row boundary — the last resort when not even one sub-section fits within a page, so a
   *  page still never cuts a row in half. */
  rowBreaksPx: number[];
}

/**
 * Y-positions (in element CSS pixels, relative to the element's own top) that a page break may
 * land on, in three tiers — see RowBreakPoints. Empty arrays for a non-table element just mean
 * pagination behaves as a plain pixel slice.
 */
const getRowBreakPoints = (element: HTMLElement): RowBreakPoints => {
  const rows = Array.from(element.querySelectorAll("tr"));
  if (rows.length === 0) {
    return { sectionBreaksPx: [], subSectionBreaksPx: [], rowBreaksPx: [] };
  }

  const containerTop = element.getBoundingClientRect().top;
  const rowBottomPx = (row: Element) => row.getBoundingClientRect().bottom - containerTop;

  // A break lands on the bottom of the row BEFORE a heading, never after one — otherwise the
  // heading is stranded at the foot of a page, separated from the rows it introduces.
  const sectionBreaksPx: number[] = [];
  const subSectionBreaksPx: number[] = [];
  rows.forEach((row, index) => {
    if (index === 0) {
      return;
    }
    const previousBottom = rowBottomPx(rows[index - 1]);
    if (row.matches(SECTION_HEADING_ROW_SELECTOR)) {
      sectionBreaksPx.push(previousBottom);
      subSectionBreaksPx.push(previousBottom);
    } else if (row.matches(SUB_HEADING_ROW_SELECTOR)) {
      subSectionBreaksPx.push(previousBottom);
    }
  });

  const tableBottom = rowBottomPx(rows[rows.length - 1]);
  sectionBreaksPx.push(tableBottom);
  subSectionBreaksPx.push(tableBottom);

  const rowBreaksPx = rows.map(rowBottomPx);

  return { sectionBreaksPx, subSectionBreaksPx, rowBreaksPx };
};

/**
 * Largest break point that still fits within `maxHeightPx` of `sourceY`, in descending order of
 * preference:
 *
 *   1. a section boundary    — keeps a whole skill (or member) section on one page
 *   2. a sub-section boundary — splits an oversized skill at a patrol rather than mid-patrol
 *   3. any row boundary       — never cuts a row in half
 *   4. the raw pixel limit    — when not even one row fits
 *
 * Tier 2 exists because patrol rows used to share tier 1: a patrol counted as a section boundary,
 * so a skill would be split across pages with its heading stranded at the foot of the previous
 * one, even when the whole skill would have fitted on the next page.
 */
const resolveSliceHeightPx = (sourceY: number, maxHeightPx: number, canvasHeightPx: number, breaks: RowBreakPoints, scale: number): number => {
  // Guarantees forward progress even if maxHeightPx rounds to (near) zero on a very small page.
  const hardLimitPx = Math.max(1, Math.min(maxHeightPx, canvasHeightPx - sourceY));
  const sourceYUnscaled = sourceY / scale;
  const maxUnscaled = sourceYUnscaled + hardLimitPx / scale;

  const fitsWithinPage = (breakPoint: number) => breakPoint > sourceYUnscaled + 1 && breakPoint <= maxUnscaled;

  const bestBreakUnscaled = breaks.sectionBreaksPx.filter(fitsWithinPage).pop() ?? breaks.subSectionBreaksPx.filter(fitsWithinPage).pop() ?? breaks.rowBreaksPx.filter(fitsWithinPage).pop();

  if (bestBreakUnscaled === undefined) {
    return hardLimitPx;
  }

  return Math.round((bestBreakUnscaled - sourceYUnscaled) * scale);
};

export const exportElementToPdf = async (options: ElementPdfExportOptions): Promise<void> => {
  const scale = 2;

  // Uses SnapDOM (not html2canvas) to rasterize the element. html2canvas reimplements CSS
  // layout/painting itself and has known gaps in modern CSS (notably flexbox `gap`, which the
  // heat map's stage-square cells rely on) plus fragile window/scroll-offset handling for
  // elements not already at the top of the page. SnapDOM renders through the browser's own SVG
  // <foreignObject> pipeline by default and captures the element's full size directly — no
  // window/viewport bounds math to get wrong. It also fetches and inlines <img> sources itself
  // (see `fallbackURL` in its options) rather than relying on the browser to paint a cross-origin
  // bitmap in place, so unlike html2canvas it does not taint the canvas on the extension's own
  // chrome-extension:// skill icons — no need to exclude them from the capture.
  const canvas = await snapdom.toCanvas(options.element, {
    scale,
    backgroundColor: "#ffffff",
  });

  // Row/section boundaries are measured on the live element (CSS pixels) before any page math,
  // so a page break can be snapped to a section boundary (falling back to a row boundary) instead
  // of an arbitrary pixel count that may land mid-row or split a skill/patrol section in two.
  const rowBreaks = getRowBreakPoints(options.element);

  const doc = new jsPDF({ orientation: options.orientation ?? "landscape", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const contentWidthMm = pageWidth - PAGE_MARGIN_MM * 2;
  const pixelsPerMm = canvas.width / contentWidthMm;

  const firstPageContentHeightMm = pageHeight - PAGE_MARGIN_MM * 2 - TITLE_HEIGHT_MM;
  const laterPageContentHeightMm = pageHeight - PAGE_MARGIN_MM * 2;

  const titleFontSize = doc.getFontSize();
  doc.text(options.title, PAGE_MARGIN_MM, PAGE_MARGIN_MM + 4);

  const asOfLabel = `As of ${new Date().toLocaleDateString()}`;
  doc.setFontSize(titleFontSize / 2);
  doc.text(asOfLabel, pageWidth - PAGE_MARGIN_MM, PAGE_MARGIN_MM + 4, { align: "right" });
  doc.setFontSize(titleFontSize);

  let sourceY = 0;
  let isFirstPage = true;

  while (canvas.height - sourceY >= MIN_TRAILING_SLICE_PX) {
    const availableHeightMm = isFirstPage ? firstPageContentHeightMm : laterPageContentHeightMm;
    const maxHeightPx = Math.round(availableHeightMm * pixelsPerMm);
    const sliceHeightPx = resolveSliceHeightPx(sourceY, maxHeightPx, canvas.height, rowBreaks, scale);

    if (!isFirstPage) {
      doc.addPage();
    }

    const slice = cropCanvas(canvas, sourceY, sliceHeightPx);
    const sliceHeightMm = sliceHeightPx / pixelsPerMm;
    const yOffsetMm = isFirstPage ? PAGE_MARGIN_MM + TITLE_HEIGHT_MM : PAGE_MARGIN_MM;

    doc.addImage(slice.toDataURL("image/jpeg", JPEG_QUALITY), "JPEG", PAGE_MARGIN_MM, yOffsetMm, contentWidthMm, sliceHeightMm);

    sourceY += sliceHeightPx;
    isFirstPage = false;
  }

  doc.save(options.fileName);
};

export const exportGridToPdf = (options: PdfGridExportOptions): void => {
  const doc = new jsPDF({ orientation: options.orientation ?? "portrait" });
  const head = [options.columns.map((column) => column.header)];
  const body = options.rows.map((row) => {
    return options.columns.map((column) => normalizeValue(column.exportValue ? column.exportValue(row) : row[column.key]));
  });

  doc.text(options.title, 14, 14);
  autoTable(doc, {
    head,
    body,
    startY: 20,
    styles: {
      fontSize: 9,
    },
    headStyles: {
      fontStyle: "bold",
    },
  });
  doc.save(options.fileName);
};
