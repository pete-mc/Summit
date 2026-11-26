import { commonDefaultsForAllTabs, commonDefaultsForTab } from "@/pages/OasProgressVue/services/oasFilterDefaults";
import { SYSTEM_FILTER_DEFAULTS } from "@/shared/filterDefaults";

const defaults = { nameFormat: "codename" as const, sortBy: "lastName" as const, breakByPatrol: true, showApproved: false, showSkillsNotStarted: false, showStagesNotStarted: false };

describe("commonDefaultsForTab", () => {
  it("maps each tab onto only its own filter keys", () => {
    expect(Object.keys(commonDefaultsForTab("summary", defaults)).every((key) => key.indexOf("summary") === 0)).toBe(true);
    expect(Object.keys(commonDefaultsForTab("peakAward", defaults)).every((key) => key.indexOf("peakAward") === 0)).toBe(true);
    expect(Object.keys(commonDefaultsForTab("stageGrid", defaults)).every((key) => key.indexOf("stageGrid") === 0)).toBe(true);
    expect(commonDefaultsForTab("nextSteps", defaults)).toEqual({ nextStepsNameFormat: "codename" });
    expect(commonDefaultsForTab("about", defaults)).toEqual({});
  });

  it("gives the Heat Map both not-started settings and Approved", () => {
    expect(commonDefaultsForTab("heatmap", defaults)).toEqual({
      nameFormat: "codename",
      sortBy: "lastName",
      selectedPatrols: null,
      breakByPatrol: true,
      showApproved: false,
      showEmptySkillRows: false,
      showNotStarted: false,
    });
  });

  it("starts every tab's patrol filter at All Patrols (null)", () => {
    const all = commonDefaultsForAllTabs(SYSTEM_FILTER_DEFAULTS);
    expect([all.summarySelectedPatrols, all.peakAwardSelectedPatrols, all.selectedPatrols, all.stageGridSelectedPatrols]).toEqual([null, null, null, null]);
  });
});
