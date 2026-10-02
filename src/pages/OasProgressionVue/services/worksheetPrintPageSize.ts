/**
 * A4 landscape usable content dimensions, in CSS pixels — the fixed reference both the on-screen
 * Layout B ("members as rows") preview and the actual print output size against. Printing is
 * always landscape now (see printWorksheets.ts; portrait was dropped in Stage 5), so this is the
 * one page size the whole Worksheets view designs for.
 *
 * Computed at 96 CSS px/inch (the standard CSS px-to-physical-unit ratio) from A4's 297mm width,
 * minus the SAME 10mm-per-side margin printWorksheets.ts's `@page` rule actually uses — kept here
 * as the one source of truth both read, rather than two independently hardcoded numbers that could
 * drift apart.
 */
const A4_LANDSCAPE_WIDTH_MM = 297;
export const PRINT_PAGE_MARGIN_MM = 10;

function mmToPx(mm: number): number {
  return (mm / 25.4) * 96;
}

/** Usable content width of one landscape A4 sheet, in CSS px, after both side margins. */
export const PRINT_USABLE_WIDTH_PX = Math.round(mmToPx(A4_LANDSCAPE_WIDTH_MM - PRINT_PAGE_MARGIN_MM * 2));

/**
 * Layout A's I-Statement column width, tuned so a line wraps at roughly 50 characters (requested
 * live — word-wrapped, never mid-word) rather than at whatever width the column happened to end up
 * — previously an unconstrained `min-width`/`max-width` range, which let the browser's own table
 * layout stretch the column arbitrarily wide on a small unit (see the "empty gap" fix in
 * OASWorksheetsVue.vue, which depends on this column having a real `width` rather than a soft
 * range). Derived, not eyeballed: 50 characters × an average sans-serif glyph width of ~0.5em, at
 * each surface's own body font size (NunitoSans-regular/arial) — 14px on screen
 * (`--oas-vue-font-size-body`), 10pt in print. The two land close together (350px / 333px) because
 * both are "normal body text" sizes; kept as two separate constants rather than one shared number
 * so each can be re-measured independently against its own real rendered text if 0.5em turns out
 * wrong for either surface once printed for real.
 */
export const STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX = 350;
export const STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX = 333;

/**
 * The I-Statement column's RELAXED ceiling — used instead of the squeezed wrap width above for any
 * page that doesn't need to split (see computeColumnsLayoutMetrics below). Matches the existing
 * 420px `max-width` already on the page-title `<th>` in OASWorksheetsVue.vue (that cell spans the
 * group-band + statement columns, so its own ceiling already encodes "this is the natural wide
 * width for this pair of columns" — reused here rather than picking a second, independent number.
 */
export const STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX = 420;

/**
 * Layout A ("members as columns") fixed column widths, matching OASWorksheetsVue.vue's own CSS —
 * kept here too so the fitting calculations below are derived from the same numbers the component
 * actually renders at, rather than a second, independently-chosen rule-of-thumb figure. Update both
 * places together if either changes.
 *
 * The group-band width differs by surface: print rotates it sideways (28px, one line-height-ish);
 * screen un-rotates it for readability (70px, wide enough for "Review"/"Verify" horizontally) — see
 * OASWorksheetsVue.vue's own `.oas-worksheet-group-band .oas-worksheet-rotated-text` override and
 * its comment for why. Both constants are exported so the per-surface callers below (print's fixed
 * PRINT_USABLE_WIDTH_PX, screen's own measured width) each pass their own real group-band width
 * rather than one assumed for both.
 */
export const GROUP_BAND_COLUMN_WIDTH_PRINT_PX = 28;
export const GROUP_BAND_COLUMN_WIDTH_SCREEN_PX = 70;
export const MEMBER_COLUMN_MIN_WIDTH_PX = 70; // matches .oas-worksheet-cell's min-width — set by the date text/tick-box, not the (now rotated) header

/**
 * How many member columns Layout A can fit into `usableWidthPx` at the *squeezed* state — the
 * I-Statement column pinned to its tight ~50-char wrap width (`statementWidthPx`, the print or
 * screen wrap constant above) and member columns at their bare minimum (`MEMBER_COLUMN_MIN_WIDTH_PX`).
 * This is the true "last resort before another sheet is needed" threshold — a page only SPLITS once
 * it can't fit even at these squeezed numbers (see computeColumnsLayoutMetrics below, which is what
 * every unsplit page actually renders at — a relaxed, not squeezed, width).
 *
 * Parameterised on `usableWidthPx`/`groupBandWidthPx` (rather than one hardcoded print-only
 * constant) so screen (a measured viewport width, un-rotated 70px group-band) and print (the fixed
 * PRINT_USABLE_WIDTH_PX, rotated 28px group-band) share one formula instead of two near-duplicate
 * calculations that could silently drift apart.
 *
 * Rotating the HEADER text does not by itself buy more member columns, because the column's width
 * is set by its BODY content (a date like "03/02/24", or the tick-box) — rotation only shrinks the
 * group-band/member-name columns' own width, which is a smaller, one-time saving, not a per-column
 * one. Confirmed by this calculation coming out lower than Stage 4's original (pre-rotation,
 * portrait/landscape-specific) 7/13 rule-of-thumb numbers — validate live once printed for real,
 * per PLAN_STAGE_5_LARGE_UNITS.md's own verification note; this is a calculation, not a measurement.
 */
