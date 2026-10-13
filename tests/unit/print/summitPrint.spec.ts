import { buildPrintDocument, DEFAULT_FOOTER, getPrintProfile, layoutOptions, mergeMeta, resolveHeaderFooter, resolvePage } from "@/print/summitPrint";
import { peakAwardSummaryWidths } from "@/print/profiles/peakAwardSummary";
import { mountSummaryTable } from "./summaryFixture";

const GENERATED = new Date(2026, 9, 10, 14, 5); // 10/10/2026 02:05 pm local
const SUMMARY_TITLE = "OAS Progression - Summary for Peak Award";
const CONTEXT_VARS = { unit: "Example Venturer Unit", group: "1st Example Group", section: "Venturer Scouts" };

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("resolvePage", () => {
  it("swaps A4 dimensions for orientation and computes the printable width at 96 dpi", () => {
    const landscape = resolvePage({ pageSize: "A4", orientation: "landscape", margins: "normal" });
    expect([landscape.width, landscape.height]).toEqual([297, 210]);
    // (297 - 12 - 12) mm at 96/25.4 px per mm
    expect(landscape.printableWidthPx).toBe(Math.floor(273 * (96 / 25.4)));

    const portrait = resolvePage({ pageSize: "A4", orientation: "portrait", margins: "narrow" });
    expect([portrait.width, portrait.height]).toEqual([210, 297]);
    expect(portrait.margins.left).toBe(7);
  });

  it("rejects unknown page sizes rather than guessing", () => {
    expect(() => resolvePage({ pageSize: "B5" as never })).toThrow(/unknown page size/);
  });
});

describe("profiles", () => {
  it("has the Summary profile registered without relying on an import side effect", () => {
    expect(getPrintProfile("peak-award-summary").header.title).toBe(SUMMARY_TITLE);
  });

  it("throws for an unknown profile", () => {
    expect(() => getPrintProfile("nope")).toThrow(/unknown profile/);
  });
});

describe("mergeMeta", () => {
  it("merges by label, removes on null, and keeps the defaults' labels (Generated) last", () => {
    const merged = mergeMeta(
      [{ label: "Generated", value: "{generated}" }],
      [{ label: "Section", value: "{section}" }],
      [
        { label: "Patrol", value: "All" },
        { label: "Section", value: null },
      ],
    );
    expect(merged.map((m) => m.label)).toEqual(["Patrol", "Generated"]);
    expect(merged.length).toBeGreaterThan(0);
  });
});

describe("resolveHeaderFooter", () => {
  it("fills Summit's default header/footer from the profile and Terrain vars", () => {
    const r = resolveHeaderFooter({ source: document.body, profile: "peak-award-summary", vars: CONTEXT_VARS, generated: GENERATED, meta: [{ label: "Patrol", value: "All" }] });
    expect(r.header.title).toBe(SUMMARY_TITLE);
    expect(r.header.subtitle).toBe("1st Example Group · Example Venturer Unit");
    // No Section line: the logo and unit name already say it (user, 2026-10-10).
    expect(r.header.meta.map((m) => m.label)).toEqual(["Patrol", "Generated"]);
    expect(r.footer.left).toBe(`${SUMMARY_TITLE} · Example Venturer Unit`);
    expect(r.footer.center).toMatch(/^Generated 10\/10\/2026/);
    // Page counters are left for CSS to fill in.
    expect(r.footer.right).toBe(DEFAULT_FOOTER.right);
    expect(r.partFooter).toMatch(/Part \{part\} of \{parts\}$/);
  });

  it("tidies separators left dangling by an empty value instead of printing ' · '", () => {
    const r = resolveHeaderFooter({ source: document.body, profile: "peak-award-summary", vars: { ...CONTEXT_VARS, group: "" }, generated: GENERATED });
    expect(r.header.subtitle).toBe("Example Venturer Unit");
    const noUnit = resolveHeaderFooter({ source: document.body, profile: "peak-award-summary", vars: { ...CONTEXT_VARS, unit: "" }, generated: GENERATED });
    expect(noUnit.footer.left).toBe(SUMMARY_TITLE);
  });

  it("warns once about placeholders nobody supplied, and prints them as nothing", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const r = resolveHeaderFooter({ source: document.body, profile: "peak-award-summary", generated: GENERATED, footer: { left: "{nothing} · {title}" } });
    expect(r.footer.left).toBe(SUMMARY_TITLE);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0].join(" "))).toContain("{nothing}");
    warn.mockRestore();
  });
});

