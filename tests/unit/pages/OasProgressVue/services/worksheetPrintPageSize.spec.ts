import {
  maxFittingMemberColumns,
  maxFittingTransposedColumns,
  computeColumnsLayoutMetrics,
  memberNameColumnWidthPx,
  MEMBER_COLUMN_MIN_WIDTH_PX,
  STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX,
  PRINT_USABLE_WIDTH_PX,
  GROUP_BAND_COLUMN_WIDTH_SCREEN_PX,
  TRANSPOSED_COLUMN_WIDTH_SCREEN_PX,
  WORKSHEET_FONT_FAMILY,
  WORKSHEET_BODY_FONT_SIZE_SCREEN_PX,
} from "@/pages/OasProgressVue/services/worksheetPrintPageSize";

describe("maxFittingMemberColumns", () => {
  it("is a straightforward floor-division of the leftover width by the member minimum", () => {
    expect(maxFittingMemberColumns(1000, 100, 200)).toBe(Math.floor((1000 - 100 - 200) / MEMBER_COLUMN_MIN_WIDTH_PX));
  });

  it("can come out zero or negative for a very narrow usable width, without throwing", () => {
    expect(maxFittingMemberColumns(50, 28, 333)).toBeLessThanOrEqual(0);
  });
});

describe("computeColumnsLayoutMetrics", () => {
  const USABLE = PRINT_USABLE_WIDTH_PX;
  const GROUP_BAND = GROUP_BAND_COLUMN_WIDTH_SCREEN_PX;

  // Spreading 3 members across the whole width looked wrong; spare space is left empty instead.
  it("keeps member columns at the minimum width even when there's plenty of room", () => {
    const metrics = computeColumnsLayoutMetrics(USABLE, GROUP_BAND, 3, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.statementWidthPx).toBe(STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.memberColumnWidthPx).toBe(MEMBER_COLUMN_MIN_WIDTH_PX);
  });

  it("narrows the statement column, never below the minimum, once members use up the width", () => {
    const fitting = maxFittingMemberColumns(USABLE, GROUP_BAND, 350);
    const metrics = computeColumnsLayoutMetrics(USABLE, GROUP_BAND, fitting, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.memberColumnWidthPx).toBe(MEMBER_COLUMN_MIN_WIDTH_PX);
    expect(metrics.statementWidthPx).toBeLessThanOrEqual(STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(GROUP_BAND + metrics.statementWidthPx + fitting * metrics.memberColumnWidthPx).toBeLessThanOrEqual(USABLE);
    expect(computeColumnsLayoutMetrics(USABLE, GROUP_BAND, 100, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX).statementWidthPx).toBe(MEMBER_COLUMN_MIN_WIDTH_PX);
  });

  it("handles zero members", () => {
    const metrics = computeColumnsLayoutMetrics(USABLE, GROUP_BAND, 0, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.statementWidthPx).toBe(STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
    expect(metrics.memberColumnWidthPx).toBe(MEMBER_COLUMN_MIN_WIDTH_PX);
  });
});

describe("maxFittingTransposedColumns (Layout B's own column-fitting formula)", () => {
  it("divides the remaining width (after the member-name column) by the I-Statement column's own width — NOT maxFittingMemberColumns' fixed member-column divisor", () => {
    const maxColumns = maxFittingTransposedColumns(1200, 140, TRANSPOSED_COLUMN_WIDTH_SCREEN_PX);
    expect(maxColumns).toBe(Math.floor((1200 - 140) / TRANSPOSED_COLUMN_WIDTH_SCREEN_PX));
  });

  it("computes a sensible, positive column count for an A4 landscape width", () => {
    const maxColumns = maxFittingTransposedColumns(PRINT_USABLE_WIDTH_PX, 140, TRANSPOSED_COLUMN_WIDTH_SCREEN_PX);
    expect(maxColumns).toBeGreaterThan(0);
  });

  it("can come out zero or negative for a very narrow usable width, without throwing", () => {
    expect(maxFittingTransposedColumns(50, 140, TRANSPOSED_COLUMN_WIDTH_SCREEN_PX)).toBeLessThanOrEqual(0);
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
