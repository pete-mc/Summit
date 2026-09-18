import { exportElementToPdf } from "@/components/gridExport";

const textMock = jest.fn();
const saveMock = jest.fn();
const addImageMock = jest.fn();
const addPageMock = jest.fn();
const setFillColorMock = jest.fn();
const rectMock = jest.fn();

let pageWidth = 297;
let pageHeight = 210;

const getFontSizeMock = jest.fn(() => 12);
const setFontSizeMock = jest.fn();

jest.mock("jspdf", () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      text: (...args: unknown[]) => textMock(...args),
      save: (...args: unknown[]) => saveMock(...args),
      addImage: (...args: unknown[]) => addImageMock(...args),
      addPage: (...args: unknown[]) => addPageMock(...args),
      setFillColor: (...args: unknown[]) => setFillColorMock(...args),
      rect: (...args: unknown[]) => rectMock(...args),
      getFontSize: (...args: unknown[]) => getFontSizeMock(...args),
      setFontSize: (...args: unknown[]) => setFontSizeMock(...args),
      internal: {
        pageSize: {
          getWidth: () => pageWidth,
          getHeight: () => pageHeight,
        },
      },
    })),
  };
});

const toCanvasMock = jest.fn();

jest.mock("@zumer/snapdom", () => ({
  snapdom: {
    toCanvas: (...args: unknown[]) => toCanvasMock(...args),
  },
}));

const fakeCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  Object.defineProperty(canvas, "width", { value: width, writable: true });
  Object.defineProperty(canvas, "height", { value: height, writable: true });
  return canvas;
};

/** Builds a <table> with `rowCount` <tr>s, each stubbed to report a fixed CSS-pixel height via
 *  getBoundingClientRect, so resolveSliceHeightPx's row/section-boundary snapping can be
 *  exercised. `headingRowIndexes` marks rows that should carry the section-heading class so the
 *  "keep a whole section together" rule can be exercised too. */
const fakeTableWithRows = (rowCount: number, rowHeightPx: number, headingRowIndexes: number[] = []): HTMLTableElement => {
  const table = document.createElement("table");
  jest.spyOn(table, "getBoundingClientRect").mockReturnValue({ top: 0 } as DOMRect);

  for (let i = 0; i < rowCount; i++) {
    const row = document.createElement("tr");
    if (headingRowIndexes.includes(i)) {
      row.className = "oas-heatmap-skill-title-row";
    }
    const top = i * rowHeightPx;
    const bottom = top + rowHeightPx;
    jest.spyOn(row, "getBoundingClientRect").mockReturnValue({ top, bottom } as DOMRect);
    table.appendChild(row);
  }

  return table;
};