describe("buildPrintDocument (Summary profile)", () => {
  it("cleans the clone: no Vue scope attributes, no tooltips, no Vuetify <col>s, no screen sizes", () => {
    const host = mountSummaryTable();
    const doc = parse(buildPrintDocument({ source: host, profile: "peak-award-summary", vars: CONTEXT_VARS, generated: GENERATED }));
    const table = doc.querySelector("table.summit-print-table.summit-print-profile-peak-award-summary") as HTMLTableElement;
    expect(table).not.toBeNull();
    expect(table.outerHTML).not.toContain("data-v-");
    expect(table.querySelectorAll("[title]")).toHaveLength(0);
    expect((table.querySelector(".oas-heatmap-stage-bar") as HTMLElement).style.width).toBe("");
    expect((table.querySelector(".oas-heatmap-square") as HTMLElement).style.height).toBe("");
    // The live table is untouched.
    expect(host.querySelectorAll("[title]").length).toBeGreaterThan(0);
  });

  it("gives the 8-column (with Special) table 8 widths and the 7-column table 7", () => {
    for (const special of [true, false]) {
      const host = mountSummaryTable({ special });
      const doc = parse(buildPrintDocument({ source: host, profile: "peak-award-summary", vars: CONTEXT_VARS, generated: GENERATED }));
      const cols = doc.querySelectorAll("table.summit-print-table > colgroup > col");
      expect(cols).toHaveLength(special ? 8 : 7);
      const total = Array.from(cols).reduce((sum, c) => sum + parseFloat((c as HTMLElement).style.width), 0);
      expect(total).toBeCloseTo(100, 1);
      document.body.innerHTML = "";
    }
  });

  it("falls back to automatic widths for an unexpected column count", () => {
    const table = document.createElement("table");
    table.innerHTML = "<thead><tr><th>A</th><th>B</th></tr></thead>";
    expect(peakAwardSummaryWidths(table)).toBeNull();
  });

  it("puts the logo, title, subtitle and meta in the first-page header, escaped", () => {
    const host = mountSummaryTable();
    const doc = parse(
      buildPrintDocument({
        source: host,
        profile: "peak-award-summary",
        vars: { ...CONTEXT_VARS, unit: "Unit <b>&</b>" },
        generated: GENERATED,
        logo: "chrome-extension://abc/images/sections/Section_Venturer_Vert_FullCol.jpg",
      }),
    );
    expect(doc.querySelector(".summit-print-header img.summit-print-logo")?.getAttribute("src")).toContain("Section_Venturer");
    expect(doc.querySelector(".summit-print-header h1")?.textContent).toBe(SUMMARY_TITLE);
    expect(doc.querySelector(".summit-print-subtitle")?.textContent).toBe("1st Example Group · Unit <b>&</b>");
    expect(doc.querySelector(".summit-print-subtitle b")).toBeNull();
    expect(doc.querySelectorAll(".summit-print-meta dt").length).toBeGreaterThan(0);
  });

  it("omits the logo when there is none, and writes the chosen page size into @page", () => {
    const host = mountSummaryTable();
    const html = buildPrintDocument({ source: host, profile: "peak-award-summary", vars: CONTEXT_VARS, generated: GENERATED, pageSize: "A3", orientation: "landscape" });
    expect(parse(html).querySelector("img.summit-print-logo")).toBeNull();
    expect(html).toContain("size: 420mm 297mm;");
    expect(html).toContain("@bottom-right");
    expect(html).toContain("counter(pages)");
  });

  it("includes the borrowed font CSS ahead of the base styles", () => {
    const host = mountSummaryTable();
    const html = buildPrintDocument({ source: host, profile: "peak-award-summary", vars: CONTEXT_VARS, generated: GENERATED, fontCss: '@font-face { font-family: "SummitPrintSans"; }' });
    expect(html.indexOf("@font-face")).toBeGreaterThan(-1);
    expect(html.indexOf("@font-face")).toBeLessThan(html.indexOf("@page"));
  });

  it("uses the profile's portrait default when the caller passes no settings", () => {
    const { page, fit } = layoutOptions({ source: document.body, profile: "peak-award-summary", vars: CONTEXT_VARS });
    expect(page.width).toBe(210);
    expect(fit.layout).toBe("fit");
  });
});
