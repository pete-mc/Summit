import type { Cell, Image, Row } from "write-excel-file/browser";
import type { OverallProgressRow } from "@/pages/OasProgression/services/buildOverallProgressRows";
import type { StageProgressDisplay } from "@/pages/OasProgression/services/filterHeatMapSections";
import { buildHeaderBlock, EXCEL_COLOURS, HEADER_BLOCK_ROWS, type ExcelHeader, type ExcelSheet } from "../summitExcel";

const SHEET_NAME = "Overall";

/** Excel "characters". A stage column fits two lines of rotated header text. */
const STAGE_COLUMN_WIDTH = 5.5;
const MEMBER_WIDTH_MIN = 12;
const MEMBER_WIDTH_MAX = 40;
/** Points. */
const HEADER_POINTS_PER_CHAR = 6.5;
const HEADER_MIN_HEIGHT = 48;

export interface OverallProgressSheetInput {
  headers: Array<{ skillLabel: string; streamLabel: string | null }>;
  rows: OverallProgressRow[];
  header: ExcelHeader;
  logo: Image | null;
}

/** Gotcha: text, not a number. As a number "3.10" (10 ticks) would show as 3.1 and read as 1 tick. */
export function stageText(cell: StageProgressDisplay): string {
  return cell.nextStageProgress ? `${cell.stage}.${cell.nextStageProgress}` : cell.stage;
}

function headerRowHeight(headers: OverallProgressSheetInput["headers"]): number {
  const longest = headers.reduce((max, h) => Math.max(max, h.skillLabel.length, h.streamLabel?.length ?? 0), 0);
  return Math.max(HEADER_MIN_HEIGHT, Math.ceil(longest * HEADER_POINTS_PER_CHAR + 8));
}

function buildTableHeader(headers: OverallProgressSheetInput["headers"]): Row {
  const border = { bottomBorderStyle: "medium" as const, bottomBorderColor: EXCEL_COLOURS.headerBorder };
  const member: Cell = { value: "Member", type: String, fontWeight: "bold", alignVertical: "bottom", height: headerRowHeight(headers), ...border };
  return [member].concat(
    headers.map((h) => ({
      value: h.streamLabel ? `${h.skillLabel}\n${h.streamLabel}` : h.skillLabel,
      type: String,
      fontWeight: "bold",
      textRotation: 90,
      wrap: true,
      align: "center",
      alignVertical: "bottom",
      ...border,
    })),
  );
}

function buildMemberRow(row: OverallProgressRow): Row {
  const name: Cell = { value: row.displayName, type: String };
  return [name].concat(
    row.cells.map((cell) => {
      const text = stageText(cell);
      return { value: text, type: String, align: "center", ...(text === "-" ? { textColor: EXCEL_COLOURS.muted } : {}) };
    }),
  );
}

export function buildOverallProgressSheet(input: OverallProgressSheetInput): ExcelSheet {
  const { headers, rows, header, logo } = input;
  const longestName = rows.reduce((max, r) => Math.max(max, r.displayName.length), "Member".length);
  const columns = [{ width: Math.min(MEMBER_WIDTH_MAX, Math.max(MEMBER_WIDTH_MIN, longestName + 2)) }].concat(headers.map(() => ({ width: STAGE_COLUMN_WIDTH })));

  return {
    rows: buildHeaderBlock(header, !!logo).concat([buildTableHeader(headers)], rows.map(buildMemberRow)),
    options: {
      sheet: SHEET_NAME,
      columns,
      stickyRowsCount: HEADER_BLOCK_ROWS + 1,
      stickyColumnsCount: 1,
      images: logo ? [logo] : undefined,
    },
  };
}
