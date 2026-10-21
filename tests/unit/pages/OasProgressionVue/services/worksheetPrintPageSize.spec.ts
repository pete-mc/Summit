import {
  maxFittingMemberColumns,
  maxFittingTransposedColumns,
  computeColumnsLayoutMetrics,
  memberNameColumnWidthPx,
  MEMBER_COLUMN_MIN_WIDTH_PX,
  STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX,
  PRINT_USABLE_WIDTH_PX,
  GROUP_BAND_COLUMN_WIDTH_PRINT_PX,
  STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX,
  STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX,
  TRANSPOSED_COLUMN_WRAP_WIDTH_PRINT_PX,
  TRANSPOSED_COLUMN_WRAP_WIDTH_SCREEN_PX,
  TRANSPOSED_COLUMN_WIDTH_PRINT_PX,
  TRANSPOSED_COLUMN_MAX_WRAP_LINES,
  TRANSPOSED_COLUMN_LINE_WIDTH_SCREEN_PX,
  TRANSPOSED_COLUMN_LINE_WIDTH_PRINT_PX,
  WORKSHEET_FONT_FAMILY,
  WORKSHEET_BODY_FONT_SIZE_SCREEN_PX,
  MAX_FITTING_MEMBER_COLUMNS,
} from "@/pages/OasProgressionVue/services/worksheetPrintPageSize";

describe("maxFittingMemberColumns", () => {
  it("matches the pre-computed MAX_FITTING_MEMBER_COLUMNS constant when called with print's own numbers", () => {
    expect(maxFittingMemberColumns(PRINT_USABLE_WIDTH_PX, GROUP_BAND_COLUMN_WIDTH_PRINT_PX, STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX)).toBe(MAX_FITTING_MEMBER_COLUMNS);
  });

  it("is a straightforward floor-division of the leftover width by the member minimum", () => {
    expect(maxFittingMemberColumns(1000, 100, 200)).toBe(Math.floor((1000 - 100 - 200) / MEMBER_COLUMN_MIN_WIDTH_PX));
  });

  it("can come out zero or negative for a very narrow usable width, without throwing", () => {
    expect(maxFittingMemberColumns(50, 28, 333)).toBeLessThanOrEqual(0);
  });
});

