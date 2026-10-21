import { cellGrid, columnCount, cssContent, sliceColumns } from "@/print/printFit";

function table(html: string): HTMLTableElement {
  const t = document.createElement("table");
  t.innerHTML = html;
  return t;
}

// Member | Progress | Core Skills (3) | Progressions — the Summary tab's header shape.
const SPANNED = table(`
  <thead>
    <tr><th rowspan="2">Member</th><th rowspan="2">Progress</th><th colspan="3">Core Skills</th><th rowspan="2">Progressions</th></tr>
    <tr><th>Bushcraft</th><th>Bushwalking</th><th>Camping</th></tr>
  </thead>
  <tbody><tr><td>A</td><td>1</td><td>b</td><td>w</td><td>c</td><td>p</td></tr></tbody>`);

describe("cellGrid / columnCount", () => {
  it("places cells in their logical columns, honouring rowspan and colspan", () => {
    const grid = cellGrid(SPANNED.tHead as HTMLTableSectionElement);
    const byText = (t: string) => grid.filter((g) => g.cell.textContent === t)[0];
    expect(grid.length).toBeGreaterThan(0);
    expect(byText("Core Skills")).toMatchObject({ col: 2, span: 3 });
    expect(byText("Progressions").col).toBe(5);
    // Row 2 skips the two rowspan'd columns.
    expect(byText("Bushcraft").col).toBe(2);
    expect(byText("Camping").col).toBe(4);
    expect(columnCount(SPANNED)).toBe(6);
  });
});

describe("sliceColumns", () => {
  it("keeps only the requested columns and shrinks spanning headers to fit", () => {
    const sliced = sliceColumns(SPANNED, [0, 3, 4]);
    const headerTexts = Array.from(sliced.querySelectorAll("th")).map((th) => th.textContent);
    expect(headerTexts).toEqual(["Member", "Core Skills", "Bushwalking", "Camping"]);
    expect((sliced.querySelector("th[colspan]") as HTMLTableCellElement).colSpan).toBe(2);
    expect(Array.from(sliced.querySelectorAll("td")).map((td) => td.textContent)).toEqual(["A", "w", "c"]);
    // The original is untouched.
    expect(SPANNED.querySelectorAll("th")).toHaveLength(7);
  });

  it("drops a spanning header entirely when none of its columns are kept", () => {
    const sliced = sliceColumns(SPANNED, [0, 1, 5]);
    expect(sliced.textContent).not.toContain("Core Skills");
  });

  it("renormalises percentage <col> widths for the kept columns", () => {
    const t = table(`<colgroup><col style="width:50%"><col style="width:25%"><col style="width:25%"></colgroup><tbody><tr><td>a</td><td>b</td><td>c</td></tr></tbody>`);
    const cols = Array.from(sliceColumns(t, [0, 2]).querySelectorAll("col")) as HTMLElement[];
    expect(cols.map((c) => parseFloat(c.style.width))).toEqual([66.667, 33.333]);
  });
});

describe("cssContent", () => {
  it("turns {page}/{pages} into CSS counters and quotes the rest", () => {
    expect(cssContent("Page {page} of {pages}")).toBe('"Page " counter(page) " of " counter(pages)');
  });

  it("escapes quotes and backslashes", () => {
    expect(cssContent('a "b" \\c')).toBe('"a \\"b\\" \\\\c"');
  });

  it("returns an empty CSS string for an empty template", () => {
    expect(cssContent("")).toBe('""');
  });
});