describe("exportElementToPdf functional contract", () => {
  let dataUrlCounter = 0;
  let getContextSpy: jest.SpyInstance;
  let toDataURLSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    pageWidth = 297;
    pageHeight = 210;
    dataUrlCounter = 0;

    // jsdom doesn't implement 2D canvas rendering (would need the native `canvas` package), so
    // stub just enough of the Canvas API for cropCanvas()'s drawImage/toDataURL calls to succeed
    // without throwing "not implemented" — this lets the test assert on the real pagination logic.
    getContextSpy = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: "",
    } as unknown as CanvasRenderingContext2D);
    toDataURLSpy = jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => `data:image/jpeg;base64,slice-${dataUrlCounter++}`);
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    toDataURLSpy.mockRestore();
  });

  it("rasterizes the element via SnapDOM and places a single JPEG image when it fits on one page", async () => {
    toCanvasMock.mockResolvedValue(fakeCanvas(800, 400));

    const element = document.createElement("table");

    await exportElementToPdf({
      element,
      fileName: "HeatMap.pdf",
      title: "Heat Map Export",
    });

    // SnapDOM captures the element's own full size directly (no window/viewport bounds math to
    // pass), which is why it replaced html2canvas here: html2canvas needed explicit x/y/width/
    // height/windowWidth/windowHeight overrides to size the capture correctly, and every
    // combination tried still cropped or offset the real heat map table incorrectly.
    expect(toCanvasMock).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        scale: 2,
      }),
    );
    expect(textMock).toHaveBeenCalledWith("Heat Map Export", 4, 8);
    // "As of <date>" is right-aligned into the top-right corner, at half the title's font size.
    expect(textMock).toHaveBeenCalledWith(expect.stringMatching(/^As of /), 297 - 4, 8, { align: "right" });
    expect(setFontSizeMock).toHaveBeenCalledWith(6); // half of the mocked getFontSize() (12)
    expect(setFontSizeMock).toHaveBeenCalledWith(12); // restored afterward
    expect(addImageMock).toHaveBeenCalledTimes(1);
    // JPEG (not PNG) keeps the file size well under the PNG-based implementation that produced a
    // 100+ MB file for the real heat map; solid-color content compresses far better as JPEG.
    expect(addImageMock.mock.calls[0][1]).toBe("JPEG");
    expect(addImageMock.mock.calls[0][0]).toMatch(/^data:image\/jpeg/);
    expect(addPageMock).not.toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalledWith("HeatMap.pdf");
  });

  it("uses a 4mm margin so the page content uses most of the available space", async () => {
    toCanvasMock.mockResolvedValue(fakeCanvas(800, 400));

    await exportElementToPdf({
      element: document.createElement("table"),
      fileName: "HeatMap.pdf",
      title: "Heat Map Export",
    });

    const [, , x, y, width] = addImageMock.mock.calls[0];
    expect(x).toBe(4);
    expect(y).toBe(4 + 8);
    // contentWidthMm = pageWidth(297) - margin(4)*2
    expect(width).toBe(297 - 4 * 2);
  });

  it("does not cut a page in the middle of a table row", async () => {
    // 20 rows of 60 source-px each (scale 2 => 30 CSS px/row) comfortably overflow one page.
    const rowHeightPx = 60;
    const rowCount = 20;
    toCanvasMock.mockResolvedValue(fakeCanvas(800, rowHeightPx * rowCount));

    const element = fakeTableWithRows(rowCount, rowHeightPx / 2); // CSS px = source px / scale(2)

    await exportElementToPdf({
      element,
      fileName: "HeatMap.pdf",
      title: "Heat Map Export",
    });

    expect(addImageMock.mock.calls.length).toBeGreaterThan(1);

    // Reconstruct each page's source-pixel slice height from the embedded image's mm height and
    // the canvas's pixels-per-mm ratio, then assert it's an exact multiple of one row's source
    // height — i.e. every page break landed exactly on a row boundary, never mid-row.
    const contentWidthMm = pageWidth - 4 * 2;
    const pixelsPerMm = 800 / contentWidthMm;

    addImageMock.mock.calls.forEach((call) => {
      const sliceHeightMm = call[5];
      const sliceHeightPx = Math.round(sliceHeightMm * pixelsPerMm);
      expect(sliceHeightPx % rowHeightPx).toBe(0);
    });
  });

  it("keeps a whole section (heading + its data rows) together on one page rather than splitting it across the break", async () => {
    // 20 rows of 60 source-px each; headings at index 8 and 14 (so the middle section spans rows
    // 8-13). A plain per-row page break would otherwise fall inside that section — e.g. after
    // row 12 — leaving some of its data on page 1 and the rest on page 2.
    const rowHeightPx = 60;
    const rowCount = 20;
    const firstHeadingIndex = 8;
    const secondHeadingIndex = 14;
    toCanvasMock.mockResolvedValue(fakeCanvas(800, rowHeightPx * rowCount));

    const element = fakeTableWithRows(rowCount, rowHeightPx / 2, [firstHeadingIndex, secondHeadingIndex]);

    await exportElementToPdf({
      element,
      fileName: "HeatMap.pdf",
      title: "Heat Map Export",
    });

    const contentWidthMm = pageWidth - 4 * 2;
    const pixelsPerMm = 800 / contentWidthMm;
    const firstPageSliceHeightPx = Math.round(addImageMock.mock.calls[0][5] * pixelsPerMm);
    const firstPageRowCount = firstPageSliceHeightPx / rowHeightPx;

    // The break must land on a section boundary: either before the section starts (row 8) or
    // after it fully ends (row 14) — never in between (rows 9-13), which would split it.
    const landsInsideSection = firstPageRowCount > firstHeadingIndex && firstPageRowCount < secondHeadingIndex;
    expect(landsInsideSection).toBe(false);
  });

  it("falls back to a plain row boundary when a single section is taller than one page", async () => {
    // One heading at row 0 followed by 19 data rows (the whole table is one oversized section) —
    // no section boundary can possibly fit within a page, so the break must still land on SOME
    // row boundary rather than cutting a row in half.
    const rowHeightPx = 60;
    const rowCount = 20;
    toCanvasMock.mockResolvedValue(fakeCanvas(800, rowHeightPx * rowCount));

    const element = fakeTableWithRows(rowCount, rowHeightPx / 2, [0]);

    await exportElementToPdf({
      element,
      fileName: "HeatMap.pdf",
      title: "Heat Map Export",
    });

    expect(addImageMock.mock.calls.length).toBeGreaterThan(1);

    const contentWidthMm = pageWidth - 4 * 2;
    const pixelsPerMm = 800 / contentWidthMm;
    addImageMock.mock.calls.forEach((call) => {
      const sliceHeightPx = Math.round(call[5] * pixelsPerMm);
      expect(sliceHeightPx % rowHeightPx).toBe(0);
    });
  });

  it("does not emit a trailing near-blank page for sub-pixel leftover past the last row", async () => {
    // Canvas is a few px taller than the exact row grid (rounding/border leftover past the last
    // row's measured bottom) — that leftover must not become its own page.
    const rowHeightPx = 60;
    const rowCount = 4;
    toCanvasMock.mockResolvedValue(fakeCanvas(800, rowHeightPx * rowCount + 2));

    const element = fakeTableWithRows(rowCount, rowHeightPx / 2);

    await exportElementToPdf({
      element,
      fileName: "HeatMap.pdf",
      title: "Heat Map Export",
    });

    // All 4 rows comfortably fit on one page at this canvas height, so the 2px leftover must not
    // produce a second page.
    expect(addImageMock).toHaveBeenCalledTimes(1);
    expect(addPageMock).not.toHaveBeenCalled();
  });

  it("paginates across multiple pages when the rasterized image is taller than one page, cropping each page's slice instead of re-embedding the full image", async () => {
    // Wide/tall canvas relative to a landscape page forces several page-slices.
    toCanvasMock.mockResolvedValue(fakeCanvas(800, 3200));

    const element = document.createElement("table");

    await exportElementToPdf({
      element,
      fileName: "HeatMap.pdf",
      title: "Heat Map Export",
      orientation: "landscape",
    });

    expect(addImageMock.mock.calls.length).toBeGreaterThan(1);
    expect(addPageMock).toHaveBeenCalledTimes(addImageMock.mock.calls.length - 1);

    // Every page must be positioned at the left/top content margin (not a negative offset) —
    // each call embeds an already-cropped slice, so no page needs to draw the image off-canvas
    // and mask the overflow like the old (broken) implementation did.
    addImageMock.mock.calls.forEach((call) => {
      const [, , x, y] = call;
      expect(x).toBe(4);
      expect(y).toBeGreaterThanOrEqual(4);
    });

    // The masking approach from the old html2canvas-based implementation is gone entirely.
    expect(setFillColorMock).not.toHaveBeenCalled();
    expect(rectMock).not.toHaveBeenCalled();

    expect(saveMock).toHaveBeenCalledWith("HeatMap.pdf");
  });
});
