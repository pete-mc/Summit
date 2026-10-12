import { absolutiseFontSrc, buildPrintFontFaces, collectPrintFontCss, declaredPrintWeights, findTerrainFontFaces, waitForPrintFonts } from "@/print/printFonts";

describe("waitForPrintFonts", () => {
  it("loads each declared weight of the print family, then waits for the document's fonts", async () => {
    const load = jest.fn(async () => []);
    const doc = { fonts: { load, ready: Promise.resolve() } } as unknown as Document;
    await waitForPrintFonts(doc, [400, 600]);
    expect(load.mock.calls.map((c) => (c as unknown[])[0])).toEqual(['400 10pt "SummitPrintSans"', '600 10pt "SummitPrintSans"']);
  });

  it("gives up after the cap rather than hanging the print when a font never arrives", async () => {
    jest.useFakeTimers();
    const doc = { fonts: { load: () => new Promise(() => undefined), ready: new Promise(() => undefined) } } as unknown as Document;
    const done = jest.fn();
    const waiting = waitForPrintFonts(doc, [400], 3000).then(done);
    await jest.advanceTimersByTimeAsync(2999);
    expect(done).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    await waiting;
    expect(done).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("returns at once when there is nothing to wait for", async () => {
    await expect(waitForPrintFonts({} as Document, [400])).resolves.toBeUndefined();
    await expect(waitForPrintFonts({ fonts: {} } as unknown as Document, [])).resolves.toBeUndefined();
  });
});

const BASE = "https://terrain.scouts.com.au/_nuxt/css/0131ac3.css";

describe("absolutiseFontSrc", () => {
  it("resolves Terrain's root-relative font URLs against the stylesheet URL", () => {
    expect(absolutiseFontSrc('url(/_nuxt/fonts/NunitoSans-Regular.2dbe377.woff2) format("woff2")', BASE)).toBe('url("https://terrain.scouts.com.au/_nuxt/fonts/NunitoSans-Regular.2dbe377.woff2") format("woff2")');
  });

  it("handles quoted URLs and leaves absolute ones absolute", () => {
    expect(absolutiseFontSrc('url("https://cdn.example/x.woff2")', BASE)).toBe('url("https://cdn.example/x.woff2")');
    expect(absolutiseFontSrc("url('../fonts/y.woff2')", BASE)).toBe('url("https://terrain.scouts.com.au/_nuxt/fonts/y.woff2")');
  });
});

describe("buildPrintFontFaces", () => {
  // Terrain declares every weight as its own family at font-weight 400 (captured CSS).
  const faces = [
    { family: "NunitoSans-light", src: "url(/_nuxt/fonts/NunitoSans-Light.woff2)", base: BASE },
    { family: "NunitoSans-regular", src: "url(/_nuxt/fonts/NunitoSans-Regular.woff2)", base: BASE },
    { family: '"NunitoSans-semibold"', src: "url(/_nuxt/fonts/NunitoSans-SemiBold.woff2)", base: BASE },
    { family: "NunitoSans-bold", src: "url(/_nuxt/fonts/NunitoSans-Bold.woff2)", base: BASE },
  ];

  it("re-declares regular/semibold/bold as one family at their real weights, skipping others", () => {
    const css = buildPrintFontFaces(faces);
    expect(declaredPrintWeights(css)).toEqual([400, 600, 700]);
    expect(css).toContain('font-family: "SummitPrintSans"');
    expect(css).toContain("https://terrain.scouts.com.au/_nuxt/fonts/NunitoSans-SemiBold.woff2");
    expect(css).not.toContain("Light");
  });

  it("declares a weight only once even if Terrain lists a family twice", () => {
    expect(declaredPrintWeights(buildPrintFontFaces(faces.concat(faces)))).toEqual([400, 600, 700]);
  });

  it("returns nothing when no Nunito Sans faces exist", () => {
    expect(buildPrintFontFaces([])).toBe("");
  });
});

describe("findTerrainFontFaces / collectPrintFontCss", () => {
  function fakeFontRule(family: string, src: string) {
    return { type: 5, style: { getPropertyValue: (p: string) => (p === "font-family" ? family : p === "src" ? src : "") } };
  }

  function fakeDoc(sheets: unknown[]): Document {
    return { styleSheets: sheets, baseURI: "https://terrain.scouts.com.au/" } as unknown as Document;
  }

  it("collects Nunito Sans @font-face rules, ignoring other rules and unreadable sheets", () => {
    const crossOrigin = {
      href: "https://fonts.example/x.css",
      get cssRules(): never {
        throw new Error("SecurityError");
      },
    };
    const terrain = {
      href: BASE,
      cssRules: [fakeFontRule("NunitoSans-regular", "url(/_nuxt/fonts/R.woff2)"), fakeFontRule("Roboto", "url(/r.woff2)"), { type: 1 }],
    };
    const found = findTerrainFontFaces(fakeDoc([crossOrigin, terrain]));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ family: "NunitoSans-regular", base: BASE });
  });

  it("warns and returns '' (Arial fallback) when Terrain's fonts can't be found", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(collectPrintFontCss(fakeDoc([]))).toBe("");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
