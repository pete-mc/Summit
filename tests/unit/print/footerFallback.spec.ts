import { browserLacksFooterSupport, chromiumMajorVersion, FOOTER_FALLBACK_KEY, footerMode } from "@/print/printSupport";
import { buildPrintDocument, getPrintProfile, layoutOptions } from "@/print/summitPrint";
import { layoutTable } from "@/print/printFit";

const VARS = { unit: "Example Venturer Unit", group: "1st Example Group", section: "Venturer Scouts" };
const GENERATED = new Date(2026, 9, 11, 9, 30);

const EDGE_141 = { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0" };
const EDGE_120 = { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0" };
const FIREFOX = { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0" };

afterEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = "";
  jest.restoreAllMocks();
});

describe("printSupport detection", () => {
  it("reads the Chromium version from userAgentData brands, then from the user agent", () => {
    expect(
      chromiumMajorVersion({
        userAgent: "",
        userAgentData: {
          brands: [
            { brand: "Microsoft Edge", version: "141" },
            { brand: "Chromium", version: "141" },
          ],
        },
      }),
    ).toBe(141);
    expect(chromiumMajorVersion(EDGE_120)).toBe(120);
    expect(chromiumMajorVersion(FIREFOX)).toBeNull();
  });

  it("uses margin-box footers on Chromium 131+ and the table fallback otherwise — including unknown browsers", () => {
    expect(footerMode(EDGE_141)).toBe("margin-box");
    expect(footerMode({ userAgent: "Chrome/131.0" })).toBe("margin-box");
    expect(footerMode(EDGE_120)).toBe("table");
    expect(footerMode(FIREFOX)).toBe("table");
    expect(footerMode({ userAgent: "" })).toBe("table");
  });

  it("can be forced to the fallback for testing, without the dialog claiming the browser is old", () => {
    window.localStorage.setItem(FOOTER_FALLBACK_KEY, "force");
    expect(footerMode(EDGE_141)).toBe("table");
    expect(browserLacksFooterSupport(EDGE_141)).toBe(false);
    expect(browserLacksFooterSupport(EDGE_120)).toBe(true);
  });
});

/** Heatmap-shaped table: Member | Stage | stages 1-4. Invented content only. */
function mountHeatmap(): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = `
<div class="oas-heatmap-data-table"><table>
  <thead><tr><th class="oas-heatmap-member-header">Member</th><th>Stage</th><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead>
  <tbody>
    <tr class="oas-heatmap-skill-title-row"><td colspan="6">Camping</td></tr>
    <tr><td>Member A</td><td>2</td><td>a</td><td>b</td><td>c</td><td>d</td></tr>
  </tbody>
</table></div>`;
  document.body.appendChild(host);
  return host;
}

describe("fallback footer in the print document", () => {
  it("adds a <tfoot> spanning every column, without the page counter, and drops the margin boxes", () => {
    const html = buildPrintDocument({ source: mountHeatmap(), profile: "skill-heatmap", vars: VARS, generated: GENERATED, footerMode: "table" });
    const doc = new DOMParser().parseFromString(html, "text/html");
    const cell = doc.querySelector("table.summit-print-table > tfoot.summit-print-tfoot td") as HTMLTableCellElement;
    expect(cell.colSpan).toBe(6);
    expect(doc.querySelector(".summit-print-foot-left")?.textContent).toBe("OAS Progression - Heatmap · Example Venturer Unit");
    expect(doc.querySelector(".summit-print-foot-center")?.textContent).toMatch(/^Generated 11\/10\/2026/);
    expect(doc.querySelector(".summit-print-foot-right")?.textContent).toBe(""); // was "Page {page} of {pages}"
    expect(html).not.toContain("@bottom-");
  });

  it("keeps margin-box footers and adds no <tfoot> by default", () => {
    const html = buildPrintDocument({ source: mountHeatmap(), profile: "skill-heatmap", vars: VARS, generated: GENERATED });
    expect(html).toContain("@bottom-right");
    // Checked in the DOM, not the HTML text: the base stylesheet always names the tfoot class.
    expect(new DOMParser().parseFromString(html, "text/html").querySelector("tfoot")).toBeNull();
  });
});

