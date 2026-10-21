import { buildExcelFileName, buildHeaderBlock, HEADER_BLOCK_ROWS, loadSectionLogoImage, resolveExcelHeader } from "@/excel/summitExcel";

describe("buildExcelFileName", () => {
  const when = new Date(2026, 9, 2, 14, 5);

  it("follows 'Summit - {parts} - yyyymmdd.xlsx'", () => {
    expect(buildExcelFileName(["OAS Progression", "Summary", "Sample Unit"], when)).toBe("Summit - OAS Progression - Summary - Sample Unit - 20261002.xlsx");
  });

  it("replaces characters Windows forbids in file names", () => {
    expect(buildExcelFileName(["OAS Progression", "Summary", 'A/B: "C"?'], when)).toBe("Summit - OAS Progression - Summary - A-B- -C-- - 20261002.xlsx");
  });

  it("drops an empty part rather than leaving '- -'", () => {
    expect(buildExcelFileName(["OAS Progression", "Summary", ""], when)).toBe("Summit - OAS Progression - Summary - 20261002.xlsx");
  });
});

describe("resolveExcelHeader", () => {
  it("uses the printout's wording for the same profile", () => {
    const header = resolveExcelHeader("peak-award-summary", [{ label: "Patrol", value: "All" }], { unit: "Sample Unit", group: "Sample Group", section: "Venturer Scouts" }, new Date(2026, 9, 12, 14, 5));
    expect(header.title).toBe("OAS Progression - Summary for Peak Award");
    expect(header.subtitle).toBe("Sample Group · Sample Unit");
    expect(header.metaLine).toMatch(/^Patrol: All · Generated: 12\/10\/2026/);
  });

  it("tidies the subtitle when the group is unknown", () => {
    const header = resolveExcelHeader("peak-award-summary", undefined, { unit: "Sample Unit", group: "", section: "" }, new Date(2026, 9, 12));
    expect(header.subtitle).toBe("Sample Unit");
    expect(header.metaLine).toMatch(/^Generated: /);
  });
});

describe("buildHeaderBlock", () => {
  const header = { title: "T", subtitle: "S", metaLine: "M" };

  it("starts the text in column B beside a logo", () => {
    const rows = buildHeaderBlock(header, true);
    expect(rows).toHaveLength(HEADER_BLOCK_ROWS);
    expect(rows[0][0]).toBeNull();
    expect(rows[0][1]).toMatchObject({ value: "T", fontWeight: "bold" });
  });

  it("starts the text in column A without one", () => {
    const rows = buildHeaderBlock(header, false);
    expect(rows[0][0]).toMatchObject({ value: "T" });
    expect(rows[1][0]).toMatchObject({ value: "S" });
    expect(rows[2][0]).toMatchObject({ value: "M" });
  });
});

describe("loadSectionLogoImage", () => {
  const realFetch = global.fetch;
  const g = global as unknown as { createImageBitmap?: unknown };
  const realBitmap = g.createImageBitmap;

  afterEach(() => {
    global.fetch = realFetch;
    g.createImageBitmap = realBitmap;
  });

  it("returns null without a URL", async () => {
    expect(await loadSectionLogoImage(null)).toBeNull();
  });

  it("returns null (and doesn't throw) when the fetch fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("blocked")) as unknown as typeof fetch;
    expect(await loadSectionLogoImage("chrome-extension://x/images/sections/a.jpg")).toBeNull();
  });

  it("returns null on an HTTP error", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    expect(await loadSectionLogoImage("chrome-extension://x/images/sections/a.jpg")).toBeNull();
  });

  it("sizes the logo to the header block from its real pixel size", async () => {
    const blob = new Blob(["x"], { type: "image/png" });
    global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => blob }) as unknown as typeof fetch;
    const close = jest.fn();
    g.createImageBitmap = jest.fn().mockResolvedValue({ width: 901, height: 1181, close });

    const image = await loadSectionLogoImage("chrome-extension://x/images/sections/a.png");
    // content compared by identity: toMatchObject recurses forever into a jsdom Blob.
    expect(image?.content).toBe(blob);
    expect({ ...image, content: undefined }).toMatchObject({ contentType: "image/png", width: 901, height: 1181, anchor: { row: 1, column: 1 } });
    // Displayed height = height / dpi inches = 94 px at 96 px per inch.
    expect(((image as { height: number }).height / (image as { dpi: number }).dpi) * 96).toBeCloseTo(94);
    expect(close).toHaveBeenCalled();
  });
});