describe("computeColumnsLayoutMetrics", () => {
  const USABLE = PRINT_USABLE_WIDTH_PX; // ~1047px — a realistic sheet/viewport width
  const GROUP_BAND = GROUP_BAND_COLUMN_WIDTH_PRINT_PX; // 28px

  it("gives the relaxed statement width and evenly-stretched member columns when there's plenty of room", () => {
    const metrics = computeColumnsLayoutMetrics(USABLE, GROUP_BAND, 3, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.statementWidthPx).toBe(STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.memberColumnWidthPx).toBeGreaterThan(MEMBER_COLUMN_MIN_WIDTH_PX);
    // 3 members x memberColumnWidthPx + GROUP_BAND + statement must not exceed the usable width.
    expect(GROUP_BAND + metrics.statementWidthPx + 3 * metrics.memberColumnWidthPx).toBeLessThanOrEqual(USABLE);
  });

  it("falls back member columns to their bare minimum once the relaxed statement width leaves no room to stretch them", () => {
    // A large member count leaves little slack even with the statement column at its relaxed width.
    const metrics = computeColumnsLayoutMetrics(USABLE, GROUP_BAND, MAX_FITTING_MEMBER_COLUMNS, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.memberColumnWidthPx).toBe(MEMBER_COLUMN_MIN_WIDTH_PX);
    // Whatever's left over (above the squeezed wrap width) goes to the statement column instead of being wasted.
    expect(metrics.statementWidthPx).toBeGreaterThanOrEqual(MEMBER_COLUMN_MIN_WIDTH_PX);
    expect(metrics.statementWidthPx).toBeLessThanOrEqual(STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
  });

  it("never returns a member column width below the minimum, even at the fitting threshold", () => {
    const metrics = computeColumnsLayoutMetrics(USABLE, GROUP_BAND, MAX_FITTING_MEMBER_COLUMNS, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.memberColumnWidthPx).toBeGreaterThanOrEqual(MEMBER_COLUMN_MIN_WIDTH_PX);
  });

  it("handles zero members by returning the relaxed statement width and the minimum member width, without dividing by zero", () => {
    const metrics = computeColumnsLayoutMetrics(USABLE, GROUP_BAND, 0, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.statementWidthPx).toBe(STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.memberColumnWidthPx).toBe(MEMBER_COLUMN_MIN_WIDTH_PX);
  });

  it("a page exactly at the fitting threshold ends up with no slack (member columns at the minimum)", () => {
    const metrics = computeColumnsLayoutMetrics(USABLE, GROUP_BAND, MAX_FITTING_MEMBER_COLUMNS, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.memberColumnWidthPx).toBe(MEMBER_COLUMN_MIN_WIDTH_PX);
  });
});

describe("TRANSPOSED_COLUMN_WRAP_WIDTH_SCREEN_PX / _PRINT_PX (Layout B's rotated text wrap LENGTH)", () => {
  it("reuses Layout A's own ~50-char statement wrap-width numbers rather than a third, independent figure", () => {
    expect(TRANSPOSED_COLUMN_WRAP_WIDTH_SCREEN_PX).toBe(STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX);
    expect(TRANSPOSED_COLUMN_WRAP_WIDTH_PRINT_PX).toBe(STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX);
  });
});

describe("TRANSPOSED_COLUMN_WIDTH_SCREEN_PX / _PRINT_PX (Layout B's column WIDTH — the multi-line axis)", () => {
  it("is TRANSPOSED_COLUMN_MAX_WRAP_LINES lines' worth of the per-line width", () => {
    expect(TRANSPOSED_COLUMN_WIDTH_PRINT_PX).toBe(TRANSPOSED_COLUMN_LINE_WIDTH_PRINT_PX * TRANSPOSED_COLUMN_MAX_WRAP_LINES);
  });

  it("screen and print each have their own, independent per-line width", () => {
    expect(TRANSPOSED_COLUMN_LINE_WIDTH_SCREEN_PX).toBeGreaterThan(0);
    expect(TRANSPOSED_COLUMN_LINE_WIDTH_PRINT_PX).toBeGreaterThan(0);
  });
});

describe("maxFittingTransposedColumns (Layout B's own column-fitting formula)", () => {
  it("divides the remaining width (after the member-name column) by the I-Statement column's own width — NOT maxFittingMemberColumns' fixed member-column divisor", () => {
    const maxColumns = maxFittingTransposedColumns(1200, 140, TRANSPOSED_COLUMN_WIDTH_PRINT_PX);
    expect(maxColumns).toBe(Math.floor((1200 - 140) / TRANSPOSED_COLUMN_WIDTH_PRINT_PX));
  });

  it("computes a sensible, positive column count for Layout B's landscape print budget", () => {
    const maxColumns = maxFittingTransposedColumns(PRINT_USABLE_WIDTH_PX, 140, TRANSPOSED_COLUMN_WIDTH_PRINT_PX);
    expect(maxColumns).toBeGreaterThan(0);
  });

  it("can come out zero or negative for a very narrow usable width, without throwing", () => {
    expect(maxFittingTransposedColumns(50, 140, TRANSPOSED_COLUMN_WIDTH_PRINT_PX)).toBeLessThanOrEqual(0);
  });
});

describe("memberNameColumnWidthPx (Layout B's measured, never-wrapped member-name column)", () => {
  // Deterministic fake measurer (real canvas measurement isn't available in jsdom) — one unit of
  // width per character, so expected widths are easy to compute by hand in these tests.
  const fakeMeasure = (text: string) => text.length * 10;

  it("sizes to the longest name plus padding, not the shortest or an average", () => {
    const width = memberNameColumnWidthPx(["Jo", "Alexandra Montgomery-Smith", "Beth"], WORKSHEET_BODY_FONT_SIZE_SCREEN_PX, WORKSHEET_FONT_FAMILY, fakeMeasure);
    const longestNameWidth = "Alexandra Montgomery-Smith".length * 10;
    expect(width).toBeGreaterThan(longestNameWidth);
  });

  it("never truncates — the returned width is always enough to fit the longest name in full", () => {
    const names = ["A Reasonably Long Member Name"];
    const width = memberNameColumnWidthPx(names, WORKSHEET_BODY_FONT_SIZE_SCREEN_PX, WORKSHEET_FONT_FAMILY, fakeMeasure);
    expect(width).toBeGreaterThanOrEqual(fakeMeasure(names[0]));
  });

  it("floors at a sensible minimum for an empty list or very short names", () => {
    const width = memberNameColumnWidthPx([], WORKSHEET_BODY_FONT_SIZE_SCREEN_PX, WORKSHEET_FONT_FAMILY, fakeMeasure);
    expect(width).toBeGreaterThan(0);
  });
});
