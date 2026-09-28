import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const EXPORT = fs.readFileSync(path.resolve(REPO_ROOT, "src/components/gridExport.ts"), "utf8");

/**
 * The PDF page-break tiers, asserted against the source because the functions are module-private
 * and the behaviour is geometry-based (it needs real laid-out rows, which jsdom does not provide).
 *
 * This exists because the bug it guards shipped unnoticed: a patrol heading shared a tier with a
 * skill heading, so "Break by patrol" made the exporter split skills across pages and strand
 * their headings. Nothing failed — the PDF was simply wrong, which only a person opening it
 * would catch.
 */
describe("gridExport — page break tiers", () => {
  it("treats only the top-level heading as a section boundary", () => {
    expect(EXPORT).toContain('const SECTION_HEADING_ROW_SELECTOR = ".oas-heatmap-skill-title-row"');
  });

  it("ranks a patrol heading below a section heading rather than alongside it", () => {
    expect(EXPORT).toContain('const SUB_HEADING_ROW_SELECTOR = ".oas-heatmap-patrol-title-row"');
    // The old single-selector form is what caused the bug.
    expect(EXPORT).not.toContain('".oas-heatmap-skill-title-row, .oas-heatmap-patrol-title-row"');
  });

  it("tries section, then sub-section, then any row", () => {
    expect(EXPORT).toMatch(/breaks\.sectionBreaksPx\.filter\(fitsWithinPage\)\.pop\(\)\s*\?\?\s*breaks\.subSectionBreaksPx\.filter\(fitsWithinPage\)\.pop\(\)\s*\?\?\s*breaks\.rowBreaksPx\.filter\(fitsWithinPage\)\.pop\(\)/);
  });

  it("breaks before a heading, never after it", () => {
    // Breaking after a heading strands it at the foot of a page, away from its own rows.
    expect(EXPORT).toContain("const previousBottom = rowBottomPx(rows[index - 1])");
  });

  it("ends both heading tiers at the table's last row", () => {
    // Without this the final section has no boundary and the last page falls back to a raw slice.
    expect(EXPORT).toContain("sectionBreaksPx.push(tableBottom)");
    expect(EXPORT).toContain("subSectionBreaksPx.push(tableBottom)");
  });
});
