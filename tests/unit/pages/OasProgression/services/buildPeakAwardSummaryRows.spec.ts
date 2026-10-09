import { buildPeakAwardSummaryRows, sortPeakAwardSummaryRows } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { PEAK_AWARD_REQUIREMENTS } from "@/pages/OasProgression/data/peakAwardRequirements";
import { TerrainAchievementsSection } from "@/shared";
import type { TerrainUnitMember } from "@/types/terrainTypes";

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "venturer", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "unit-1",
    stream: "bushcraft",
    branch: "bushcraft",
    stage: 1,
    inputGroup: "Plan",
    inputId: "abc123",
    iStatement: "I can do a thing",
    memberId: "member-1",
    memberName: "Alex Scout",
    firstName: "Alex",
    lastName: "Scout",
    patrolName: null,
    answered: true,
    awarded: true,
    date: null,
    section: "venturer",
    ...overrides,
  };
}

/** One fully-awarded stage's single-i-statement row, for the given member/stream/stage, recorded against `section`. */
function awardedRow(memberId: string, stream: string, stage: number, idSuffix: string, section: string = "venturer"): OASProgressionRow {
  return makeRow({ memberId, stream, branch: stream, stage, inputId: `${stream}-${stage}-${idSuffix}`, awarded: true, answered: true, section });
}

