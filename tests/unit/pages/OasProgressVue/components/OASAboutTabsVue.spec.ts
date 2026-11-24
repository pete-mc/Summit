import { ABOUT_TAB_LINES } from "@/pages/OasProgressVue/components/OASAboutTabsVue";

describe("OASAboutTabsVue", () => {
  it("describes every tab, in tab order", () => {
    expect(ABOUT_TAB_LINES.map((line) => line.viewMode)).toEqual(["summary", "peakAward", "heatmap", "nextSteps", "stageGrid"]);
  });
});
