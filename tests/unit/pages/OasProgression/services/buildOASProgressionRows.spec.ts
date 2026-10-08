import {
  applyAchievementsToMatrix,
  buildBlankMatrix,
  flattenOASTemplate,
  flattenOASTree,
  getTrunkStageCount,
  isOASCacheKeyForStream,
  parseTerrainAnswerDate,
  type OASProgressionRow,
} from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { OASTemplate, OASTree, TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: {
      id: "unit-1",
      section: "scout",
      duty: "member" as TerrainUnitMember["unit"]["duty"],
      unit_council: false,
      group_id: "group-1",
    },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

function makeAchievement(overrides: Partial<TerrainAchievements> = {}): TerrainAchievements {
  return {
    id: "achievement-1",
    member_id: "member-1",
    section: "scout" as TerrainAchievements["section"],
    type: "outdoor_adventure_skill" as TerrainAchievements["type"],
    status: "draft_review" as TerrainAchievements["status"],
    status_updated: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeTemplate(overrides: Partial<OASTemplate> = {}): OASTemplate {
  return {
    template: "bushwalking-3",
    version: 1,
    document: [
      {
        title: "Bushwalking Stage 3",
        input_groups: [
          {
            title: "Plan>",
            inputs: [
              { id: "abc123", type: "text", label: "I can pack appropriate gear for an overnight hike" },
              { id: "file_uploader", type: "file", label: "Upload evidence" },
            ],
          },
          {
            title: "Do>",
            inputs: [{ id: "def456", type: "text", label: "I can navigate using a map and compass" }],
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("flattenOASTemplate", () => {
  it("flattens input groups in order and skips file_uploader inputs", () => {
    const result = flattenOASTemplate(makeTemplate());

    expect(result).toEqual([
      { inputId: "abc123", iStatement: "I can pack appropriate gear for an overnight hike", inputGroup: "Plan", sortIndex: 0 },
      { inputId: "def456", iStatement: "I can navigate using a map and compass", inputGroup: "Do", sortIndex: 1 },
    ]);
  });

  it("returns an empty array when the template has no document", () => {
    expect(flattenOASTemplate({ template: "x", version: 1, document: [] })).toEqual([]);
  });
});

describe("buildBlankMatrix", () => {
  it("cross-joins every member with every i-statement, all cells blank", () => {
    const iStatements = flattenOASTemplate(makeTemplate());
    const members = [makeMember({ id: "m1", first_name: "Alex" }), makeMember({ id: "m2", first_name: "Sam", patrol: { id: "p1", name: "Kookaburras", duty: "member" as TerrainUnitMember["unit"]["duty"] } })];

    const matrix = buildBlankMatrix("unit-1", "bushwalking", "core", 3, iStatements, members);

    expect(matrix).toHaveLength(4);
    expect(matrix.every((row) => row.answered === false && row.awarded === false && row.date === null)).toBe(true);
    expect(matrix.find((row) => row.memberId === "m2" && row.inputId === "abc123")?.patrolName).toBe("Kookaburras");
    expect(matrix.find((row) => row.memberId === "m1" && row.inputId === "abc123")?.patrolName).toBeNull();
  });

  it("produces zero rows for a member with no achievement record (still present, all blank)", () => {
    const iStatements = flattenOASTemplate(makeTemplate());
    const matrix = buildBlankMatrix("unit-1", "bushwalking", "core", 3, iStatements, [makeMember()]);

    expect(matrix).toHaveLength(2);
    expect(matrix.every((row) => !row.answered)).toBe(true);
  });
});

describe("parseTerrainAnswerDate", () => {
  it("parses an unambiguous AU-format date (day > 12)", () => {
    const result = parseTerrainAnswerDate("18/11/2020", "2020-12-01T00:00:00.000Z");
    expect(result?.toISOString().slice(0, 10)).toBe("2020-11-18");
  });

  it("falls back to US format when AU parsing produces a date after status_updated", () => {
    // "03/04/2020" as AU (3 April) is after status_updated (2020-01-10) -> should retry as US (March 4)
    const result = parseTerrainAnswerDate("03/04/2020", "2020-01-10T00:00:00.000Z");
    expect(result?.toISOString().slice(0, 10)).toBe("2020-03-04");
  });

  it("uses AU parsing when the AU interpretation is not after status_updated", () => {
    const result = parseTerrainAnswerDate("03/04/2020", "2020-12-01T00:00:00.000Z");
    expect(result?.toISOString().slice(0, 10)).toBe("2020-04-03");
  });

  it("returns null for an unparseable date", () => {
    expect(parseTerrainAnswerDate("not-a-date", "2020-01-01T00:00:00.000Z")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseTerrainAnswerDate("", "2020-01-01T00:00:00.000Z")).toBeNull();
  });
});

describe("applyAchievementsToMatrix", () => {
  const iStatements = flattenOASTemplate(makeTemplate());

  function blankMatrixFor(members: TerrainUnitMember[]): OASProgressionRow[] {
    return buildBlankMatrix("unit-1", "bushwalking", "core", 3, iStatements, members);
  }

  it("in-progress (draft_review): fills matching cells from answers, answered=true, awarded=false", () => {
    const matrix = blankMatrixFor([makeMember()]);
    const achievement = makeAchievement({
      status: "draft_review" as TerrainAchievements["status"],
      answers: { abc123_verifiedDate: "18/11/2020" },
    });

    const result = applyAchievementsToMatrix(matrix, [achievement]);

    const filled = result.find((r) => r.inputId === "abc123");
    const untouched = result.find((r) => r.inputId === "def456");
    expect(filled?.answered).toBe(true);
    expect(filled?.awarded).toBe(false);
    expect(filled?.date).toBe("2020-11-18");
    expect(untouched?.answered).toBe(false);
  });

  it("in-progress: handles the special logbook_up_to_date key", () => {
    const template = makeTemplate({
      document: [
        {
          title: "Review",
          input_groups: [{ title: "Review>", inputs: [{ id: "logbook_up_to_date", type: "text", label: "Logbook up to date" }] }],
        },
      ],
    });
    const statements = flattenOASTemplate(template);
    const matrix = buildBlankMatrix("unit-1", "bushwalking", "core", 3, statements, [makeMember()]);
    const achievement = makeAchievement({ status: "pending_review" as TerrainAchievements["status"], answers: { logbook_up_to_date: "true" } });

    const result = applyAchievementsToMatrix(matrix, [achievement]);

    expect(result.find((r) => r.inputId === "logbook_up_to_date")?.answered).toBe(true);
  });

  it("awarded with imported.date_awarded: stamps every cell, answered=awarded=true", () => {
    const matrix = blankMatrixFor([makeMember()]);
    const achievement = makeAchievement({
      status: "awarded" as TerrainAchievements["status"],
      imported: { date_awarded: "2019-05-01" },
    });

    const result = applyAchievementsToMatrix(matrix, [achievement]);

    expect(result.every((r) => r.answered && r.awarded && r.date === "2019-05-01")).toBe(true);
  });

  it("awarded with empty/missing answers and no imported: stamps every cell with status_updated", () => {
    const matrix = blankMatrixFor([makeMember()]);
    const achievement = makeAchievement({
      status: "awarded" as TerrainAchievements["status"],
      status_updated: "2021-06-15T00:00:00.000Z",
      answers: {},
    });

    const result = applyAchievementsToMatrix(matrix, [achievement]);

    expect(result.every((r) => r.answered && r.awarded && r.date === "2021-06-15T00:00:00.000Z")).toBe(true);
  });

  it("awarded with populated answers: uses the per-key answer date where matched, but still stamps every cell answered=awarded=true", () => {
    const matrix = blankMatrixFor([makeMember()]);
    const achievement = makeAchievement({
      status: "awarded" as TerrainAchievements["status"],
      status_updated: "2021-06-15T00:00:00.000Z",
      answers: { abc123_verifiedDate: "18/11/2020" },
    });

    const result = applyAchievementsToMatrix(matrix, [achievement]);

    const matchedRow = result.find((r) => r.inputId === "abc123");
    const unmatchedRow = result.find((r) => r.inputId === "def456");
    expect(matchedRow?.answered).toBe(true);
    expect(matchedRow?.awarded).toBe(true);
    expect(matchedRow?.date).toBe("2020-11-18");
    expect(unmatchedRow?.answered).toBe(true);
    expect(unmatchedRow?.awarded).toBe(true);
  });

  it("awarded status takes precedence over per-cell answers matching: a stale/renamed i-statement inputId with no matching answers key is still stamped awarded, not left blank", () => {
    // Reproduces a real-world case: the template's i-statements changed after a member was
    // awarded, so `answers` is keyed by inputIds that no longer exist in the current template.
    // The achievement's own `awarded` status must still win for every current row.
    const matrix = blankMatrixFor([makeMember()]);
    const achievement = makeAchievement({
      status: "awarded" as TerrainAchievements["status"],
      status_updated: "2021-06-15T00:00:00.000Z",
      answers: { some_old_removed_input_verifiedDate: "18/11/2020" },
    });

    const result = applyAchievementsToMatrix(matrix, [achievement]);

    expect(result.every((r) => r.answered === true && r.awarded === true)).toBe(true);
    const unmatchedRow = result.find((r) => r.inputId === "def456");
    expect(unmatchedRow?.date).toBe("2021-06-15T00:00:00.000Z");
  });

  it("member with zero achievement records: all cells stay blank", () => {
    const matrix = blankMatrixFor([makeMember()]);

    const result = applyAchievementsToMatrix(matrix, []);

    expect(result.every((r) => !r.answered && !r.awarded && r.date === null)).toBe(true);
  });

  it("does not mutate the input matrix", () => {
    const matrix = blankMatrixFor([makeMember()]);
    const original = matrix.map((r) => ({ ...r }));
    applyAchievementsToMatrix(matrix, [makeAchievement({ status: "awarded" as TerrainAchievements["status"], imported: { date_awarded: "2019-05-01" } })]);

    expect(matrix).toEqual(original);
  });
});

describe("flattenOASTree", () => {
  it("walks the single-root tree, forking into distinct branches at deeper stages", () => {
    const tree: OASTree = {
      title: "Bushcraft",
      stream_id: "bushcraft",
      description: "test",
      tree: {
        branch_id: "bushcraft",
        title: "Bushcraft",
        stage: 1,
        template_link: "oas/bushcraft/1/latest.json",
        children: [
          {
            branch_id: "bushcraft",
            title: "Bushcraft",
            stage: 2,
            template_link: "oas/bushcraft/2/latest.json",
            children: [
              {
                branch_id: "pioneering",
                title: "Pioneering",
                stage: 3,
                template_link: "oas/bushcraft/pioneering/3/latest.json",
                children: [],
              },
              {
                branch_id: "survival-skills",
                title: "Survival Skills",
                stage: 3,
                template_link: "oas/bushcraft/survival-skills/3/latest.json",
                children: [],
              },
            ],
          },
        ],
      },
    };

    const result = flattenOASTree(tree);

    expect(result).toEqual([
      { branch: "bushcraft", stage: 1, templateLink: "oas/bushcraft/1/latest.json" },
      { branch: "bushcraft", stage: 2, templateLink: "oas/bushcraft/2/latest.json" },
      { branch: "pioneering", stage: 3, templateLink: "oas/bushcraft/pioneering/3/latest.json" },
      { branch: "survival-skills", stage: 3, templateLink: "oas/bushcraft/survival-skills/3/latest.json" },
    ]);
  });

  it("skips nodes with no template_link", () => {
    const tree: OASTree = {
      title: "Bushcraft",
      stream_id: "bushcraft",
      description: "test",
      tree: { branch_id: "bushcraft", title: "Bushcraft", stage: 1, children: [] },
    };

    expect(flattenOASTree(tree)).toEqual([]);
  });
});

describe("getTrunkStageCount", () => {
  it("counts stages sharing the stream's own branch_id before the first fork", () => {
    const tree: OASTree = {
      title: "Bushcraft",
      stream_id: "bushcraft",
      description: "test",
      tree: {
        branch_id: "bushcraft",
        title: "Bushcraft",
        stage: 1,
        children: [
          {
            branch_id: "bushcraft",
            title: "Bushcraft",
            stage: 2,
            children: [
              {
                branch_id: "bushcraft",
                title: "Bushcraft",
                stage: 3,
                children: [
                  { branch_id: "pioneering", title: "Pioneering", stage: 4, children: [] },
                  { branch_id: "survival-skills", title: "Survival Skills", stage: 4, children: [] },
                ],
              },
            ],
          },
        ],
      },
    };

    expect(getTrunkStageCount(tree)).toBe(3);
  });

  it("returns the full depth when the tree never forks (single chain, no branch_id change)", () => {
    const tree: OASTree = {
      title: "Cycling",
      stream_id: "cycling",
      description: "test",
      tree: {
        branch_id: "cycling",
        title: "Cycling",
        stage: 1,
        children: [{ branch_id: "cycling", title: "Cycling", stage: 2, children: [] }],
      },
    };

    expect(getTrunkStageCount(tree)).toBe(2);
  });

  it("returns 0 when the root node itself already has a different branch_id than the stream", () => {
    const tree: OASTree = {
      title: "Bushcraft",
      stream_id: "bushcraft",
      description: "test",
      tree: { branch_id: "pioneering", title: "Pioneering", stage: 1, children: [] },
    };

    expect(getTrunkStageCount(tree)).toBe(0);
  });
});

describe("isOASCacheKeyForStream", () => {
  it("matches tree and template keys for the given stream", () => {
    const matches = isOASCacheKeyForStream("bushwalking");

    expect(matches("tree.bushwalking")).toBe(true);
    expect(matches("template.bushwalking")).toBe(true);
    expect(matches("tree.camping")).toBe(false);
  });

  it("matches achievements keys by their stream segment, not unitId", () => {
    const matches = isOASCacheKeyForStream("bushwalking");

    expect(matches("achievements.unit-1.bushwalking.core.2")).toBe(true);
    expect(matches("achievements.bushwalking.bushwalking.core.2")).toBe(true);
    expect(matches("achievements.unit-1.camping.core.2")).toBe(false);
  });
});
