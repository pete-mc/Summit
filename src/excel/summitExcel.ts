import writeXlsxFile from "write-excel-file/browser";
import type { Cell, Image, Row, SheetOptions } from "write-excel-file/browser";
import { resolveHeaderFooter, type MetaEntry } from "@/print/summitPrint";
import { getTerrainPrintContext } from "@/print/printContext";
import { createLogger } from "@/helpers/Logger";

const logger = createLogger("summitExcel");

/** Sheets are built from data, not by reading the screen, so numbers stay numbers in Excel. */

/** Gotcha: copies of the screen's status colours (src/styles/index.css). Excel can't read CSS variables; change both. */
export const EXCEL_COLOURS = {
  allMet: "#004c00",
  met: "#ecb206",
  notMet: "#edebe9",
  headerBorder: "#c8c6c4",
  sectionRow: "#edebe9",
  mutedRow: "#f3f2f1",
  muted: "#555555",
  /** White borders read as the gap between squares. */
  squareBorder: "#ffffff",
};

/** Outlined on its outside edge only, so it reads as one shape. */
export function outlinedBar(width: number, fill: string, outline: string): Cell[] {
  return Array.from({ length: width }, (_, i) => ({
    value: "",
    type: String,
    backgroundColor: fill,
    topBorderStyle: "thin" as const,
    topBorderColor: outline,
    bottomBorderStyle: "thin" as const,
    bottomBorderColor: outline,
    ...(i === 0 ? { leftBorderStyle: "thin" as const, leftBorderColor: outline } : {}),
    ...(i === width - 1 ? { rightBorderStyle: "thin" as const, rightBorderColor: outline } : {}),
  }));
}

const FORBIDDEN_FILE_CHARS = /[\\/:*?"<>|]/g;

/** Empty parts are dropped rather than leaving "- -". */
export function buildExcelFileName(parts: string[], when: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  const stamp = `${when.getFullYear()}${pad(when.getMonth() + 1)}${pad(when.getDate())}`;
  const cleaned = parts.map((p) => p.replace(FORBIDDEN_FILE_CHARS, "-").trim()).filter((p) => p !== "");
  return `${["Summit"].concat(cleaned, [stamp]).join(" - ")}.xlsx`;
}

export interface ExcelHeader {
  title: string;
  subtitle: string;
  metaLine: string;
}

/** Resolved by summit-print, so the sheet and the printout say the same thing. */
export function resolveExcelHeader(printProfile: string, meta: MetaEntry[] | undefined, vars: Record<string, string>, generated: Date): ExcelHeader {
  const { header } = resolveHeaderFooter({ profile: printProfile, meta, vars, generated });
  return {
    title: header.title,
    subtitle: header.subtitle,
    metaLine: header.meta.map((m) => `${m.label}: ${m.value}`).join(" · "),
  };
}

export const HEADER_BLOCK_ROWS = 4;

/** With a logo (floating over column A), text starts in column B. */
export function buildHeaderBlock(header: ExcelHeader, hasLogo: boolean): Row[] {
  const lead: Cell[] = hasLogo ? [null] : [];
  return [
    lead.concat([{ value: header.title, type: String, fontWeight: "bold", fontSize: 16, height: 24 }]),
    lead.concat([{ value: header.subtitle, type: String, fontSize: 12 }]),
    lead.concat([{ value: header.metaLine, type: String, fontSize: 10, textColor: EXCEL_COLOURS.muted }]),
    [{ value: "", type: String, height: 18 }],
  ];
}

const LOGO_HEIGHT_PX = 94;

/** Never fails the export: no logo beats no spreadsheet. */
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

export async function downloadWorkbook(sheet: ExcelSheet, fileName: string): Promise<void> {
  await writeXlsxFile(sheet.rows, sheet.options).toFile(fileName);
}

export function workbookToBlob(sheet: ExcelSheet): Promise<Blob> {
  return writeXlsxFile(sheet.rows, sheet.options).toBlob();
}

export interface ExcelExportRequest {
  printProfile: string;
  meta?: MetaEntry[];
  fileNameParts: string[];
  build: (header: ExcelHeader, logo: Image | null) => ExcelSheet;
}

/** One timestamp for header and file name. Throws on failure so the page can report it. */
export async function exportExcelSheet(request: ExcelExportRequest): Promise<void> {
  const generated = new Date();
  const context = getTerrainPrintContext();
  const header = resolveExcelHeader(request.printProfile, request.meta, context.vars, generated);
  const sheet = request.build(header, await loadSectionLogoImage(context.logo));
  await downloadWorkbook(sheet, buildExcelFileName(request.fileNameParts.concat([context.vars.unit]), generated));
}

/** Gotcha: built at UTC midnight. write-excel-file counts days in UTC, so local midnight in Australia shows the day before. */
export function parseDisplayDate(text: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  // Rejects impossible dates (31/02 would roll into March).
  return date.getUTCDate() === day && date.getUTCMonth() === month - 1 ? date : null;
}

export const EXCEL_DATE_FORMAT = "dd/mm/yyyy";
