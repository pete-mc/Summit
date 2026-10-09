import { buildWorksheetPages, splitPageIntoColumnBatches, transposeWorksheetPage, splitTransposedPageIntoColumnBatches, type BuildWorksheetPagesOptions, type WorksheetPage } from "@/pages/OasProgressionVue/services/buildWorksheetPages";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { getCodename } from "@/pages/OasProgression/services/getCodename";
import { UNASSIGNED_PATROL } from "@/pages/OasProgression/services/filterHeatMapSections";

// firstName/lastName default to a split of memberName purely as test-fixture convenience (most
// of these tests only care about member identity/ordering, not real name-splitting edge cases —
// those are covered directly in getMemberDisplayName.spec.ts and filterHeatMapSections.spec.ts).
// Pass firstName/lastName explicitly when a test needs a specific sort order.
function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  const memberName = overrides.memberName ?? "Amy Scout";
  const [firstName, ...rest] = memberName.split(" ");
  return {
    unitId: "u1",
    stream: "bushcraft",
    branch: "bushcraft",
    stage: 1,
    inputGroup: "Plan",
    inputId: "a",
    iStatement: "I know why it is important to stick to trails when outdoors.",
    memberId: "m1",
    memberName,
    firstName,
    lastName: rest.join(" "),
    patrolName: null,
    answered: false,
    awarded: false,
    date: null,
    ...overrides,
  };
}

// selectedPatrols now behaves like every other Worksheets filter: [] means "show nothing," not
// "show everyone" (see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md). makeRow's own
// default member is unassigned (patrolName: null), so default to [UNASSIGNED_PATROL] here;
// tests using a real patrol name override this explicitly.
const DEFAULT_OPTIONS: BuildWorksheetPagesOptions = {
  visibleSkills: ["bushcraft", "bushwalking", "camping"],
  visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  selectedPatrols: [UNASSIGNED_PATROL],
  memberFilter: "",
  nameFormat: "full",
  breakByPatrol: false,
  hideCompleted: false,
  sortBy: "firstName",
};

function options(overrides: Partial<BuildWorksheetPagesOptions> = {}): BuildWorksheetPagesOptions {
  return { ...DEFAULT_OPTIONS, ...overrides };
}