describe("buildPeakAwardSummaryRows", () => {
  it("returns one row per member, even a member with zero progress anywhere", () => {
    const members = [makeMember({ id: "m1" }), makeMember({ id: "m2", first_name: "Zara" })];
    const result = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

    expect(result).toHaveLength(2);
    const zara = result.find((r) => r.memberId === "m2");
    expect(zara?.totalProgressions).toBe(0);
    expect(zara?.coreSkills.every((c) => !c.met)).toBe(true);
    expect(zara?.special?.count).toBe(0);
  });

  it("marks a core skill met once the required stage is awarded, with one box per required stage", () => {
    const members = [makeMember({ id: "m1" })];
    // Venturer requires stage 5 in each core skill.
    const rows = [1, 2, 3, 4, 5].map((stage) => awardedRow("m1", "bushcraft", stage, "x"));

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);
    const bushcraft = result[0].coreSkills.find((c) => c.skill === "bushcraft");

    expect(bushcraft?.requiredStage).toBe(5);
    expect(bushcraft?.highestAwardedStage).toBe(5);
    expect(bushcraft?.boxes.map((b) => b.met)).toEqual([true, true, true, true, true]);
    expect(bushcraft?.met).toBe(true);
  });

  it("carries the award's own stream/section/date on a met core skill box, for its tooltip", () => {
    const members = [makeMember({ id: "m1" })];
    const rows = [makeRow({ memberId: "m1", stream: "bushcraft", branch: "bushcraft", stage: 1, awarded: true, answered: true, section: "venturer", date: "2026-01-05" })];

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);
    const bushcraft = result[0].coreSkills.find((c) => c.skill === "bushcraft");

    expect(bushcraft?.boxes[0].award).toEqual({ stream: "bushcraft", branch: "bushcraft", stage: 1, section: "venturer", date: "2026-01-05" });
    expect(bushcraft?.boxes[1].award).toBeNull();
  });

  it("leaves a core skill not-met below the required stage, with only the awarded boxes green", () => {
    const members = [makeMember({ id: "m1" })];
    const rows = [1, 2, 3].map((stage) => awardedRow("m1", "camping", stage, "x"));

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);
    const camping = result[0].coreSkills.find((c) => c.skill === "camping");

    expect(camping?.highestAwardedStage).toBe(3);
    expect(camping?.boxes.map((b) => b.met)).toEqual([true, true, true, false, false]);
    expect(camping?.met).toBe(false);
  });

  // Core Skills is a lifetime check: a member who reached stage 5 of a core skill in an earlier
  // section still counts as having reached it now. Progressions is NOT a lifetime check (see the
  // "only counts progressions made in the member's CURRENT section" tests below) — this is the one
  // place the two deliberately diverge.
  it("still credits a core skill reached entirely in an earlier (lower) section", () => {
    const members = [makeMember({ id: "m1" })];
    const rows = [1, 2, 3, 4, 5].map((stage) => awardedRow("m1", "bushcraft", stage, "x", "scout"));

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);
    const bushcraft = result[0].coreSkills.find((c) => c.skill === "bushcraft");

    expect(bushcraft?.met).toBe(true);
  });

  it("sums the highest awarded stage across all 9 streams for the Progressions total", () => {
    const members = [makeMember({ id: "m1" })];
    const rows = [...[1, 2].map((stage) => awardedRow("m1", "bushwalking", stage, "a")), ...[1, 2, 3].map((stage) => awardedRow("m1", "camping", stage, "b")), awardedRow("m1", "aquatics", 1, "c")];

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

    expect(result[0].totalProgressions).toBe(6);
    expect(result[0].requiredProgressions).toBe(12);
    expect(result[0].progressionBoxes.filter((b) => b.met)).toHaveLength(6);
    expect(result[0].progressionBoxes).toHaveLength(12);
  });

  it("carries the award's own stream/date on a met progression box, for its tooltip", () => {
    const members = [makeMember({ id: "m1" })];
    const rows = [makeRow({ memberId: "m1", stream: "aquatics", branch: "aquatics", stage: 1, awarded: true, answered: true, section: "venturer", date: "2026-02-10" })];

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

    expect(result[0].progressionBoxes[0].award).toEqual({ stream: "aquatics", branch: "aquatics", stage: 1, section: "venturer", date: "2026-02-10" });
  });

  it("shows all boxes green and the true overshoot count when totalProgressions exceeds the requirement", () => {
    const members = [makeMember({ id: "m1" })];
    // Joey only requires 3 total progressions.
    const rows = [1, 2, 3, 4, 5].map((stage) => awardedRow("m1", "bushwalking", stage, "x", "joey"));

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);

    expect(result[0].totalProgressions).toBe(5);
    expect(result[0].requiredProgressions).toBe(3);
    expect(result[0].progressionBoxes.map((b) => b.met)).toEqual([true, true, true]);
  });

  it("returns special: null for a section with no Special condition (Joey/Cub/Scout)", () => {
    const members = [makeMember({ id: "m1" })];
    const result = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Scout], TerrainAchievementsSection.Scout);

    expect(result[0].special).toBeNull();
  });

  it("counts Special as stage-4-or-higher progressions across all streams, met once the minimum is reached", () => {
    const members = [makeMember({ id: "m1" })];
    // bushcraft to stage 6 contributes stages 4,5,6 = 3; bushwalking to stage 4 contributes 1. Total 4, meeting Venturer's minCount of 4.
    const rows = [...[1, 2, 3, 4, 5, 6].map((stage) => awardedRow("m1", "bushcraft", stage, "a")), ...[1, 2, 3, 4].map((stage) => awardedRow("m1", "bushwalking", stage, "b"))];

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

    expect(result[0].special?.count).toBe(4);
    expect(result[0].special?.required).toBe(4);
    expect(result[0].special?.met).toBe(true);
    expect(result[0].special?.boxes.map((b) => b.met)).toEqual([true, true, true, true]);
  });

  it("leaves Special not-met below its minimum, with only the earned boxes green", () => {
    const members = [makeMember({ id: "m1" })];
    const rows = [1, 2, 3, 4].map((stage) => awardedRow("m1", "bushcraft", stage, "a", "rover"));

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Rover], TerrainAchievementsSection.Rover);

    expect(result[0].special?.count).toBe(1);
    expect(result[0].special?.required).toBe(6);
    expect(result[0].special?.met).toBe(false);
    expect(result[0].special?.boxes.map((b) => b.met)).toEqual([true, false, false, false, false, false]);
  });

  it("worked example per section, per the supplied rule table", () => {
    const members = [makeMember({ id: "m1" })];

    // Joey: exactly 1 progression in each core skill meets the whole requirement (3 total, stage 1 each).
    const joeyRows = ["bushcraft", "bushwalking", "camping"].map((stream) => awardedRow("m1", stream, 1, "x", "joey"));
    const joey = buildPeakAwardSummaryRows(joeyRows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey)[0];
    expect(joey.totalProgressions).toBe(3);
    expect(joey.coreSkills.every((c) => c.met)).toBe(true);
    expect(joey.special).toBeNull();

    // Cub: stage 3 in each core skill = 9 progressions, already above Cub's total of 8.
    const cubRows = ["bushcraft", "bushwalking", "camping"].flatMap((stream) => [1, 2, 3].map((stage) => awardedRow("m1", stream, stage, "x", "cub")));
    const cub = buildPeakAwardSummaryRows(cubRows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Cub], TerrainAchievementsSection.Cub)[0];
    expect(cub.totalProgressions).toBe(9);
    expect(cub.coreSkills.every((c) => c.met)).toBe(true);
    expect(cub.progressionBoxes.every((b) => b.met)).toBe(true);
  });

  // "Progress" column (2026-10-09): a simple sum of every condition box across every column —
  // Core Skills ×3 + Progressions + Special, NOT de-duplicated against the fact that Special's own
  // boxes are a subset of the same underlying Progressions achievements (per the rule's own
  // composition) — the user's own worked example counts Special's boxes again as their own boxes.
  describe("Progress column (progressScore/progressTotal/progressPercent)", () => {
    it("totals every condition box across Core Skills + Progressions + Special, per the user's own worked example (Venturer: 5+5+5+12+4=31)", () => {
      const members = [makeMember({ id: "m1" })];
      const result = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

      expect(result[0].progressTotal).toBe(31);
    });

    it("totals every condition box across Core Skills + Progressions ONLY for a section with no Special", () => {
      const members = [makeMember({ id: "m1" })];
      // Joey: 1+1+1 core skills + 3 progressions = 6.
      const result = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);

      expect(result[0].progressTotal).toBe(6);
    });

    it("scores only the boxes actually met, never exceeding the total", () => {
      const members = [makeMember({ id: "m1" })];
      // Bushcraft to stage 5, bushwalking to stage 3, camping untouched.
      const rows = [...[1, 2, 3, 4, 5].map((stage) => awardedRow("m1", "bushcraft", stage, "a")), ...[1, 2, 3].map((stage) => awardedRow("m1", "bushwalking", stage, "b"))];

      const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

      // Core skills (5 required each): bushcraft 5/5, bushwalking 3/5 (stages 1-3 met), camping 0/5 = 8 met of 15.
      // Progressions: 8 awarded (5 bushcraft stages + 3 bushwalking stages) of 12 boxes, all 8 met.
      // Special: 2 qualifying (bushcraft stages 4,5 — bushwalking never reaches stage 4) of 4 boxes.
      expect(result[0].progressScore).toBe(8 + 8 + 2);
      expect(result[0].progressTotal).toBe(31);
      expect(result[0].progressScore).toBeLessThanOrEqual(result[0].progressTotal);
    });

    it("defaults to 0 for a member with zero progress anywhere", () => {
      const members = [makeMember({ id: "m1" })];
      const result = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

      expect(result[0].progressScore).toBe(0);
      expect(result[0].progressPercent).toBe(0);
    });

    it("truncates (not rounds) the percentage", () => {
      const members = [makeMember({ id: "m1" })];
      // Joey: core skills require bushcraft/bushwalking/camping specifically, so an aquatics award
      // counts toward Progressions only (1 of 3 boxes), not Core Skills (0 of 3 boxes met) —
      // 1 of 6 total boxes met = 16.67%, truncates to 16, not 17.
      const rows = [awardedRow("m1", "aquatics", 1, "a", "joey")];

      const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);

      expect(result[0].progressScore).toBe(1);
      expect(result[0].progressTotal).toBe(6);
      expect(result[0].progressPercent).toBe(16);
    });

    it("reaches 100% once every box across every column is met", () => {
      const members = [makeMember({ id: "m1" })];
      const rows = [1, 2, 3].flatMap((stage) => ["bushcraft", "bushwalking", "camping"].map((stream, idx) => awardedRow("m1", stream, stage, `${stage}-${idx}`, "joey")));

      const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);

      expect(result[0].progressScore).toBe(result[0].progressTotal);
      expect(result[0].progressPercent).toBe(100);
    });
  });

  // Regression coverage for the user's own report (2026-10-08): a member's Progressions count was
  // including stages awarded while they were still in an earlier (lower) section — a Venturer who
  // had also climbed through Cub/Scout showed e.g. "32 of 12" instead of their real Venturer-only
  // count. Progressions/Special must only count achievements whose own `section` matches the
  // CURRENT section being summarised, per the user's instruction: "don't count stages made in
  // lower sections" (no rollover-progressions concept exists yet).
  describe("current-section scoping (Progressions/Special only count the member's CURRENT section)", () => {
    it("does not count a stream's stages awarded entirely in an earlier section toward Progressions", () => {
      const members = [makeMember({ id: "m1" })];
      // All awarded while the member was still a Scout — now a Venturer, none of this should count.
      const rows = [1, 2, 3, 4, 5].map((stage) => awardedRow("m1", "bushwalking", stage, "x", "scout"));

      const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

      expect(result[0].totalProgressions).toBe(0);
    });

    it("counts only the stages awarded in the current section when a stream spans two sections", () => {
      const members = [makeMember({ id: "m1" })];
      // Stages 1-3 awarded as a Scout, stage 4 awarded after moving up to Venturer: only stage 4 counts.
      const rows = [...[1, 2, 3].map((stage) => awardedRow("m1", "bushwalking", stage, "x", "scout")), awardedRow("m1", "bushwalking", 4, "y", "venturer")];

      const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

      expect(result[0].totalProgressions).toBe(1);
    });

    it("sums current-section progressions across several streams, ignoring each stream's own earlier-section stages", () => {
      const members = [makeMember({ id: "m1" })];
      const rows = [...[1, 2, 3, 4, 5].map((stage) => awardedRow("m1", "bushcraft", stage, "a", "scout")), awardedRow("m1", "bushcraft", 6, "a6", "venturer"), ...[1, 2].map((stage) => awardedRow("m1", "aquatics", stage, "b", "venturer"))];

      const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

      // bushcraft: only stage 6 (1) + aquatics: stages 1,2 (2) = 3 current-section progressions.
      expect(result[0].totalProgressions).toBe(3);
    });

    it("does not count an earlier-section stage toward Special, even though it would meet the stage threshold", () => {
      const members = [makeMember({ id: "m1" })];
      const rows = [1, 2, 3, 4].map((stage) => awardedRow("m1", "bushcraft", stage, "a", "scout"));

      const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

      expect(result[0].special?.count).toBe(0);
      expect(result[0].special?.met).toBe(false);
    });

    it("ignores an in-progress (not yet awarded) row even if its section matches — Progressions only counts awarded stages", () => {
      const members = [makeMember({ id: "m1" })];
      const rows = [makeRow({ memberId: "m1", stream: "camping", branch: "camping", stage: 1, awarded: false, answered: true, section: "venturer" })];

      const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer], TerrainAchievementsSection.Venturer);

      expect(result[0].totalProgressions).toBe(0);
    });
  });
});