describe("fit has no width tolerance (right edge fix, 2026-10-11)", () => {
  it("treats a table even 1px wider than the printable width as overflowing, and shrinks it", () => {
    const doc = new DOMParser().parseFromString(buildPrintDocument({ source: mountHeatmap(), profile: "skill-heatmap", vars: VARS, generated: GENERATED }), "text/html");
    Object.defineProperty(doc.body, "clientWidth", { value: 702 }); // A4 portrait, normal margins (702.99 rounded down)
    // jsdom silently drops the (non-standard) CSS zoom property, so record what the code sets.
    const zoomOf = new Map<CSSStyleDeclaration, number>();
    const realSetProperty = CSSStyleDeclaration.prototype.setProperty;
    jest.spyOn(CSSStyleDeclaration.prototype, "setProperty").mockImplementation(function (this: CSSStyleDeclaration, name: string, value: string | null, priority?: string) {
      if (name === "zoom") zoomOf.set(this, parseFloat(String(value)));
      return realSetProperty.call(this, name, value, priority);
    });
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const zoom = zoomOf.get((this as HTMLElement).style) ?? 1;
      const width = (this as HTMLTableElement).tHead ? 703 * zoom : 0;
      return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    const result = layoutTable(doc, { layout: "fit", minZoom: 0.7 });
    expect(result.zoom).toBeLessThan(1);
    expect(result.overflow).toBe(false);
  });
});

describe("split printouts (widths stubbed — jsdom has no layout engine)", () => {
  /** Each column is 100px wide; the page is 350px, so at most 3 columns fit per part. */
  function layOut(footer: "margin-box" | "table") {
    const options = { source: mountHeatmap(), profile: "skill-heatmap", vars: VARS, generated: GENERATED, layout: "split" as const, footerMode: footer };
    const doc = new DOMParser().parseFromString(buildPrintDocument(options), "text/html");
    Object.defineProperty(doc.body, "clientWidth", { value: 350 });
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const head = (this as HTMLTableElement).tHead;
      const width = head ? head.rows[0].cells.length * 100 : 0;
      return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    const result = layoutTable(doc, layoutOptions(options).fit);
    return { doc, result };
  }

  it("repeats only the Member column on every part (user, 2026-10-11)", () => {
    expect(getPrintProfile("skill-heatmap").repeatColumns).toBe(1);
    expect(getPrintProfile("peak-award-summary").repeatColumns).toBe(1);

    const { doc, result } = layOut("margin-box");
    expect(result.bands).toBe(3);
    const firstHeaders = Array.from(doc.querySelectorAll(".summit-print-band table")).map((t) => (t as HTMLTableElement).tHead?.rows[0].cells[0].textContent);
    expect(firstHeaders).toEqual(["Member", "Member", "Member"]);
    // Stage is printed once, on part 1 — not repeated.
    expect(doc.querySelectorAll(".summit-print-band th").length).toBeGreaterThan(0);
    expect(Array.from(doc.querySelectorAll(".summit-print-band th")).filter((th) => th.textContent === "Stage")).toHaveLength(1);
    // Margin-box mode: the part number goes in a named @page footer.
    expect(doc.head.innerHTML).toContain("@page summit-band-2");
  });

  it("in fallback mode, puts 'Part n of m' in each part's own table footer instead of a named @page", () => {
    const { doc, result } = layOut("table");
    expect(result.bands).toBe(3);
    const centres = Array.from(doc.querySelectorAll(".summit-print-band .summit-print-foot-center")).map((c) => c.textContent);
    expect(centres).toHaveLength(3);
    expect(centres[1]).toMatch(/Part 2 of 3$/);
    expect(doc.head.innerHTML).not.toContain("@page summit-band");
  });
});