export function maxFittingMemberColumns(usableWidthPx: number, groupBandWidthPx: number, statementWidthPx: number): number {
  return Math.floor((usableWidthPx - groupBandWidthPx - statementWidthPx) / MEMBER_COLUMN_MIN_WIDTH_PX);
}

/** Layout A's print-specific fitting threshold — the one call site every prior stage already used, kept as a constant for convenience since print's own geometry never varies page to page. */
export const MAX_FITTING_MEMBER_COLUMNS = maxFittingMemberColumns(PRINT_USABLE_WIDTH_PX, GROUP_BAND_COLUMN_WIDTH_PRINT_PX, STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX);

/**
 * One unsplit Layout A page's actual render widths — "expanded", not squeezed: the I-Statement
 * column gets a relaxed, generous width (capped at `relaxedStatementMaxWidthPx`, the same 420px
 * ceiling the page-title cell already uses) rather than the tight ~50-char wrap width, and every
 * leftover pixel goes to widening the member columns instead of sitting unused (requested live:
 * "member columns should fill the screen/page width as much as possible... I-Statement shouldn't
 * wrap unless needed").
 *
 * Only call this for a page that already fits within `maxFittingMemberColumns` at the squeezed
 * numbers — a page that doesn't fit splits instead (see splitPageIntoColumnBatches), and a split
 * page's own batches render at the existing fixed squeezed widths, not these relaxed ones.
 */
export interface ColumnsLayoutMetrics {
  statementWidthPx: number;
  memberColumnWidthPx: number;
}

export function computeColumnsLayoutMetrics(usableWidthPx: number, groupBandWidthPx: number, memberCount: number, relaxedStatementMaxWidthPx: number): ColumnsLayoutMetrics {
  if (memberCount <= 0) {
    return { statementWidthPx: relaxedStatementMaxWidthPx, memberColumnWidthPx: MEMBER_COLUMN_MIN_WIDTH_PX };
  }
  const remainingForMembersAtRelaxedStatement = usableWidthPx - groupBandWidthPx - relaxedStatementMaxWidthPx;
  const evenMemberWidthAtRelaxedStatement = Math.floor(remainingForMembersAtRelaxedStatement / memberCount);

  if (evenMemberWidthAtRelaxedStatement >= MEMBER_COLUMN_MIN_WIDTH_PX) {
    // Plenty of room: I-Statement stays at its full relaxed width, member columns stretch evenly
    // into whatever's left over (never below their own minimum — the `>=` check above guarantees
    // that here).
    return { statementWidthPx: relaxedStatementMaxWidthPx, memberColumnWidthPx: evenMemberWidthAtRelaxedStatement };
  }

  // Not quite enough room for the full relaxed statement width at this member count — member
  // columns stay at their minimum, and whatever's left over (still more than the squeezed wrap
  // width, since this function is only ever called for a page that fits within
  // maxFittingMemberColumns) goes to the statement column instead of being wasted.
  const remainingForStatementAtMinMemberWidth = usableWidthPx - groupBandWidthPx - memberCount * MEMBER_COLUMN_MIN_WIDTH_PX;
  return {
    statementWidthPx: Math.min(relaxedStatementMaxWidthPx, Math.max(MEMBER_COLUMN_MIN_WIDTH_PX, remainingForStatementAtMinMemberWidth)),
    memberColumnWidthPx: MEMBER_COLUMN_MIN_WIDTH_PX,
  };
}

/**
 * Layout B ("members as rows") sizing — the member-name column is fixed width (names read fine
 * horizontally as rows, not rotated — PLAN_STAGE_5_LARGE_UNITS.md §1), and every I-Statement
 * column divides the REMAINING width evenly, however narrow that makes each one (no column
 * splitting on this axis — see that plan section for why Layout A needs splitting but this doesn't).
 */
export const MEMBER_NAME_COLUMN_WIDTH_PX = 140;

/** Each I-Statement column's width for a page with this many statement columns, dividing the remaining print width evenly. Never below a sensible floor — see fitRotatedHeaderFont's own min-font-size floor for the matching legibility limit on the TEXT side of this same tradeoff. */
export function transposedColumnWidthPx(columnCount: number): number {
  if (columnCount <= 0) {
    return PRINT_USABLE_WIDTH_PX - MEMBER_NAME_COLUMN_WIDTH_PX;
  }
  return Math.max(1, Math.floor((PRINT_USABLE_WIDTH_PX - MEMBER_NAME_COLUMN_WIDTH_PX) / columnCount));
}

/** Font-size bounds for the rotated I-Statement column headers — see fitRotatedHeaderFont.ts. Picked, not measured: 16px is a comfortable reading size for a header, 6px is the point below which scaling further defeats the purpose (illegible is not "fit") — PLAN_STAGE_5_LARGE_UNITS.md §2 flags this floor as worth revisiting empirically once printed for real. */
export const ROTATED_HEADER_MAX_FONT_SIZE_PX = 16;
export const ROTATED_HEADER_MIN_FONT_SIZE_PX = 6;

/** Budgeted header row height for the rotated I-Statement headers, in px — the "available length" fitRotatedHeaderFont solves against, since rotated text's length runs along this axis. Generous enough for a full sentence at a still-legible size; tune live once printed. */
export const ROTATED_HEADER_HEIGHT_PX = 220;
