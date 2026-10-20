/** Learning: measure with canvas measureText, not a character-count formula. Glyph widths vary too much, and canvas avoids a DOM reflow. */

export interface FitRotatedHeaderFontOptions {
  texts: string[];
  availableLengthPx: number;
  fontFamily: string;
  maxFontSizePx: number;
  /** Returned even if the text still doesn't fit; check `fits`. */
  minFontSizePx: number;
  /** Gotcha: jsdom's canvas always measures 0, so tests pass a fake measurer here. */
  measureWidthPx?: (text: string, fontSizePx: number, fontFamily: string) => number;
}

export interface FitRotatedHeaderFontResult {
  fontSizePx: number;
  fits: boolean;
}

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

/** Null when canvas isn't available (e.g. jsdom). */
export function measureTextWidthPx(text: string, fontSizePx: number, fontFamily: string): number | null {
  const ctx = getSharedMeasurementContext();
  if (!ctx) {
    return null;
  }
  ctx.font = `${fontSizePx}px ${fontFamily}`;
  return ctx.measureText(text).width;
}

const AVERAGE_GLYPH_WIDTH_EM = 0.55;

function estimateTextWidthPx(text: string, fontSizePx: number): number {
  return text.length * fontSizePx * AVERAGE_GLYPH_WIDTH_EM;
}

function widthAt(text: string, fontSizePx: number, fontFamily: string): number {
  return measureTextWidthPx(text, fontSizePx, fontFamily) ?? estimateTextWidthPx(text, fontSizePx);
}

export function measureLongestTextWidthPx(texts: string[], fontSizePx: number, fontFamily: string, measureWidthPx: (text: string, fontSizePx: number, fontFamily: string) => number = widthAt): number {
  return texts.reduce((longest, text) => Math.max(longest, measureWidthPx(text, fontSizePx, fontFamily)), 0);
}

export function fitRotatedHeaderFont(options: FitRotatedHeaderFontOptions): FitRotatedHeaderFontResult {
  const { texts, availableLengthPx, fontFamily, maxFontSizePx, minFontSizePx, measureWidthPx = widthAt } = options;

  if (texts.length === 0) {
    return { fontSizePx: maxFontSizePx, fits: true };
  }

  const longestText = texts.reduce((longest, text) => (text.length > longest.length ? text : longest), texts[0]);

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
