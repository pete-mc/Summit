import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
