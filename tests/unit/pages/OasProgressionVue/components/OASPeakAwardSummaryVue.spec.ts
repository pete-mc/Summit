import { awardTooltip, buildBoxGroupView, buildRowView, formatAwardDate, skillTitle } from "@/pages/OasProgressionVue/components/OASPeakAwardSummaryVue";
import type { PeakAwardBox, PeakAwardMemberRow } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";

function makeAward(overrides: Partial<NonNullable<PeakAwardBox["award"]>> = {}): NonNullable<PeakAwardBox["award"]> {
  return { stream: "bushcraft", branch: "bushcraft", stage: 3, section: "venturer", date: "2026-03-01", ...overrides };
}

function makeBox(overrides: Partial<PeakAwardBox> = {}): PeakAwardBox {
  return { met: true, award: makeAward(), ...overrides };
}

describe("skillTitle", () => {
  it("looks up a known skill's display title", () => {
    expect(skillTitle("bushwalking")).toBe("Bushwalking");
  });

  it("falls back to the raw key for an unknown skill", () => {
    expect(skillTitle("mystery")).toBe("mystery");
  });
});

describe("formatAwardDate", () => {
  it("formats an ISO date-only string as dd/mm/yyyy", () => {
    expect(formatAwardDate("2026-03-05")).toBe("05/03/2026");
  });

  it("formats a full ISO timestamp as dd/mm/yyyy", () => {
    expect(formatAwardDate("2021-06-15T00:00:00.000Z")).toBe("15/06/2021");
  });

  it("returns an empty string for null", () => {
    expect(formatAwardDate(null)).toBe("");
  });

  it("returns the raw string unchanged when it can't be parsed as a date", () => {
    expect(formatAwardDate("not-a-date")).toBe("not-a-date");
  });
});

describe("awardTooltip", () => {
  it("formats '{Branch} - Stage {x} - {Date} as a {Section}' for a met award", () => {
    const award = makeAward({ branch: "pioneering", date: "2026-03-05", section: "venturer" });

    expect(awardTooltip(award, 4)).toBe("Pioneering - Stage 4 - 05/03/2026 as a Venturer");
  });

  it("uses the award's own BRANCH, not its parent stream, when they differ (a forked skill)", () => {
    const award = makeAward({ stream: "bushcraft", branch: "survival-skills" });

    expect(awardTooltip(award, 5)).toContain("Survival Skills");
    expect(awardTooltip(award, 5)).not.toContain("Bushcraft");
  });

  it("uses the stage number passed in, not the award's own stage (for a collapsed bar describing the whole group)", () => {
    const award = makeAward({ stage: 2 });

    expect(awardTooltip(award, 9)).toContain("Stage 9");
  });

  it("returns null for an unmet box (no award)", () => {
    expect(awardTooltip(null, 3)).toBeNull();
  });
});

describe("buildBoxGroupView", () => {
  it("renders as individual boxes when nothing is met", () => {
    const boxes: PeakAwardBox[] = [makeBox({ met: false, award: null }), makeBox({ met: false, award: null })];

    const view = buildBoxGroupView(boxes);

    expect(view.kind).toBe("boxes");
    expect(view.boxCount).toBe(2);
    expect(view.boxes.map((b) => b.met)).toEqual([false, false]);
  });

  it("renders as individual boxes when only SOME are met (a met box is purple/answered, not green)", () => {
    const boxes: PeakAwardBox[] = [makeBox({ met: true }), makeBox({ met: false, award: null })];

    const view = buildBoxGroupView(boxes);

    expect(view.kind).toBe("boxes");
    expect(view.boxes.map((b) => b.met)).toEqual([true, false]);
    expect(view.boxes[0].title).not.toBeNull();
  });

  it("each individual box's tooltip uses that box's own award stage, not its position in the array", () => {
    const boxes: PeakAwardBox[] = [makeBox({ met: true, award: makeAward({ stage: 1 }) }), makeBox({ met: false, award: null }), makeBox({ met: true, award: makeAward({ stage: 3 }) })];

    const view = buildBoxGroupView(boxes);

    expect(view.boxes[0].title).toContain("Stage 1");
    expect(view.boxes[2].title).toContain("Stage 3");
  });

  it("collapses into a single bar once every box is met, with the bar's own tooltip using the box count as the stage", () => {
    const boxes: PeakAwardBox[] = [makeBox({ met: true, award: makeAward({ stage: 1 }) }), makeBox({ met: true, award: makeAward({ stage: 2 }) })];

    const view = buildBoxGroupView(boxes);

    expect(view.kind).toBe("bar");
    expect(view.boxCount).toBe(2);
    expect(view.barTitle).toContain("Stage 2");
    expect(view.boxes).toEqual([]);
  });

  it("renders as individual (empty) boxes, not a bar, when there are zero boxes to begin with", () => {
    const view = buildBoxGroupView([]);

    expect(view.kind).toBe("boxes");
    expect(view.boxCount).toBe(0);
  });
});

