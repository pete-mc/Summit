import { fitRotatedHeaderFont } from "@/pages/OasProgressionVue/services/fitRotatedHeaderFont";

/** A deterministic, linear stand-in for real canvas measurement: width = fontSize * 0.5 * length. Lets tests assert exact expected sizes rather than depending on jsdom's canvas (which has no real text metrics). */
function linearMeasure(text: string, fontSizePx: number): number {
  return fontSizePx * 0.5 * text.length;
}

describe("fitRotatedHeaderFont", () => {
  it("returns maxFontSizePx with fits:true when there are no texts to measure", () => {
    const result = fitRotatedHeaderFont({ texts: [], availableLengthPx: 100, fontFamily: "arial", maxFontSizePx: 14, minFontSizePx: 6 });

    expect(result).toEqual({ fontSizePx: 14, fits: true });
  });

  it("picks the largest size that fits the LONGEST text, not the average or shortest", () => {
    // "short" (5 chars) and "a much longer statement here" (29 chars) — must size for the longer one.
    const result = fitRotatedHeaderFont({
      texts: ["short", "a much longer statement here"],
      availableLengthPx: 290, // at fontSize 20: 29 * 0.5 * 20 = 290 exactly
      fontFamily: "arial",
      maxFontSizePx: 40,
      minFontSizePx: 6,
      measureWidthPx: linearMeasure,
    });

    expect(result).toEqual({ fontSizePx: 20, fits: true });
  });

  it("clamps to maxFontSizePx when the longest text would fit even larger", () => {
    const result = fitRotatedHeaderFont({
      texts: ["hi"], // 2 chars — fits easily even at the max size
      availableLengthPx: 1000,
      fontFamily: "arial",
      maxFontSizePx: 24,
      minFontSizePx: 6,
      measureWidthPx: linearMeasure,
    });

    expect(result.fontSizePx).toBe(24);
    expect(result.fits).toBe(true);
  });

  it("returns fits:false when even minFontSizePx is too large for the available length", () => {
    const result = fitRotatedHeaderFont({
      texts: ["a statement far too long to ever fit in the available space provided here"],
      availableLengthPx: 10,
      fontFamily: "arial",
      maxFontSizePx: 24,
      minFontSizePx: 6,
      measureWidthPx: linearMeasure,
    });

    expect(result.fontSizePx).toBe(6);
    expect(result.fits).toBe(false);
  });

  it("never returns a size below minFontSizePx or above maxFontSizePx", () => {
    const result = fitRotatedHeaderFont({
      texts: ["something of moderate length"],
      availableLengthPx: 50,
      fontFamily: "arial",
      maxFontSizePx: 24,
      minFontSizePx: 6,
      measureWidthPx: linearMeasure,
    });

    expect(result.fontSizePx).toBeGreaterThanOrEqual(6);
    expect(result.fontSizePx).toBeLessThanOrEqual(24);
  });
});
