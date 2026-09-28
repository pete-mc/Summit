import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const FILTERS = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue"), "utf8");

/**
 * The "Display" legend rendering larger than the neighbouring filter labels survived several
 * attempted fixes, because every rule involved already declared the same font-size — Vuetify
 * floats its input labels with transform: scale(0.75), so an 18px v-label PAINTS at 13.5px while
 * still reporting 18px in DevTools. The legend has no such transform.
 *
 * These assertions exist because the obvious "tidy-up" — folding 13.5px back into the shared
 * heading token — silently reintroduces the bug, and it is invisible in computed styles.
 */
describe("OAS Progression filters — Display heading size", () => {
  it("sizes the legend to what the scaled v-labels actually render at", () => {
    expect(FILTERS).toContain("font-size: 15px !important");
  });

  it("records that the value was measured, not computed from the scale factor", () => {
    // Deriving it arithmetically (18 × 0.75) produced 13.5px, which rendered a pixel too small:
    // scale() shrinks glyphs laid out at 18px, which is not the same as rendering at 13.5px.
    expect(FILTERS).toContain("scale(0.75)");
    expect(FILTERS).toContain("MEASURED, not computed");
    expect(FILTERS).toContain("13.5px");
  });

  it("keeps the legend's own layout overrides, which fixed the earlier half of the problem", () => {
    // Necessary but not sufficient on their own — see the comment in the SFC.
    expect(FILTERS).toContain("display: inline-block !important");
    expect(FILTERS).toContain("width: auto !important");
  });

  it("still shares one set of values for the labels that are scaled", () => {
    // The v-select labels and the legend's base class must stay in step; only the legend's own
    // rendered-size override differs.
    expect(FILTERS).toContain("font-size: var(--oas-vue-font-size-heading) !important");
  });
});
