import { measureLongestTextWidthPx } from "./fitRotatedHeaderFont";

const A4_LANDSCAPE_WIDTH_MM = 297;
const CSS_PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;
const PRINT_PAGE_MARGIN_MM = 10;

function mmToPx(mm: number): number {
  return (mm / MM_PER_INCH) * CSS_PX_PER_INCH;
}

export const PRINT_USABLE_WIDTH_PX = Math.round(mmToPx(A4_LANDSCAPE_WIDTH_MM - PRINT_PAGE_MARGIN_MM * 2));

/**
 * ~50 characters at ~0.5em per glyph of 14px body text.
 * Must be a real `width`, not a min/max range, or the table stretches the column on small units.
 */
export const STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX = 350;
export const STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX = 420;

/** Gotcha: duplicates OASWorksheetsVue.vue's CSS. Change both together. */
export const GROUP_BAND_COLUMN_WIDTH_SCREEN_PX = 70;
export const MEMBER_COLUMN_MIN_WIDTH_PX = 70;

/**
 * Learning: rotating member headers does not fit more columns, because column width is set by the
 * body content (a date or tick-box), not the header.
 */
export function maxFittingMemberColumns(usableWidthPx: number, groupBandWidthPx: number, statementWidthPx: number): number {
  return Math.floor((usableWidthPx - groupBandWidthPx - statementWidthPx) / MEMBER_COLUMN_MIN_WIDTH_PX);
}

export interface ColumnsLayoutMetrics {
  statementWidthPx: number;
  memberColumnWidthPx: number;
}

/** Member columns stay at their minimum width. Spare space is left empty rather than spreading a few members across the page. */
export function computeColumnsLayoutMetrics(usableWidthPx: number, groupBandWidthPx: number, memberCount: number, relaxedStatementMaxWidthPx: number): ColumnsLayoutMetrics {
  const remainingForStatementAtMinMemberWidth = usableWidthPx - groupBandWidthPx - memberCount * MEMBER_COLUMN_MIN_WIDTH_PX;
  return {
    statementWidthPx: Math.min(relaxedStatementMaxWidthPx, Math.max(MEMBER_COLUMN_MIN_WIDTH_PX, remainingForStatementAtMinMemberWidth)),
    memberColumnWidthPx: MEMBER_COLUMN_MIN_WIDTH_PX,
  };
}

export const WORKSHEET_FONT_FAMILY = "NunitoSans-regular, arial, sans-serif";
export const WORKSHEET_BODY_FONT_SIZE_SCREEN_PX = 14;

const MEMBER_NAME_CELL_HORIZONTAL_PADDING_PX = 16;
const MEMBER_NAME_COLUMN_MIN_WIDTH_PX = 80;

/** Call once per unsplit page and reuse for every batch, so split tables line up. */
export function memberNameColumnWidthPx(displayNames: string[], fontSizePx: number, fontFamily: string, measureWidthPx?: (text: string, fontSizePx: number, fontFamily: string) => number): number {
  const longestNameWidthPx = measureWidthPx ? measureLongestTextWidthPx(displayNames, fontSizePx, fontFamily, measureWidthPx) : measureLongestTextWidthPx(displayNames, fontSizePx, fontFamily);
  return Math.max(MEMBER_NAME_COLUMN_MIN_WIDTH_PX, Math.ceil(longestNameWidthPx) + MEMBER_NAME_CELL_HORIZONTAL_PADDING_PX);
}

/** Three lines of rotated I-statement text. */
export const TRANSPOSED_COLUMN_WIDTH_SCREEN_PX = 72;

export function maxFittingTransposedColumns(usableWidthPx: number, memberNameColumnWidthPx: number, columnWidthPx: number): number {
  return Math.floor((usableWidthPx - memberNameColumnWidthPx) / columnWidthPx);
}
