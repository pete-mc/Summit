import { buildMultiPartDocument, buildPrintDocument, layoutOptions, layoutParts, type MultiPartPrintOptions, type PrintOptions } from "@/print/summitPrint";
import { mountSummaryTable } from "./summaryFixture";

const VARS = { unit: "Example Venturer Unit", group: "1st Example Group", section: "Venturer Scouts" };
const GENERATED = new Date(2026, 9, 21, 9, 30);

/** Shaped like OASOverallProgressVue's render: Member + rotated skill/stream headers. Invented content. */
function mountOverallTable(columns = 6): HTMLElement {
  const heads = Array.from(
    { length: columns },
    (_, i) => `<th class="oas-overall-progress-column-header" title="Sort by this column"><div class="oas-overall-progress-rotated-text"><span>Skill ${i + 1}</span></div><i class="v-icon oas-overall-progress-sort-icon"></i></th>`,
  ).join("");
  const row = (name: string) => `<tr><td class="oas-heatmap-member-name">${name}</td>${Array.from({ length: columns }, () => '<td class="oas-overall-progress-cell">3<span class="oas-heatmap-stage-progress">.04</span></td>').join("")}</tr>`;
  const host = document.createElement("div");
  host.innerHTML = `<div class="v-data-table oas-heatmap-data-table oas-overall-progress-table"><div class="v-data-table__wrapper"><table><thead><tr><th class="oas-heatmap-member-header">Member</th>${heads}</tr></thead><tbody>${row("Alex Example")}${row("Blake Sample")}</tbody></table></div></div>`;
  document.body.appendChild(host);
  return host;
}

function options(overrides: Partial<MultiPartPrintOptions> = {}): MultiPartPrintOptions {
  return {
    parts: [
      { source: mountSummaryTable(), profile: "peak-award-summary", layout: "fit" },
      { source: mountOverallTable(), profile: "overall-progress", layout: "split" },
    ],
    pageSize: "A4",
    orientation: "landscape",
    margins: "normal",
    vars: VARS,
    generated: GENERATED,
    footerMode: "margin-box",
    ...overrides,
  };
}

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

afterEach(() => {
  document.body.innerHTML = "";
  jest.restoreAllMocks();
});

