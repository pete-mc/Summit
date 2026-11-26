import { ABOUT_GENERAL_POINTS, ABOUT_TAB_LINES } from "@/pages/OasProgressVue/components/OASAboutTabsVue";

describe("OASAboutTabsVue", () => {
  it("describes every tab, in tab order", () => {
    expect(ABOUT_TAB_LINES.map((line) => line.viewMode)).toEqual(["summary", "peakAward", "heatmap", "nextSteps", "stageGrid"]);
  });

  it("explains printing, remembered filters, clicking through, carried filters and the Back bar in General", () => {
    const general = ABOUT_GENERAL_POINTS.join(" ");
    ["printed", "remembers its own filters", "Click through", "keeps the patrol", "Back to"].forEach((phrase) => expect(general).toContain(phrase));
  });
});
