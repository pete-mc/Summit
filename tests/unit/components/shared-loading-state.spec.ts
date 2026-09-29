import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const read = (relative: string) => fs.readFileSync(path.resolve(REPO_ROOT, relative), "utf8");

const LOADING_VUE = read("src/components/SummitLoadingState.vue");
const LOADING_TS = read("src/components/SummitLoadingState.ts");

const I_CONTENT = read("src/pages/IStatements/components/IStatementsContent.vue");
const I_CONTENT_TS = read("src/pages/IStatements/components/IStatementsContent.ts");
const AWARDS_CONTENT = read("src/pages/PresentAwardsVue/components/PresentAwardsVueContent.vue");
const AWARDS_CONTENT_TS = read("src/pages/PresentAwardsVue/components/PresentAwardsVueContent.ts");
const OAS_CONTENT = read("src/pages/OasProgressionVue/components/OasProgressionVueContent.vue");
const OAS_CONTENT_TS = read("src/pages/OasProgressionVue/components/OasProgressionVueContent.ts");
const OAS_PAGE = read("src/pages/OasProgressionVue/OasProgressionVue.ts");

/** Strips comments so assertions test what the file DOES, not what it says about itself. */
const withoutComments = (source: string) => source.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

const PAGES: Array<[string, string, string]> = [
  ["I Statements", I_CONTENT, I_CONTENT_TS],
  ["Present Awards", AWARDS_CONTENT, AWARDS_CONTENT_TS],
  ["OAS Progression", OAS_CONTENT, OAS_CONTENT_TS],
];

describe("SummitLoadingState — one indicator, normalised props", () => {
  it("lives in shared components, not under any one page", () => {
    // A component owned by IStatements/ would make that page load-bearing for two others it has
    // nothing to do with.
    expect(fs.existsSync(path.resolve(REPO_ROOT, "src/components/SummitLoadingState.vue"))).toBe(true);
  });

  it("is indeterminate without counts and determinate with them", () => {
    // One component covers both of I Statements' phases: trees (no knowable total) then
    // templates (countable).
    expect(LOADING_VUE).toContain(':indeterminate="!hasCounts"');
    expect(LOADING_VUE).toContain(':value="percent"');
  });

  it("treats a zero total as 'no counts yet' rather than 0%", () => {
    // Dividing by it would peg the bar at 0% and look stalled instead of showing motion.
    expect(LOADING_TS).toContain("this.total > 0");
  });

  it("renders Retry only when given something to retry", () => {
    expect(LOADING_VUE).toContain('v-if="onRetry"');
  });

  it("keeps its styling scoped to itself rather than in the global sheet", () => {
    // DESIGN.md sends a shared *class* to index.css, but a shared *component* carries its own
    // styles and so cannot be redeclared per page — the failure .oas-vue-filter-panel had.
    expect(LOADING_VUE).toContain("<style scoped>");
    expect(withoutComments(read("src/styles/index.css"))).not.toContain(".summit-loading");
  });
});

describe("All three pages use the shared indicator", () => {
  it.each(PAGES)("%s renders SummitLoadingState", (_name, template, ts) => {
    expect(template).toContain("<SummitLoadingState");
    expect(ts).toContain('import SummitLoadingState from "@/components/SummitLoadingState.vue"');
    expect(ts).toContain("SummitLoadingState");
  });

  it.each(PAGES)("%s no longer hand-rolls its own progress bar", (_name, template) => {
    // The whole point of the extraction: one <v-progress-linear> in the codebase, in the shared
    // component. A page reintroducing its own is how the three drifted apart to begin with.
    expect(withoutComments(template)).not.toContain("<v-progress-linear");
  });

  it.each(PAGES)("%s offers a retry rather than telling the user to reload", (_name, template) => {
    expect(template).toContain(":on-retry=");
  });
});

describe("Present Awards — the reported bug", () => {
  it("gates the table on having content instead of rendering it while loading", () => {
    // The bug was never a missing spinner: loadState was tracked correctly and the table
    // rendered anyway, showing headers with no rows, which reads as "no awards".
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

  it("keeps save/export feedback outside the content gate", () => {
    // The "Saved." confirmation lands while the post-save reload is in flight.
    const beforeGate = AWARDS_CONTENT.slice(0, AWARDS_CONTENT.indexOf('v-if="hasContent"', AWARDS_CONTENT.indexOf("<SummitLoadingState")));
    expect(beforeGate).toContain("data-grid-export-feedback");
  });

  it("drops the old 'try reloading the page' text now Retry works", () => {
    expect(AWARDS_CONTENT).not.toContain("Try reloading the page");
  });
});

describe("OAS Progression — gains a progress bar and an error state", () => {
  it("no longer swallows a failed load", () => {
    // It previously only called logger.error, leaving a permanently empty heat map.
    expect(OAS_PAGE).toContain("this.loadError = true");
    expect(OAS_CONTENT_TS).toContain("loadError");
  });

  it("clears in-flight streams on failure so the bar cannot stick", () => {
    const handler = OAS_PAGE.slice(OAS_PAGE.indexOf("failed to load OAS progression data"));
    expect(handler.slice(0, handler.indexOf("},"))).toContain("new Set<string>()");
  });

  it("counts the nine skills from one shared constant", () => {
    // The bar's denominator and the set of streams awaited must not drift apart.
    expect(OAS_PAGE).toContain("const ALL_STREAMS");
    expect(OAS_PAGE).toContain("new Set(ALL_STREAMS)");
    expect(OAS_PAGE).toContain("totalStreams: ALL_STREAMS.length");
  });

  it("shows partial results alongside the bar rather than hiding them", () => {
    // Deliberately unlike the other two pages: streams arrive one at a time and each renders as
    // it lands, so hiding the body until all nine finish would feel slower, and a per-stream
    // reload would blank a full screen to refresh one skill.
    expect(OAS_CONTENT_TS).toContain("hasContent()");
    expect(OAS_CONTENT_TS).toContain("this.items.length > 0");
    expect(OAS_CONTENT).toContain('v-if="hasContent && ');
  });

  it("does not gate its loading state on items, so a reload still shows progress", () => {
    const state = OAS_CONTENT_TS.slice(OAS_CONTENT_TS.indexOf("sharedLoadState()"));
    expect(state.slice(0, state.indexOf("},"))).toContain("this.loadingStreams.size > 0");
  });
});
