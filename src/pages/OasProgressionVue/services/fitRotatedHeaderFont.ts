/**
 * Picks the largest font size at which the LONGEST of a set of strings still fits within a given
 * pixel length when laid out normally (not rotated) — used for the Layout B ("members as rows")
 * transposed worksheet's rotated I-Statement column headers, where the full statement text is kept
 * (no numbering/legend, no abbreviation — decided with the user, see
 * .claude/OASWorksheets/PLAN_STAGE_5_LARGE_UNITS.md §2) and the FONT scales down to fit instead.
 *
 * One size is picked for the whole set (the page's own longest statement), not independently per
 * string — every header on one table then reads at the same size; a short statement just uses
 * less of the available height than a long one does. See PLAN_STAGE_5_LARGE_UNITS.md §2 for why.
 *
 * Measures via an offscreen <canvas> 2D context (`measureText`) rather than a character-count
 * formula — font metrics vary enough by content (proportion of wide vs. narrow characters) that a
 * formula risks exactly the "looked right on paper, wrong once rendered" mistake DESIGN.md's type
 * scale section already documents happening once on this project. Canvas measurement is also far
 * cheaper than a live DOM measurement pass (no layout/reflow), which matters here since this runs
 * once per page whenever the page set changes.
 */

export interface FitRotatedHeaderFontOptions {
  /** The strings that must fit — typically every I-Statement on one worksheet page. */
  texts: string[];
  /** The available length, in CSS pixels, the longest text must fit within once rendered at the chosen font size (the rotated header's budgeted height — see OASWorksheetsVue.ts). */
  availableLengthPx: number;
  /** Font family to measure with — must match what actually renders, or the measurement is for the wrong glyphs. */
  fontFamily: string;
  /** Upper bound to start searching from (the "looks fine, no need to shrink further" ceiling). */
  maxFontSizePx: number;
  /**
   * Lower bound — scaling below this defeats the point (illegible is not "fit"). The caller gets
   * this value back even if the longest text still doesn't fit at it; see the return type's
   * `fits` flag for whether that happened, so the caller can decide what to do about an
   * unavoidably-too-long statement rather than this function silently producing an unreadable size
   * or an infinite search.
   */
  minFontSizePx: number;
  /**
   * Overrides the width measurement — real callers never pass this (it defaults to canvas
   * measurement, falling back to a rough estimate where canvas isn't available). Tests pass a
   * deterministic fake here, since jsdom's canvas has no real text metrics and always reports 0.
   */
  measureWidthPx?: (text: string, fontSizePx: number, fontFamily: string) => number;
}

export interface FitRotatedHeaderFontResult {
  fontSizePx: number;
  /** False when even `minFontSizePx` wasn't enough to fit the longest text — the caller may want to widen the column, warn, or just accept the overflow, but should not assume the header will not clip. */
  fits: boolean;
}

/** Lazily creates (and reuses) one offscreen canvas 2D context for measurement — cheaper than a new canvas per call, and canvas/CanvasRenderingContext2D are both absent in the Jest/jsdom test environment, so this stays undefined there (handled by the caller/tests via a measurer override — see `measureTextWidthPx`'s own param). */
let sharedMeasurementContext: CanvasRenderingContext2D | null | undefined;

function getSharedMeasurementContext(): CanvasRenderingContext2D | null {
  if (sharedMeasurementContext === undefined) {
    try {
      sharedMeasurementContext = document.createElement("canvas").getContext("2d");
    } catch {
      sharedMeasurementContext = null;
    }
  }
  return sharedMeasurementContext;
}

/**
 * Measures `text`'s rendered width at `fontSizePx` in `fontFamily`. Returns null when canvas
 * measurement isn't available (older environments, or jsdom in tests) — callers fall back to a
 * conservative character-count estimate in that case rather than failing outright, since a rough
 * estimate server/test-side is still better than no sizing at all.
 */
export function measureTextWidthPx(text: string, fontSizePx: number, fontFamily: string): number | null {
  const ctx = getSharedMeasurementContext();
  if (!ctx) {
    return null;
  }
  ctx.font = `${fontSizePx}px ${fontFamily}`;
  return ctx.measureText(text).width;
}

/** Rough fallback when canvas measurement isn't available — assumes an average glyph is ~0.55x as wide as the font size, which is conservative (slightly overestimates width) for a mixed-case sans-serif. Only used when `measureTextWidthPx` returns null. */
function estimateTextWidthPx(text: string, fontSizePx: number): number {
  return text.length * fontSizePx * 0.55;
}

function widthAt(text: string, fontSizePx: number, fontFamily: string): number {
  return measureTextWidthPx(text, fontSizePx, fontFamily) ?? estimateTextWidthPx(text, fontSizePx);
}

/**
 * Measures the widest of a set of strings at a fixed font size — used for Layout B's member-name
 * column, which (requested live) must be sized to fit the longest member name on the page in full,
 * never wrapped/truncated/ellipsised, with every split batch of that page sharing the SAME width
 * (the caller is responsible for measuring against the ORIGINAL, unsplit page's full member list and
 * applying the one result to every batch — this function only does the measurement itself).
 *
 * Same canvas-measurement-with-character-count-fallback approach as fitRotatedHeaderFont, for the
 * same reason (font metrics vary by content; a pure formula risks being visibly wrong once
 * rendered) — but no font-size search here, since the font size is fixed and only the required
 * WIDTH is in question.
 */
export function measureLongestTextWidthPx(texts: string[], fontSizePx: number, fontFamily: string, measureWidthPx: (text: string, fontSizePx: number, fontFamily: string) => number = widthAt): number {
  return texts.reduce((longest, text) => Math.max(longest, measureWidthPx(text, fontSizePx, fontFamily)), 0);
}

export function fitRotatedHeaderFont(options: FitRotatedHeaderFontOptions): FitRotatedHeaderFontResult {
  const { texts, availableLengthPx, fontFamily, maxFontSizePx, minFontSizePx, measureWidthPx = widthAt } = options;

  if (texts.length === 0) {
    return { fontSizePx: maxFontSizePx, fits: true };
  }

  const longestText = texts.reduce((longest, text) => (text.length > longest.length ? text : longest), texts[0]);

  // Binary search rather than a linear step-down: font-size-to-width is monotonic (wider at
  // larger sizes), so this converges in ~log2(range) measurements instead of one per integer
  // point size, which matters since each step is a canvas measurement call.
  let low = minFontSizePx;
  let high = maxFontSizePx;
  let best = minFontSizePx;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (measureWidthPx(longestText, mid, fontFamily) <= availableLengthPx) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const fits = measureWidthPx(longestText, best, fontFamily) <= availableLengthPx;
  return { fontSizePx: best, fits };
}
