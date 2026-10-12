import writeXlsxFile from "write-excel-file/browser";
import type { Cell, Image, Row, SheetOptions } from "write-excel-file/browser";
import { resolveHeaderFooter, type MetaEntry } from "@/print/summitPrint";
import { createLogger } from "@/helpers/Logger";

const logger = createLogger("summitExcel");

/**
 * summit-excel: formatted spreadsheet export (.claude/Excel/PLAN.md). The counterpart of
 * src/print/: each table gets a sheet builder (src/excel/sheets/) that turns the page's own row
 * data into cells; this file holds what every sheet shares: the header block (same wording as the
 * printout), the section logo, colours, the file name and the download.
 *
 * Sheets are built from data, not by reading the screen, so numbers stay numbers in Excel.
 */

/**
 * Fixed copies of the screen's status colours (src/styles/index.css). Excel can't read CSS
 * variables, so a change there must be copied here too (noted in .claude/DESIGN.md).
 */
export const EXCEL_COLOURS = {
  /** Every box in a group met: --summit-color-status-awarded (= --summit-color-bg-primary). */
  allMet: "#004c00",
  /** One box met: --summit-color-status-answered. */
  met: "#ecb206",
  /** Box not met: --summit-color-status-unanswered. */
  notMet: "#edebe9",
  /** Header rule and the not-started bar's outline: --summit-color-border-default. */
  headerBorder: "#c8c6c4",
  /** Section title rows (skill or member): --summit-color-status-unanswered, as on screen. */
  sectionRow: "#edebe9",
  /** Patrol title rows: --summit-color-bg-muted. */
  patrolRow: "#f3f2f1",
  /** Meta line text. */
  muted: "#555555",
};

/** Windows forbids these in file names; a unit name containing one would break the download. */
const FORBIDDEN_FILE_CHARS = /[\\/:*?"<>|]/g;

/**
 * "Summit - OAS Progression - Summary - {Unit} - 20261012.xlsx" (user, 2026-10-12). Empty parts
 * (e.g. no unit name yet) are dropped rather than leaving "- -" in the name.
 */
export function buildExcelFileName(parts: string[], when: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  const stamp = `${when.getFullYear()}${pad(when.getMonth() + 1)}${pad(when.getDate())}`;
  const cleaned = parts.map((p) => p.replace(FORBIDDEN_FILE_CHARS, "-").trim()).filter((p) => p !== "");
  return `${["Summit"].concat(cleaned, [stamp]).join(" - ")}.xlsx`;
}

export interface ExcelHeader {
  title: string;
  subtitle: string;
  /** "Patrol: All · Generated: 12/10/2026, 2:05 pm", same entries as the printout's meta line. */
  metaLine: string;
}

/**
 * The header text for a sheet, resolved by summit-print from the same profile, so the spreadsheet
 * and the printout say exactly the same thing.
 */
export function resolveExcelHeader(printProfile: string, meta: MetaEntry[] | undefined, vars: Record<string, string>, generated: Date): ExcelHeader {
  const { header } = resolveHeaderFooter({ profile: printProfile, meta, vars, generated });
  return {
    title: header.title,
    subtitle: header.subtitle,
    metaLine: header.meta.map((m) => `${m.label}: ${m.value}`).join(" · "),
  };
}

/** Rows the header block occupies (title, subtitle, meta, spacer). */
export const HEADER_BLOCK_ROWS = 4;

/**
 * The rows above the table. With a logo, the text starts in column B so it sits beside the logo
 * (which floats over column A); without one it starts in column A.
 */
export function buildHeaderBlock(header: ExcelHeader, hasLogo: boolean): Row[] {
  const lead: Cell[] = hasLogo ? [null] : [];
  return [
    lead.concat([{ value: header.title, type: String, fontWeight: "bold", fontSize: 16, height: 24 }]),
    lead.concat([{ value: header.subtitle, type: String, fontSize: 12 }]),
    lead.concat([{ value: header.metaLine, type: String, fontSize: 10, textColor: EXCEL_COLOURS.muted }]),
    [{ value: "", type: String, height: 18 }],
  ];
}

/** Logo height on the sheet, about the height of the header block (the Stage 0 sample's size). */
const LOGO_HEIGHT_PX = 94;

/**
 * The section logo as an embedded image, or null (no section, no extension URL, or the fetch
 * failed). Never fails the export: a spreadsheet without the logo beats no spreadsheet.
 */
export async function loadSectionLogoImage(url: string | null): Promise<Image | null> {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const size = await createImageBitmap(blob);
    const { width, height } = size;
    size.close();
    return {
      content: blob,
      contentType: blob.type || (/\.png$/i.test(url) ? "image/png" : "image/jpeg"),
      width,
      height,
      // write-excel-file sizes images by pixels / dpi; this dpi makes the logo LOGO_HEIGHT_PX tall.
      dpi: (height * 96) / LOGO_HEIGHT_PX,
      anchor: { row: 1, column: 1 },
      offsetX: 4,
      offsetY: 4,
      title: "Section logo",
    };
  } catch (err) {
    logger.warn("Section logo left out of the spreadsheet:", err);
    return null;
  }
}

export interface ExcelSheet {
  rows: Row[];
  options: SheetOptions<File | Blob | ArrayBuffer>;
}

/** Writes the workbook and starts the browser download. */
export async function downloadWorkbook(sheet: ExcelSheet, fileName: string): Promise<void> {
  await writeXlsxFile(sheet.rows, sheet.options).toFile(fileName);
}

/** Writes the workbook to a Blob (tests, and anything that needs the bytes rather than a download). */
export function workbookToBlob(sheet: ExcelSheet): Promise<Blob> {
  return writeXlsxFile(sheet.rows, sheet.options).toBlob();
}
