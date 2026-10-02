/**
 * A4 landscape usable content dimensions, in CSS pixels — the fixed reference the Worksheets view
 * sizes against. Both layouts print landscape (a Layout-B-specific portrait attempt was tried and
 * reverted — requested live, portrait made its print output too small/cramped) — see
 * printWorksheets.ts's own orientation parameter, kept explicit rather than hardcoded so a
 * layout-specific orientation remains easy to reintroduce later if ever wanted again.
 *
 * Computed at 96 CSS px/inch (the standard CSS px-to-physical-unit ratio) from A4's 297mm width,
 * minus the SAME 10mm-per-side margin printWorksheets.ts's `@page` rule actually uses — kept here
 * as the one source of truth both read, rather than an independently hardcoded number that could
 * drift apart.
 */
import { measureLongestTextWidthPx } from "./fitRotatedHeaderFont";

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

/** The Worksheets view's body text font, per surface — matches `--oas-vue-font-size-body`/`--oas-vue-font-family` on screen (OasProgressionVueContent.vue) and the literal 10pt/NunitoSans rule in printWorksheets.ts's own stylesheet. Used wherever real text needs to be MEASURED (not just styled), so the measurement is taken at the same size/family the text actually renders at. */
export const WORKSHEET_FONT_FAMILY = "NunitoSans-regular, arial, sans-serif";
export const WORKSHEET_BODY_FONT_SIZE_SCREEN_PX = 14;
export const WORKSHEET_BODY_FONT_SIZE_PRINT_PX = 13.33; // 10pt

/**
 * Layout B ("members as rows") sizing — the member-name column's width is MEASURED per page (the
 * longest member name actually on that page, in full — requested live: never wrap, truncate, or
 * ellipsise a name), not a fixed constant — see memberNameColumnWidthPx below. I-Statement columns
 * used to divide the remaining width evenly however narrow that made each one, shrinking a shared
 * font size down to fit (fitRotatedHeaderFont.ts) — replaced (requested live) by a FIXED column
 * width with word-wrapped text at a constant, never-shrinking font size, and real column splitting
 * (splitTransposedPageIntoColumnBatches in buildWorksheetPages.ts) once a page has more I-Statement
 * columns than fit — the same "wrap, don't shrink; split, don't squeeze" pattern already proven on
 * Layout A's own statement column / member columns.
 */
const MEMBER_NAME_COLUMN_PADDING_PX = 16; // matches the cell's own 8px-left + 8px-right padding (padding: 4px 8px)
const MEMBER_NAME_COLUMN_MIN_WIDTH_PX = 80; // floor for a page with no members / very short names, so the column never collapses to near-zero

/**
 * Measures the member-name column's required width for one page: the longest displayed name on
 * that page (full text, `measureLongestTextWidthPx` from fitRotatedHeaderFont.ts) plus the cell's
 * own horizontal padding, floored at a sensible minimum. Call this ONCE per ORIGINAL, unsplit page
 * and apply the one result to every split batch of that page — mirrors Layout A's own
 * computeColumnsLayoutMetrics discipline (one set of widths per page, not recomputed per batch), so
 * split tables still line up at the same width as each other.
 */
export function memberNameColumnWidthPx(displayNames: string[], fontSizePx: number, fontFamily: string, measureWidthPx?: (text: string, fontSizePx: number, fontFamily: string) => number): number {
  const longestNameWidthPx = measureWidthPx ? measureLongestTextWidthPx(displayNames, fontSizePx, fontFamily, measureWidthPx) : measureLongestTextWidthPx(displayNames, fontSizePx, fontFamily);
  return Math.max(MEMBER_NAME_COLUMN_MIN_WIDTH_PX, Math.ceil(longestNameWidthPx) + MEMBER_NAME_COLUMN_PADDING_PX);
}

/**
 * The ~50-char wrap LENGTH for Layout B's rotated I-Statement header text. Rotating text 90°
 * (`writing-mode: vertical-rl`) swaps which box dimension is "the wrap length" vs "the dimension
 * that grows as more lines wrap": a wrapped line in rotated text stacks along the element's HEIGHT
 * (characters flow top-to-bottom, wrapping to a new line extends sideways), the opposite of normal
 * horizontal text. So this value — reusing Layout A's own ~50-char derivation/numbers rather than a
 * third figure — must be applied as the header `<th>`'s HEIGHT, not its width (an earlier version of
 * this file got the two axes backwards, which wrapped text at ~30 characters instead of ~50 — the
 * 220px height budget was being used as the wrap length while the 350px wrap-length number sat on
 * the width, exactly swapped from what rotation requires).
 */
export const TRANSPOSED_COLUMN_WRAP_WIDTH_SCREEN_PX = STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX;
export const TRANSPOSED_COLUMN_WRAP_WIDTH_PRINT_PX = STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX;

/** How many wrapped ~50-char lines a column's own WIDTH budgets for (see TRANSPOSED_COLUMN_WRAP_WIDTH's own comment on why width, not height, is the "more lines" axis here) before a long statement is accepted as a known, un-widened overflow. */
export const TRANSPOSED_COLUMN_MAX_WRAP_LINES = 3;

/** One line's width for Layout B's rotated header text, in px — the per-line budget the column's own width is built from (TRANSPOSED_COLUMN_MAX_WRAP_LINES x this). Picked as a sensible single-line reading width at each surface's own body font size; not derived from a character count like the wrap LENGTH above, since this is a width floor for one line, not a wrap trigger. */
export const TRANSPOSED_COLUMN_LINE_WIDTH_SCREEN_PX = 24;
export const TRANSPOSED_COLUMN_LINE_WIDTH_PRINT_PX = 22;

/** Layout B's I-Statement column width — up to TRANSPOSED_COLUMN_MAX_WRAP_LINES lines' worth of width, so a statement can wrap onto a second/third rotated line before any text is accepted as overflowing rather than forcing every column to the full multi-line width regardless of content. */
export const TRANSPOSED_COLUMN_WIDTH_SCREEN_PX = TRANSPOSED_COLUMN_LINE_WIDTH_SCREEN_PX * TRANSPOSED_COLUMN_MAX_WRAP_LINES;
export const TRANSPOSED_COLUMN_WIDTH_PRINT_PX = TRANSPOSED_COLUMN_LINE_WIDTH_PRINT_PX * TRANSPOSED_COLUMN_MAX_WRAP_LINES;

/**
 * How many Layout B I-Statement columns fit into `usableWidthPx`, given the fixed member-name
 * column and each I-Statement column's own fixed width — the column-axis equivalent of
 * maxFittingMemberColumns, but NOT a call to that function: maxFittingMemberColumns always divides
 * by MEMBER_COLUMN_MIN_WIDTH_PX (Layout A's member-column width), which is the wrong per-column
 * width for Layout B's own, differently-sized columns — reusing it silently overcounted how many
 * 350px-ish-wide I-Statement columns actually fit (dividing by 70 instead of each column's own
 * width), which is why columns were rendering far wider than the screen and never splitting.
 */
export function maxFittingTransposedColumns(usableWidthPx: number, memberNameColumnWidthPx: number, columnWidthPx: number): number {
  return Math.floor((usableWidthPx - memberNameColumnWidthPx) / columnWidthPx);
}