function makeMemberRow(overrides: Partial<PeakAwardMemberRow> = {}): PeakAwardMemberRow {
  return {
    memberId: "m1",
    memberName: "Alex Scout",
    firstName: "Alex",
    lastName: "Scout",
    patrolName: null,
    coreSkills: [
      { skill: "bushcraft", requiredStage: 5, highestAwardedStage: 0, boxes: Array.from({ length: 5 }, () => makeBox({ met: false, award: null })), met: false },
      { skill: "bushwalking", requiredStage: 5, highestAwardedStage: 0, boxes: Array.from({ length: 5 }, () => makeBox({ met: false, award: null })), met: false },
      { skill: "camping", requiredStage: 5, highestAwardedStage: 0, boxes: Array.from({ length: 5 }, () => makeBox({ met: false, award: null })), met: false },
    ],
    totalProgressions: 0,
    requiredProgressions: 12,
    progressionBoxes: Array.from({ length: 12 }, () => makeBox({ met: false, award: null })),
    special: null,
    progressScore: 0,
    progressTotal: 31,
    progressPercent: 0,
    ...overrides,
  };
}

describe("buildRowView", () => {
  it("formats the Progress column text as 'X of Y (Z%)'", () => {
    const row = makeMemberRow({ progressScore: 7, progressTotal: 31, progressPercent: 22 });

    const view = buildRowView(row, "full");

    expect(view.progressText).toBe("7 of 31 (22%)");
  });

  it("formats the Progressions trailing text as 'X of Y'", () => {
    const row = makeMemberRow({ totalProgressions: 7, requiredProgressions: 12 });

    const view = buildRowView(row, "full");

    expect(view.progressions.text).toBe("7 of 12");
  });

  it("formats the Special trailing text as 'X of Y', matching Progressions wording (not 'X above Y')", () => {
    const row = makeMemberRow({
      special: { count: 2, required: 4, minStage: 4, boxes: [makeBox({ met: true }), makeBox({ met: true }), makeBox({ met: false, award: null }), makeBox({ met: false, award: null })], met: false },
    });

    const view = buildRowView(row, "full");

    expect(view.special?.text).toBe("2 of 4");
  });

  it("collapses a Core Skills cell to a bar once every one of its boxes is met", () => {
    const metBoxes = Array.from({ length: 5 }, (_, i) => makeBox({ met: true, award: makeAward({ stage: i + 1 }) }));
    const row = makeMemberRow({ coreSkills: [{ skill: "bushcraft", requiredStage: 5, highestAwardedStage: 5, boxes: metBoxes, met: true }, ...makeMemberRow().coreSkills.slice(1)] });

    const view = buildRowView(row, "full");

    expect(view.coreSkills[0].kind).toBe("bar");
    expect(view.coreSkills[0].boxCount).toBe(5);
  });

  it("uses the display name format passed in", () => {
    const row = makeMemberRow({ firstName: "Alex", lastName: "Scout" });

    expect(buildRowView(row, "first").displayName).toBe("Alex");
    expect(buildRowView(row, "full").displayName).toBe("Alex Scout");
  });
});
