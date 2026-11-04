import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const read = (relative: string) => fs.readFileSync(path.resolve(REPO_ROOT, relative), "utf8");

const LOADING_VUE = read("src/components/SummitLoadingState.vue");
const LOADING_TS = read("src/components/SummitLoadingState.ts");

const OAS_CONTENT = read("src/pages/OasProgressVue/components/OasProgressVueContent.vue");
const OAS_CONTENT_TS = read("src/pages/OasProgressVue/components/OasProgressVueContent.ts");
const OAS_PAGE = read("src/pages/OasProgressVue/OasProgressVue.ts");

/** Strips comments so assertions test what the file DOES, not what it says about itself. */
const withoutComments = (source: string) => source.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

/** Gotcha: pages still in development can be left out of a release branch, so only the pages present are checked. */
const OPTIONAL_PAGES: Array<[string, string]> = [
  ["I Statements", "src/pages/IStatements/components/IStatementsContent"],
  ["Present Awards", "src/pages/PresentAwardsVue/components/PresentAwardsVueContent"],
];

const PAGES: Array<[string, string, string]> = [
  ...OPTIONAL_PAGES.filter(([, base]) => fs.existsSync(path.resolve(REPO_ROOT, `${base}.vue`))).map(([name, base]): [string, string, string] => [name, read(`${base}.vue`), read(`${base}.ts`)]),
  ["OAS Progress", OAS_CONTENT, OAS_CONTENT_TS],
];

describe("SummitLoadingState — one indicator, normalised props", () => {
  it("lives in shared components, not under any one page", () => {
    expect(fs.existsSync(path.resolve(REPO_ROOT, "src/components/SummitLoadingState.vue"))).toBe(true);
  });

  it("is indeterminate without counts and determinate with them", () => {
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
    // A shared component carries its own styles, so they can't be redeclared (and drift) per page.
    expect(LOADING_VUE).toContain("<style scoped>");
    expect(withoutComments(read("src/styles/index.css"))).not.toContain(".summit-loading");
  });
});

describe("Every page uses the shared indicator", () => {
  it.each(PAGES)("%s renders SummitLoadingState", (_name, template, ts) => {
    expect(template).toContain("<SummitLoadingState");
    expect(ts).toContain('import SummitLoadingState from "@/components/SummitLoadingState.vue"');
    expect(ts).toContain("SummitLoadingState");
  });

  it.each(PAGES)("%s no longer hand-rolls its own progress bar", (_name, template) => {
    // One <v-progress-linear> in the codebase; per-page copies are how the pages drifted.
    expect(withoutComments(template)).not.toContain("<v-progress-linear");
  });

  it.each(PAGES)("%s offers a retry rather than telling the user to reload", (_name, template) => {
    expect(template).toContain(":on-retry=");
  });
});

describe("OAS Progress — gains a progress bar and an error state", () => {
  it("no longer swallows a failed load", () => {
    expect(OAS_PAGE).toContain("this.loadError = true");
    expect(OAS_CONTENT_TS).toContain("loadError");
  });

  it("clears in-flight streams on failure so the bar cannot stick", () => {
    const handler = OAS_PAGE.slice(OAS_PAGE.indexOf("failed to load OAS progress data"));
    expect(handler.slice(0, handler.indexOf("},"))).toContain("new Set<string>()");
  });

  it("counts the nine skills from one shared constant", () => {
    expect(OAS_PAGE).toContain("const ALL_STREAMS");
    expect(OAS_PAGE).toContain("new Set(ALL_STREAMS)");
    expect(OAS_PAGE).toContain("totalStreams: ALL_STREAMS.length");
  });

  it("shows partial results alongside the bar rather than hiding them", () => {
    expect(OAS_CONTENT_TS).toContain("hasContent()");
    expect(OAS_CONTENT_TS).toContain("this.items.length > 0");
    expect(OAS_CONTENT).toContain('v-if="hasContent && ');
  });

  it("does not gate its loading state on items, so a reload still shows progress", () => {
    const state = OAS_CONTENT_TS.slice(OAS_CONTENT_TS.indexOf("sharedLoadState()"));
    expect(state.slice(0, state.indexOf("},"))).toContain("this.loadingStreams.size > 0");
  });
});
