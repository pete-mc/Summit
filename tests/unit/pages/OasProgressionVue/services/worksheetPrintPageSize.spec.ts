import {
  maxFittingMemberColumns,
  computeColumnsLayoutMetrics,
  MEMBER_COLUMN_MIN_WIDTH_PX,
  STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX,
  PRINT_USABLE_WIDTH_PX,
  GROUP_BAND_COLUMN_WIDTH_PRINT_PX,
  STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX,
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
