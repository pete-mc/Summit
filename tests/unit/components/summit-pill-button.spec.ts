import * as fs from "fs";
import * as path from "path";
import SummitPillButton, { PILL_COLOURS } from "@/components/SummitPillButton";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const read = (file: string) => fs.readFileSync(path.resolve(REPO_ROOT, file), "utf8");

function filesUnder(dir: string): string[] {
  return fs.readdirSync(path.resolve(REPO_ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(rel) : /\.(vue|ts|tsx|css)$/.test(entry.name) ? [rel] : [];
  });
}

/** One pill button: four scoped copies used to drift, and one page's button missed it entirely. */
describe("SummitPillButton", () => {
  it("is the only pill style: no page declares or uses the old .oas-vue-pill-btn class", () => {
    const files = filesUnder("src").filter((f) => !/SummitPillButton\.(ts|vue)$/.test(f));
    expect(files.length).toBeGreaterThan(50);
    const offenders = files.filter((f) => read(f).includes("oas-vue-pill-btn"));
    expect(offenders).toEqual([]);
  });

  it("reproduces Terrain's .medium pill shape (values read from Terrain's DevTools, 2026-10-12)", () => {
    const source = read("src/components/SummitPillButton.vue");
    const rule = source.slice(source.indexOf(".summit-pill-btn.v-btn {"), source.indexOf("}", source.indexOf(".summit-pill-btn.v-btn {")));
    ["font-size: 14px", "font-weight: 600", "height: 35px", "min-width: 80px", "padding: 0 18px", "border-radius: 25px"].forEach((decl) => expect(rule).toContain(decl));
  });

  it("uses Terrain's colour tokens: base blue outlined for minor, scouts medium blue filled for major", () => {
    expect(PILL_COLOURS.minor).toBe("var(--color-base-blue, #1070ca)");
    expect(PILL_COLOURS.major).toBe("var(--color-scouts-medium-blue, #00348d)");
    const computed = (SummitPillButton as unknown as { computed: { isMinor(this: unknown): boolean; colour(this: unknown): string } }).computed;
    expect(computed.isMinor.call({ variant: "minor" })).toBe(true);
    expect(computed.isMinor.call({ variant: "major" })).toBe(false);
    expect(computed.colour.call({ isMinor: false })).toBe(PILL_COLOURS.major);
  });

  it("is used by every page's toolbar pill buttons", () => {
    expect(read("src/pages/OasProgressionVue/components/OasProgressionVueContent.vue")).toContain("<SummitPillButton");
    expect(read("src/pages/PresentAwardsVue/components/PresentAwardsVueContent.vue")).toContain('<SummitPillButton variant="major" class="present-awards-save-btn"');
    expect(read("src/pages/IStatements/components/IStatementFilters.vue")).toContain("<SummitPillButton");
    expect(read("src/components/SummitPrintButton.vue")).toContain("<SummitPillButton");
  });
});