describe("sortPeakAwardSummaryRows", () => {
  it("sorts by first name, tie-breaking on last name", () => {
    const members = [makeMember({ id: "m1", first_name: "Zara", last_name: "Scout" }), makeMember({ id: "m2", first_name: "Alex", last_name: "Ranger" })];
    const rows = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);

    const sorted = sortPeakAwardSummaryRows(rows, "firstName");

    expect(sorted.map((r) => r.firstName)).toEqual(["Alex", "Zara"]);
  });

  it("sorts by last name, tie-breaking on first name", () => {
    const members = [makeMember({ id: "m1", first_name: "Zara", last_name: "Ranger" }), makeMember({ id: "m2", first_name: "Alex", last_name: "Scout" })];
    const rows = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);

    const sorted = sortPeakAwardSummaryRows(rows, "lastName");

    expect(sorted.map((r) => r.lastName)).toEqual(["Ranger", "Scout"]);
  });

  it("does not mutate the input array", () => {
    const members = [makeMember({ id: "m1", first_name: "Zara" }), makeMember({ id: "m2", first_name: "Alex" })];
    const rows = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);

    sortPeakAwardSummaryRows(rows, "firstName");

    expect(rows.map((r) => r.firstName)).toEqual(["Zara", "Alex"]);
  });

  it("sorts by progress descending (furthest along first), tie-breaking on name", () => {
    const members = [makeMember({ id: "m1", first_name: "Zara" }), makeMember({ id: "m2", first_name: "Alex" }), makeMember({ id: "m3", first_name: "Robin" })];
    // Joey: m2 (Alex) gets 1 progression, m3 (Robin) gets 2, m1 (Zara) gets none.
    const rows = [awardedRow("m2", "aquatics", 1, "a", "joey"), ...[1, 2].map((stage) => awardedRow("m3", "aquatics", stage, `b${stage}`, "joey"))];

    const result = buildPeakAwardSummaryRows(rows, members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);
    const sorted = sortPeakAwardSummaryRows(result, "progress");

    expect(sorted.map((r) => r.firstName)).toEqual(["Robin", "Alex", "Zara"]);
  });

  it("progress sort tie-breaks by firstName/lastName when scores are equal", () => {
    const members = [makeMember({ id: "m1", first_name: "Zara" }), makeMember({ id: "m2", first_name: "Alex" })];
    const rows = buildPeakAwardSummaryRows([], members, PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Joey], TerrainAchievementsSection.Joey);

    const sorted = sortPeakAwardSummaryRows(rows, "progress");

    expect(sorted.map((r) => r.firstName)).toEqual(["Alex", "Zara"]);
  });
});