describe("buildWorksheetPages", () => {
  it("builds one page per (skill, stream, stage)", () => {
    const rows = [
      makeRow({ stream: "bushcraft", branch: "bushcraft", stage: 1, inputId: "a1" }),
      makeRow({ stream: "bushcraft", branch: "bushcraft", stage: 2, inputId: "a2" }),
      makeRow({ stream: "bushcraft", branch: "bushcraft", stage: 3, inputId: "a3" }),
      makeRow({ stream: "bushcraft", branch: "pioneering", stage: 4, inputId: "a4" }),
    ];

    const result = buildWorksheetPages(rows, options());

    expect(result.pages.map((p) => p.key)).toEqual(["bushcraft::bushcraft::1", "bushcraft::bushcraft::2", "bushcraft::bushcraft::3", "bushcraft::pioneering::4"]);
  });

  it("gives a member with no progress in a Skill/Stage a column with all-null cells (decision 1)", () => {
    const rows = [makeRow({ memberId: "m1", memberName: "Amy Scout", stage: 1, inputId: "a1", answered: true, date: "2024-02-03" }), makeRow({ memberId: "m2", memberName: "Jess Example", stage: 1, inputId: "a1" })];

    const result = buildWorksheetPages(rows, options());

    expect(result.pages).toHaveLength(1);
    const page = result.pages[0];
    expect(page.members.map((m) => m.memberId)).toEqual(["m1", "m2"]);
    const row = page.groups[0].rows[0];
    expect(row.cells[1]).toEqual({ date: null, answered: false, awarded: false });
  });

  it("uses identical members, in identical order, across every page in the set", () => {
    const rows = [makeRow({ memberId: "m1", memberName: "Amy Scout", stage: 1, inputId: "a1" }), makeRow({ memberId: "m2", memberName: "Jess Example", stage: 4, branch: "pioneering", inputId: "a4" })];

    const result = buildWorksheetPages(rows, options());

    expect(result.pages).toHaveLength(2);
    expect(result.pages[0].members).toBe(result.pages[1].members);
  });

  it("preserves template (first-seen) order for group bands, and omits an empty group", () => {
    // Mirrors the real Stage 1 - Bushcraft sheet: a one-row Review and no further Verify.
    const rows = [makeRow({ inputGroup: "Plan", inputId: "p1" }), makeRow({ inputGroup: "Do", inputId: "d1" }), makeRow({ inputGroup: "Review", inputId: "r1" })];

    const result = buildWorksheetPages(rows, options());

    expect(result.pages[0].groups.map((g) => g.title)).toEqual(["Plan", "Do", "Review"]);
  });

  it("keeps cells index-aligned with members", () => {
    const rows = [
      makeRow({ memberId: "m1", memberName: "Amy", inputId: "a1" }),
      makeRow({ memberId: "m2", memberName: "Jess", inputId: "a1", answered: true, date: "2024-02-03" }),
      makeRow({ memberId: "m3", memberName: "Nora", inputId: "a1" }),
    ];

    const result = buildWorksheetPages(rows, options());

    const page = result.pages[0];
    expect(page.members.map((m) => m.memberId)).toEqual(["m1", "m2", "m3"]);
    expect(page.groups[0].rows[0].cells[1].date).toBe("2024-02-03");
    expect(page.groups[0].rows[0].cells[0].date).toBeNull();
    expect(page.groups[0].rows[0].cells[2].date).toBeNull();
  });

  it("drops whole pages outside the stage range, not individual rows", () => {
    const rows = [makeRow({ stage: 1, inputId: "a1" }), makeRow({ stage: 5, inputId: "a5" })];

    const result = buildWorksheetPages(rows, options({ visibleStages: [1, 2, 3] }));

    expect(result.pages.map((p) => p.stage)).toEqual([1]);
  });

  it("drops whole pages for skills not in visibleSkills", () => {
    const rows = [makeRow({ stream: "bushcraft", branch: "bushcraft" }), makeRow({ stream: "camping", branch: "camping" })];

    const result = buildWorksheetPages(rows, options({ visibleSkills: ["bushcraft"] }));

    expect(result.pages.map((p) => p.skill)).toEqual(["bushcraft"]);
  });

  it("resolves codenames and first-name-only via the Names format option", () => {
    const rows = [makeRow({ memberId: "m1", memberName: "Amy Scout" })];

    const codenamed = buildWorksheetPages(rows, options({ nameFormat: "codename" }));
    expect(codenamed.members[0].displayName).toBe(getCodename("m1"));

    const firstNameOnly = buildWorksheetPages(rows, options({ nameFormat: "first" }));
    expect(firstNameOnly.members[0].displayName).toBe("Amy");
  });

  it("populates patrolGroups only when breakByPatrol is on", () => {
    const rows = [makeRow({ memberId: "m1", patrolName: "Wombats" }), makeRow({ memberId: "m2", patrolName: "Kookaburras" })];
    const bothPatrols = options({ selectedPatrols: ["Wombats", "Kookaburras"] });

    expect(buildWorksheetPages(rows, bothPatrols).patrolGroups).toBeNull();

    const grouped = buildWorksheetPages(rows, { ...bothPatrols, breakByPatrol: true });
    expect(grouped.patrolGroups?.map((g) => g.patrolName)).toEqual(["Kookaburras", "Wombats"]);
  });

  it("reorders member COLUMNS by patrol when breakByPatrol is on, matching patrolGroups' own order", () => {
    // Members are columns on a worksheet (the opposite axis from the heat map) — "break by
    // patrol" must reorder `members` itself, not just label it, or the rendered column order
    // would silently disagree with the patrol-span header built from patrolGroups.
    const rows = [makeRow({ memberId: "m1", memberName: "Amy", patrolName: "Wombats" }), makeRow({ memberId: "m2", memberName: "Beth", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", memberName: "Cleo", patrolName: "Wombats" })];
    const bothPatrols = options({ selectedPatrols: ["Wombats", "Kookaburras"] });

    const unordered = buildWorksheetPages(rows, bothPatrols);
    expect(unordered.members.map((m) => m.memberId)).toEqual(["m1", "m2", "m3"]); // firstName order

    const byPatrol = buildWorksheetPages(rows, { ...bothPatrols, breakByPatrol: true });
    // Kookaburras before Wombats (alphabetical), m1/m3 keep their relative order within Wombats.
    expect(byPatrol.members.map((m) => m.memberId)).toEqual(["m2", "m1", "m3"]);
    expect(byPatrol.patrolGroups?.flatMap((g) => g.members.map((m) => m.memberId))).toEqual(byPatrol.members.map((m) => m.memberId));
  });

  it("orders pages by OAS_SKILLS order, not alphabetically", () => {
    const rows = [makeRow({ stream: "camping", branch: "camping" }), makeRow({ stream: "bushcraft", branch: "bushcraft" })];

    const result = buildWorksheetPages(rows, options());

    // OAS_SKILLS order is bushcraft, bushwalking, camping, ... — camping sorts alphabetically
    // before bushcraft, so this only passes if OAS_SKILLS order (not alpha) is actually used.
    expect(result.pages.map((p) => p.skill)).toEqual(["bushcraft", "camping"]);
  });

  it("flags awarded cells distinctly from merely-answered cells", () => {
    const rows = [makeRow({ memberId: "m1", inputId: "a1", answered: true, awarded: true, date: "2024-02-03" }), makeRow({ memberId: "m2", inputId: "a1", answered: true, awarded: false, date: "2024-02-03" })];

    const result = buildWorksheetPages(rows, options());

    const cells = result.pages[0].groups[0].rows[0].cells;
    expect(cells[0]).toEqual({ date: "2024-02-03", answered: true, awarded: true });
    expect(cells[1]).toEqual({ date: "2024-02-03", answered: true, awarded: false });
  });

  describe("hideCompleted", () => {
    it("leaves every page's members equal to the full set when off (default)", () => {
      const rows = [makeRow({ memberId: "m1", inputId: "a1", awarded: true }), makeRow({ memberId: "m2", inputId: "a1" })];

      const result = buildWorksheetPages(rows, options());

      expect(result.pages[0].members).toBe(result.members);
    });

    it("drops only the fully-awarded member's column on a page, not the others", () => {
      const rows = [
        makeRow({ stage: 1, memberId: "m1", inputId: "a1", awarded: true, answered: true }),
        makeRow({ stage: 1, memberId: "m2", inputId: "a1" }),
        makeRow({ stage: 2, memberId: "m1", inputId: "b1" }),
        makeRow({ stage: 2, memberId: "m2", inputId: "b1" }),
      ];

      const result = buildWorksheetPages(rows, options({ hideCompleted: true, visibleStages: [1, 2] }));

      const stage1 = result.pages.find((p) => p.stage === 1)!;
      const stage2 = result.pages.find((p) => p.stage === 2)!;
      expect(stage1.members.map((m) => m.memberId)).toEqual(["m2"]);
      expect(stage2.members.map((m) => m.memberId)).toEqual(["m1", "m2"]);
    });

    it("keeps cells index-aligned after narrowing out the middle member", () => {
      const rows = [
        makeRow({ memberId: "m1", memberName: "Amy", inputId: "a1" }),
        makeRow({ memberId: "m2", memberName: "Jess", inputId: "a1", awarded: true, answered: true }),
        makeRow({ memberId: "m3", memberName: "Nora", inputId: "a1", answered: true, date: "2024-02-03" }),
      ];

      const result = buildWorksheetPages(rows, options({ hideCompleted: true }));

      const page = result.pages[0];
      expect(page.members.map((m) => m.memberId)).toEqual(["m1", "m3"]);
      expect(page.groups[0].rows[0].cells).toEqual([
        { date: null, answered: false, awarded: false },
        { date: "2024-02-03", answered: true, awarded: false },
      ]);
    });

    it("does not hide a member who is answered but not yet awarded (pending review)", () => {
      const rows = [makeRow({ memberId: "m1", inputId: "a1", answered: true, awarded: false, date: "2024-02-03" })];

      const result = buildWorksheetPages(rows, options({ hideCompleted: true }));

      expect(result.pages[0].members.map((m) => m.memberId)).toEqual(["m1"]);
    });

    it("drops a page entirely when every member on it is fully awarded", () => {
      const rows = [makeRow({ memberId: "m1", inputId: "a1", awarded: true, answered: true }), makeRow({ memberId: "m2", inputId: "a1", awarded: true, answered: true })];

      const result = buildWorksheetPages(rows, options({ hideCompleted: true }));

      expect(result.pages).toHaveLength(0);
    });

    it("leaves the page-set-level members list unchanged — only per-page members narrow", () => {
      const rows = [makeRow({ memberId: "m1", inputId: "a1", awarded: true, answered: true }), makeRow({ memberId: "m2", inputId: "a1" })];

      const result = buildWorksheetPages(rows, options({ hideCompleted: true }));

      expect(result.members.map((m) => m.memberId)).toEqual(["m1", "m2"]);
    });
  });

  it("stamps every cell awarded across a fully awarded stage, and carries that through to the worksheet", () => {
    // Mirrors applyAchievementsToMatrix's own behaviour (buildOASProgressionRows.ts line ~192):
    // an awarded achievement stamps every cell for that member/stage, regardless of inputId match.
    const rows = [makeRow({ memberId: "m1", inputId: "a1", awarded: true, answered: true, date: "2024-02-03" }), makeRow({ memberId: "m1", inputId: "a2", awarded: true, answered: true, date: "2024-02-03" })];

    const result = buildWorksheetPages(rows, options());

    const rowsOut = result.pages[0].groups[0].rows;
    expect(rowsOut.every((r) => r.cells[0].awarded && r.cells[0].answered)).toBe(true);
  });
});

describe("splitPageIntoColumnBatches", () => {
  function makePage(memberCount: number): WorksheetPage {
    const rows = Array.from({ length: memberCount }, (_, i) => makeRow({ memberId: `m${i}`, memberName: `Member${i}`, inputId: "a1", answered: i === 1, date: i === 1 ? "2024-02-03" : null }));
    return buildWorksheetPages(rows, options()).pages[0];
  }

  it("returns the page unchanged (by reference) when it already fits within maxColumns", () => {
    const page = makePage(5);

    expect(splitPageIntoColumnBatches(page, 10)).toEqual([page]);
    expect(splitPageIntoColumnBatches(page, 10)[0]).toBe(page);
  });

  it("splits into EVENLY sized batches, not maxColumns-sized ones with a lopsided remainder", () => {
    // 20 members / 8-max -> ceil(20/8) = 3 batches, each sized ceil(20/3) = 7 (so 7/7/6), not
    // 8/8/4 — an uneven last batch would otherwise end up a different, wider column width than its
    // siblings once each batch's width is computed from its own member count (requested live:
    // split tables should line up, not render at mismatched widths).
    const page = makePage(20);

    const batches = splitPageIntoColumnBatches(page, 8);

    expect(batches).toHaveLength(3);
    expect(batches[0].members).toHaveLength(7);
    expect(batches[1].members).toHaveLength(7);
    expect(batches[2].members).toHaveLength(6);
  });

  it("keeps cells index-aligned with each batch's own member slice", () => {
    // Member index 1 (of 20) is the only one with a date — it must land in batch 0 at its own
    // local index 1, not drift when sliced out of the full 20-member row.
    const page = makePage(20);

    const batches = splitPageIntoColumnBatches(page, 8);

    const batch0Cells = batches[0].groups[0].rows[0].cells;
    expect(batch0Cells[1].date).toBe("2024-02-03");
    expect(batch0Cells.filter((c) => c.date !== null)).toHaveLength(1);
  });

  it("gives every batch the same I-Statement rows/groups, only members differ", () => {
    const page = makePage(20);

    const batches = splitPageIntoColumnBatches(page, 8);

    batches.forEach((batch) => {
      expect(batch.groups.map((g) => g.title)).toEqual(page.groups.map((g) => g.title));
      expect(batch.groups[0].rows.map((r) => r.inputId)).toEqual(page.groups[0].rows.map((r) => r.inputId));
    });
  });

  it("labels each batch with a 1-based member range when there is more than one batch", () => {
    const page = makePage(20);

    const batches = splitPageIntoColumnBatches(page, 8);

    expect(batches[0].title).toBe(`${page.title} (members 1-7 of 20)`);
    expect(batches[1].title).toBe(`${page.title} (members 8-14 of 20)`);
    expect(batches[2].title).toBe(`${page.title} (members 15-20 of 20)`);
  });

  it("leaves the title unchanged when no splitting was needed (a single batch)", () => {
    const page = makePage(5);

    const batches = splitPageIntoColumnBatches(page, 8);

    expect(batches[0].title).toBe(page.title);
    expect(batches[0].title).not.toContain("members");
  });

  it("treats maxColumns <= 0 as 'do not split'", () => {
    const page = makePage(5);
    expect(splitPageIntoColumnBatches(page, 0)).toEqual([page]);
  });
});

describe("transposeWorksheetPage", () => {
  it("turns members into rows and I-Statements into columns", () => {
    const rows = [
      makeRow({ memberId: "m1", memberName: "Amy", inputGroup: "Plan", inputId: "p1" }),
      makeRow({ memberId: "m1", memberName: "Amy", inputGroup: "Do", inputId: "d1" }),
      makeRow({ memberId: "m2", memberName: "Beth", inputGroup: "Plan", inputId: "p1" }),
      makeRow({ memberId: "m2", memberName: "Beth", inputGroup: "Do", inputId: "d1" }),
    ];
    const page = buildWorksheetPages(rows, options()).pages[0];

    const transposed = transposeWorksheetPage(page);

    expect(transposed.rows.map((r) => r.memberId)).toEqual(["m1", "m2"]);
    expect(transposed.columns.map((c) => c.inputId)).toEqual(["p1", "d1"]);
  });

  it("builds group spans as contiguous column ranges, skipping any empty group", () => {
    const rows = [makeRow({ inputGroup: "Plan", inputId: "p1" }), makeRow({ inputGroup: "Plan", inputId: "p2" }), makeRow({ inputGroup: "Do", inputId: "d1" })];
    const page = buildWorksheetPages(rows, options()).pages[0];

    const transposed = transposeWorksheetPage(page);

    expect(transposed.groupSpans).toEqual([
      { title: "Plan", startColumnIndex: 0, columnCount: 2 },
      { title: "Do", startColumnIndex: 2, columnCount: 1 },
    ]);
  });

  it("keeps each row's cells aligned with `columns`, not the original per-member cell order", () => {
    const rows = [makeRow({ memberId: "m1", memberName: "Amy", inputId: "a1", answered: true, date: "2024-02-03" }), makeRow({ memberId: "m2", memberName: "Beth", inputId: "a1" })];
    const page = buildWorksheetPages(rows, options()).pages[0];

    const transposed = transposeWorksheetPage(page);

    expect(transposed.rows[0].cells[0].date).toBe("2024-02-03");
    expect(transposed.rows[1].cells[0].date).toBeNull();
  });

  it("preserves patrol order in rows, since it transposes page.members as-is (already patrol-ordered when breakByPatrol is on)", () => {
    const rows = [makeRow({ memberId: "m1", memberName: "Amy", patrolName: "Wombats" }), makeRow({ memberId: "m2", memberName: "Beth", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", memberName: "Cleo", patrolName: "Wombats" })];
    const page = buildWorksheetPages(rows, options({ selectedPatrols: ["Wombats", "Kookaburras"], breakByPatrol: true })).pages[0];

    const transposed = transposeWorksheetPage(page);

    // Kookaburras before Wombats (alphabetical) — same order buildWorksheetPages already
    // guarantees for page.members; transposeWorksheetPage must not reorder it.
    expect(transposed.rows.map((r) => r.memberId)).toEqual(["m2", "m1", "m3"]);
  });

  it("carries skill/stream/stage/title/key through unchanged", () => {
    const page = buildWorksheetPages([makeRow({ stream: "bushwalking", branch: "bushwalking", stage: 5 })], options({ visibleSkills: ["bushwalking"] })).pages[0];

    const transposed = transposeWorksheetPage(page);

    expect(transposed.key).toBe(page.key);
    expect(transposed.skill).toBe(page.skill);
    expect(transposed.stream).toBe(page.stream);
    expect(transposed.stage).toBe(page.stage);
    expect(transposed.title).toBe(page.title);
  });
});

describe("splitTransposedPageIntoColumnBatches", () => {
  // One member, `statementCount` distinct I-Statements (one per group so groupSpans has multiple
  // entries to exercise clipping) — the column axis is what this splitter bounds; members (rows)
  // are irrelevant to its own logic but still carried through to confirm they're never filtered.
  function makeTransposedPage(statementCount: number, memberCount = 1): ReturnType<typeof transposeWorksheetPage> {
    const rows: ReturnType<typeof makeRow>[] = [];
    for (let m = 0; m < memberCount; m++) {
      for (let i = 0; i < statementCount; i++) {
        rows.push(makeRow({ memberId: `m${m}`, memberName: `Member${m}`, inputId: `a${i}`, inputGroup: `Group${i}`, answered: m === 0 && i === 1, date: m === 0 && i === 1 ? "2024-02-03" : null }));
      }
    }
    const page = buildWorksheetPages(rows, options()).pages[0];
    return transposeWorksheetPage(page);
  }

  it("returns the page unchanged (by reference) when it already fits within maxColumns", () => {
    const page = makeTransposedPage(5);

    expect(splitTransposedPageIntoColumnBatches(page, 10)).toEqual([page]);
    expect(splitTransposedPageIntoColumnBatches(page, 10)[0]).toBe(page);
  });

  it("splits into EVENLY sized batches, not maxColumns-sized ones with a lopsided remainder", () => {
    const page = makeTransposedPage(20);

    const batches = splitTransposedPageIntoColumnBatches(page, 8);

    expect(batches).toHaveLength(3);
    expect(batches[0].columns).toHaveLength(7);
    expect(batches[1].columns).toHaveLength(7);
    expect(batches[2].columns).toHaveLength(6);
  });

  it("keeps every member ROW in full on every batch — rows are never split, only columns", () => {
    const page = makeTransposedPage(20, 5);

    const batches = splitTransposedPageIntoColumnBatches(page, 8);

    batches.forEach((batch) => {
      expect(batch.rows).toHaveLength(5);
    });
  });

  it("keeps cells index-aligned with each batch's own column slice", () => {
    // Column index 1 (of 20) is the only one with a date — it must land in batch 0 at its own
    // local index 1, not drift when sliced out of the full 20-column row.
    const page = makeTransposedPage(20);

    const batches = splitTransposedPageIntoColumnBatches(page, 8);

    expect(batches[0].rows[0].cells[1].date).toBe("2024-02-03");
    expect(batches[0].rows[0].cells.filter((c) => c.date !== null)).toHaveLength(1);
  });

  it("clips groupSpans to each batch's own column range, dropping spans with no overlap", () => {
    // 20 single-column groups (Group0..Group19), split into batches of <=8: batch 0 gets columns
    // [0,8) — Group0..Group7, one column each; batch 2 gets [16,20) — Group16..Group19.
    const page = makeTransposedPage(20);

    const batches = splitTransposedPageIntoColumnBatches(page, 8);

    expect(batches[0].groupSpans).toHaveLength(7);
    expect(batches[0].groupSpans.map((s) => s.title)).toEqual(["Group0", "Group1", "Group2", "Group3", "Group4", "Group5", "Group6"]);
    expect(batches[2].groupSpans.map((s) => s.title)).toEqual(["Group14", "Group15", "Group16", "Group17", "Group18", "Group19"]);
  });

  it("recomputes a group span's startColumnIndex/columnCount to the overlapping portion when it straddles a batch boundary", () => {
    // One single group spanning all 20 columns — every batch must see it clipped to ITS OWN local
    // range, starting at local index 0, with columnCount equal to that batch's own column count.
    const rows = Array.from({ length: 20 }, (_, i) => makeRow({ memberId: "m1", inputId: `a${i}`, inputGroup: "Plan" }));
    const page = transposeWorksheetPage(buildWorksheetPages(rows, options()).pages[0]);

    const batches = splitTransposedPageIntoColumnBatches(page, 8);

    expect(batches[0].groupSpans).toEqual([{ title: "Plan", startColumnIndex: 0, columnCount: 7 }]);
    expect(batches[1].groupSpans).toEqual([{ title: "Plan", startColumnIndex: 0, columnCount: 7 }]);
    expect(batches[2].groupSpans).toEqual([{ title: "Plan", startColumnIndex: 0, columnCount: 6 }]);
  });

  it("labels each batch with a 1-based STATEMENT range when there is more than one batch, not a member range", () => {
    const page = makeTransposedPage(20);

    const batches = splitTransposedPageIntoColumnBatches(page, 8);

    expect(batches[0].title).toBe(`${page.title} (statements 1-7 of 20)`);
    expect(batches[1].title).toBe(`${page.title} (statements 8-14 of 20)`);
    expect(batches[2].title).toBe(`${page.title} (statements 15-20 of 20)`);
  });

  it("leaves the title unchanged when no splitting was needed (a single batch)", () => {
    const page = makeTransposedPage(5);

    const batches = splitTransposedPageIntoColumnBatches(page, 8);

    expect(batches[0].title).toBe(page.title);
    expect(batches[0].title).not.toContain("statements");
  });

  it("treats maxColumns <= 0 as 'do not split'", () => {
    const page = makeTransposedPage(5);
    expect(splitTransposedPageIntoColumnBatches(page, 0)).toEqual([page]);
  });
});
