import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
const read = (relative: string) => fs.readFileSync(path.resolve(REPO_ROOT, relative), "utf8");

const AWARDS_CONTENT = read("src/pages/PresentAwardsVue/components/PresentAwardsVueContent.vue");
const AWARDS_CONTENT_TS = read("src/pages/PresentAwardsVue/components/PresentAwardsVueContent.ts");

describe("Present Awards — the reported bug", () => {
  it("gates the table on having content instead of rendering it while loading", () => {
    // Regression: the table rendered empty during load, which read as "no awards".
    const gated = AWARDS_CONTENT.slice(AWARDS_CONTENT.indexOf('v-if="hasContent"', AWARDS_CONTENT.indexOf("<SummitLoadingState")));
    expect(gated).toContain("<PresentAwardsTableVue");
    expect(gated).toContain("<PresentAwardsFiltersVue");
  });

  it("hides the actions that would act on unloaded data", () => {
    const header = AWARDS_CONTENT.slice(0, AWARDS_CONTENT.indexOf("<SummitLoadingState"));
    expect(header).toContain('v-if="hasContent"');
  });

  it("does not blank the table on save, which re-runs the load", () => {
    // saveAwards() calls loadAwards(), so gating on loadState alone would clear a screen of
    // ticked checkboxes every time the user pressed Save — worse than the bug being fixed.
    expect(AWARDS_CONTENT_TS).toContain("hasContent()");
    const state = AWARDS_CONTENT_TS.slice(AWARDS_CONTENT_TS.indexOf("sharedLoadState()"));
    expect(state.slice(0, state.indexOf("},"))).toContain("!this.hasContent");
  });

  it("drops the old 'try reloading the page' text now Retry works", () => {
    expect(AWARDS_CONTENT).not.toContain("Try reloading the page");
  });
});