describe("buildMultiPartDocument", () => {
  it("prints each table in its own section, in order, each with its own heading", () => {
    const doc = parse(buildMultiPartDocument(options()));
    const sections = Array.from(doc.querySelectorAll<HTMLElement>("section.summit-print-part"));

    expect(sections.map((s) => s.dataset.summitPrintPart)).toEqual(["1", "2"]);
    expect(sections.map((s) => s.querySelector("h1")?.textContent)).toEqual(["OAS Progress - Summary - Towards Peak Award", "OAS Progress - Summary - Overall"]);
    expect(sections.map((s) => s.querySelector(".summit-print-subtitle")?.textContent)).toEqual(["1st Example Group · Example Venturer Unit", "1st Example Group · Example Venturer Unit"]);
    expect(sections[0].querySelector("table.summit-print-profile-peak-award-summary")).not.toBeNull();
    expect(sections[1].querySelector("table.summit-print-profile-overall-progress")).not.toBeNull();
  });

  it("gives each part a named page with its own footer, and one shared page size", () => {
    const html = buildMultiPartDocument(options());
    const doc = parse(html);
    const sections = Array.from(doc.querySelectorAll<HTMLElement>("section.summit-print-part"));

    expect(sections.map((s) => s.getAttribute("style"))).toEqual(["page: summit-part-1", "page: summit-part-2"]);
    expect(html).toMatch(/@page \{\s*size: 297mm 210mm;/);
    expect(html.match(/[^-]size: \d+mm/g)).toHaveLength(1);
    expect(html).toMatch(/@page summit-part-1 \{[^}]*@bottom-left \{\s*content: "OAS Progress - Summary - Towards Peak Award · Example Venturer Unit"/);
    expect(html).toMatch(/@page summit-part-2 \{[^}]*@bottom-left \{\s*content: "OAS Progress - Summary - Overall · Example Venturer Unit"/);
    expect(html).toContain('content: "Page " counter(page) " of " counter(pages)');
  });

  it("keeps each part's own fit/split choice, so profile layout styles still apply per table", () => {
    const sections = Array.from(parse(buildMultiPartDocument(options())).querySelectorAll("section.summit-print-part"));

    expect(sections[0].classList.contains("summit-print-layout-fit")).toBe(true);
    expect(sections[1].classList.contains("summit-print-layout-split")).toBe(true);
  });

  it("includes every part's profile styles once", () => {
    const html = buildMultiPartDocument(options());

    expect(html).toContain(".summit-print-profile-peak-award-summary");
    expect(html).toContain(".summit-print-profile-overall-progress");
  });

  it("strips the Overall table's sort arrows and sort tooltips", () => {
    const overall = parse(buildMultiPartDocument(options())).querySelector("table.summit-print-profile-overall-progress") as HTMLTableElement;

    expect(overall.querySelector(".oas-overall-progress-sort-icon")).toBeNull();
    expect(overall.querySelector("th[title]")).toBeNull();
  });

  it("prints a single ticked table as one part", () => {
    const doc = parse(buildMultiPartDocument(options({ parts: [{ source: mountOverallTable(), profile: "overall-progress" }] })));

    expect(doc.querySelectorAll("section.summit-print-part")).toHaveLength(1);
  });

  it("refuses an empty printout rather than printing a blank page", () => {
    expect(() => buildMultiPartDocument(options({ parts: [] }))).toThrow(/nothing to print/);
  });

  it("puts each part's footer on its own table in fallback mode, with no margin boxes", () => {
    const html = buildMultiPartDocument(options({ footerMode: "table" }));
    const tables = Array.from(parse(html).querySelectorAll("table.summit-print-table"));

    expect(html).not.toContain("@bottom-");
    expect(tables.map((t) => t.querySelector("tfoot.summit-print-tfoot")?.textContent)).toEqual([expect.stringContaining("Towards Peak Award"), expect.stringContaining("Summary - Overall")]);
  });
});

describe("buildPrintDocument (one table) is unchanged by multi-part support", () => {
  it("still has no part sections and keeps the footer on the unnamed page", () => {
    const html = buildPrintDocument({ source: mountSummaryTable(), profile: "peak-award-summary", vars: VARS, generated: GENERATED, footerMode: "margin-box" });

    expect(parse(html).querySelector("section.summit-print-part")).toBeNull();
    expect(html).toMatch(/@page \{\s*size: [^}]*@bottom-left/);
  });
});

describe("layoutParts (widths stubbed — jsdom has no layout engine)", () => {
  /** Overall columns are 100px each, so at most 3 fit the 350px page per band. The Peak Award table fits as is. */
  function layOut() {
    const multi = options();
    const doc = parse(buildMultiPartDocument(multi));
    Object.defineProperty(doc.body, "clientWidth", { value: 350 });
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const head = (this as HTMLTableElement).tHead;
      const isOverall = (this as HTMLElement).classList?.contains("summit-print-profile-overall-progress");
      const width = head ? (isOverall ? head.rows[0].cells.length * 100 : 300) : 0;
      return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    const perPart = multi.parts.map((part) => ({ ...multi, ...part }) as PrintOptions);
    const results = layoutParts(doc, perPart, perPart.map(layoutOptions));
    return { doc, results };
  }

  it("splits only the part set to split, naming its band pages after the part", () => {
    const { doc, results } = layOut();
    const part2 = doc.querySelector('[data-summit-print-part="2"]') as HTMLElement;
    const bands = Array.from(part2.querySelectorAll<HTMLElement>(".summit-print-band"));

    expect(results[1].bands).toBeGreaterThan(1);
    expect(bands.map((b) => b.style.getPropertyValue("page"))).toEqual(bands.map((_, i) => `summit-part-2-band-${i + 1}`));
    expect(doc.querySelector('[data-summit-print-part="1"] .summit-print-band')).toBeNull();
  });

  it("moves the Overall heading onto its own first band, not the Peak Award one", () => {
    const { doc } = layOut();
    const firstBand = doc.querySelector('[data-summit-print-part="2"] .summit-print-band');

    expect(firstBand?.querySelector(".summit-print-header h1")?.textContent).toBe("OAS Progress - Summary - Overall");
    expect(doc.querySelector('[data-summit-print-part="1"] .summit-print-header h1')?.textContent).toBe("OAS Progress - Summary - Towards Peak Award");
  });

  it("gives the band pages the part's own left/right footers as well as the part number", () => {
    const { doc } = layOut();
    const bandCss = Array.from(doc.head.querySelectorAll("style"))
      .map((s) => s.textContent)
      .join("\n");

    expect(bandCss).toMatch(/@page summit-part-2-band-1 \{[^]*?@bottom-left \{\s*content: "OAS Progress - Summary - Overall · Example Venturer Unit"/);
    expect(bandCss).toMatch(/@page summit-part-2-band-1 \{[^]*?counter\(page\)/);
  });
});
