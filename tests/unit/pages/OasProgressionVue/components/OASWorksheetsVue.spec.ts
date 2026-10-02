import OASWorksheetsVue, {
  worksheetCellClass,
  formatWorksheetDate,
  readDevDuplicateCount,
  duplicateMembersForDevPreview,
  DEV_DUPLICATE_MEMBERS_STORAGE_KEY,
  splitTableColumnsForPrint,
} from "@/pages/OasProgressionVue/components/OASWorksheetsVue";
import type { WorksheetCell, WorksheetPage, TransposedWorksheetPage } from "@/pages/OasProgressionVue/services/buildWorksheetPages";
import { MAX_FITTING_MEMBER_COLUMNS, maxFittingMemberColumns, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX, PRINT_USABLE_WIDTH_PX } from "@/pages/OasProgressionVue/services/worksheetPrintPageSize";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "u1",
    stream: "bushcraft",
    branch: "bushcraft",
    stage: 1,
    inputGroup: "Plan",
    inputId: "a",
    iStatement: "I know why it is important to stick to trails when outdoors.",
    memberId: "m1",
    memberName: "Alba Sayer",
    patrolName: null,
    answered: false,
    awarded: false,
    date: null,
    ...overrides,
  };
}

function makeFilters(overrides: Partial<OASProgressionVueFilterState> = {}): OASProgressionVueFilterState {
  return {
    viewMode: "worksheets",
    groupBy: "skill",
    memberFilter: "",
    hideLastName: false,
    useCodenames: false,
    selectedPatrols: [],
    breakByPatrol: false,
    hideEmptyStreams: false,
    hideEmptyTopColumns: false,
    onlyInProgress: false,
    hideAnswered: false,
    visibleStreams: [],
    stageRange: [1, 9],
    sortBy: "firstName",
    worksheetVisibleSkills: ["bushcraft"],
    worksheetStageRange: [1, 9],
    worksheetHideLastName: false,
    worksheetUseCodenames: false,
    worksheetBreakByPatrol: false,
    worksheetHideCompleted: false,
    worksheetLayout: "membersAsColumns",
    ...overrides,
  };
}

function makeCell(overrides: Partial<WorksheetCell> = {}): WorksheetCell {
  return { date: null, answered: false, awarded: false, ...overrides };
}

describe("worksheetCellClass", () => {
  it("returns the empty class when neither answered nor awarded", () => {
    expect(worksheetCellClass(makeCell())).toBe("oas-worksheet-cell-empty");
  });

  it("returns the answered class when answered but not awarded", () => {
    expect(worksheetCellClass(makeCell({ answered: true }))).toBe("oas-worksheet-cell-answered");
  });

  it("returns the awarded class when awarded, even if answered is also true", () => {
    expect(worksheetCellClass(makeCell({ answered: true, awarded: true }))).toBe("oas-worksheet-cell-awarded");
    // awarded wins even in the (should-not-happen) case where only awarded is true.
    expect(worksheetCellClass(makeCell({ answered: false, awarded: true }))).toBe("oas-worksheet-cell-awarded");
  });
});

describe("formatWorksheetDate", () => {
  it("formats an ISO date as DD/MM/YY", () => {
    expect(formatWorksheetDate("2024-02-03")).toBe("03/02/24");
  });

  it("returns an empty string for null", () => {
    expect(formatWorksheetDate(null)).toBe("");
  });

  it("passes through a non-ISO string unchanged rather than throwing", () => {
    expect(formatWorksheetDate("not-a-real-date")).toBe("not-a-real-date");
  });
});

describe("OASWorksheetsVue computed", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computed = (OASWorksheetsVue as any).computed;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = (OASWorksheetsVue as any).methods;

  it("passes worksheet* filter keys through to buildWorksheetPages unchanged", () => {
    const rows = [makeRow({ stage: 1 }), makeRow({ stage: 5 })];
    const context = { items: rows, filters: makeFilters({ worksheetStageRange: [1, 3] }), availablePatrols: [] };

    const pageSet = computed.pageSet.call(context);

    expect(pageSet.pages.map((p: WorksheetPage) => p.stage)).toEqual([1]);
  });

  it("does not mix heat-map filter keys into the worksheet build (uses worksheetVisibleSkills, not visibleStreams)", () => {
    const rows = [makeRow({ stream: "bushcraft" }), makeRow({ stream: "camping", branch: "camping" })];
    // visibleStreams (heat map's own key) deliberately set to something that would exclude
    // bushcraft, to prove the worksheet build ignores it entirely.
    const context = { items: rows, filters: makeFilters({ visibleStreams: ["camping"], worksheetVisibleSkills: ["bushcraft"] }), availablePatrols: [] };

    const pageSet = computed.pageSet.call(context);

    expect(pageSet.pages.map((p: WorksheetPage) => p.skill)).toEqual(["bushcraft"]);
  });

  it("hasPages is false when no pages match the current filters", () => {
    const context: { items: OASProgressionRow[]; filters: OASProgressionVueFilterState; availablePatrols: string[]; pageSet?: unknown } = {
      items: [makeRow({ stream: "bushcraft" })],
      filters: makeFilters({ worksheetVisibleSkills: ["camping"] }),
      availablePatrols: [],
    };
    // hasPages reads `this.pageSet` as a plain property (that's how Vue resolves computed-on-
    // computed at runtime) — calling it standalone needs that value pre-resolved onto the context.
    context.pageSet = computed.pageSet.call(context);

    expect(computed.hasPages.call(context)).toBe(false);
  });

  describe("isMembersAsRows", () => {
    it("is false for the default membersAsColumns layout", () => {
      const context = { filters: makeFilters({ worksheetLayout: "membersAsColumns" }) };
      expect(computed.isMembersAsRows.call(context)).toBe(false);
    });

    it("is true for the membersAsRows (transposed) layout", () => {
      const context = { filters: makeFilters({ worksheetLayout: "membersAsRows" }) };
      expect(computed.isMembersAsRows.call(context)).toBe(true);
    });
  });

  describe("columnsLayoutPages", () => {
    // Fixed at PRINT_USABLE_WIDTH_PX, standing in for "whatever the ResizeObserver measured" — a
    // real mounted component always has this set by the time anything reads columnsLayoutPages
    // (see OASWorksheetsVue.ts's own comment on why 0/unset only ever applies pre-mount). Using a
    // fixed, known value here (rather than leaving it unset and relying on the pre-mount fallback)
    // keeps these tests about the splitting/width MATH, not about the fallback's own behaviour.
    const SCREEN_WIDTH_PX = PRINT_USABLE_WIDTH_PX;
    const MAX_FITTING_SCREEN = maxFittingMemberColumns(SCREEN_WIDTH_PX, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX);

    function makeContextWithMembers(memberCount: number) {
      const rows = Array.from({ length: memberCount }, (_, i) => makeRow({ memberId: `m${i}`, memberName: `Member${i}` }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = {
        items: rows,
        filters: makeFilters(),
        availablePatrols: [],
        screenAvailableWidthPx: SCREEN_WIDTH_PX,
      };
      context.pageSet = computed.pageSet.call(context);
      return context;
    }

    it("returns one page per Skill/Stage unsplit when within the screen's own fitting threshold", () => {
      const context = makeContextWithMembers(5);
      expect(computed.columnsLayoutPages.call(context)).toHaveLength(1);
    });

    it("splits into multiple sheets when a page exceeds the screen's own fitting threshold", () => {
      const context = makeContextWithMembers(MAX_FITTING_SCREEN + 5);
      const views = computed.columnsLayoutPages.call(context);
      expect(views.length).toBeGreaterThan(1);
      // Nothing lost — every member still appears across the split pages.
      const totalMembers = views.reduce((sum: number, v: { page: WorksheetPage }) => sum + v.page.members.length, 0);
      expect(totalMembers).toBe(MAX_FITTING_SCREEN + 5);
    });

    it("gives a batch at the fitting threshold the minimum member-column width — no room left to expand", () => {
      // An exact multiple of MAX_FITTING_SCREEN splits into batches that are each FULLY packed
      // (unlike e.g. +5, which can split into batches with slack left over in each — see the
      // relaxed-width test below for that case) — this is the one case guaranteed to have zero
      // leftover width, so memberColumnWidthPx must stay at the bare minimum.
      const context = makeContextWithMembers(MAX_FITTING_SCREEN * 2);
      const views = computed.columnsLayoutPages.call(context);
      expect(views.length).toBeGreaterThan(1);
      views.forEach((v: { statementWidthPx: number; memberColumnWidthPx: number }) => {
        expect(v.memberColumnWidthPx).toBe(70);
      });
    });

    it("gives an unsplit small page a relaxed statement width and member columns wider than the bare minimum", () => {
      const context = makeContextWithMembers(2);
      const views = computed.columnsLayoutPages.call(context);
      expect(views).toHaveLength(1);
      expect(views[0].memberColumnWidthPx).toBeGreaterThan(70);
    });

    it("falls back to PRINT_USABLE_WIDTH_PX before the ResizeObserver has measured anything (screenAvailableWidthPx unset)", () => {
      const rows = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, filters: makeFilters(), availablePatrols: [] };
      context.pageSet = computed.pageSet.call(context);

      const views = computed.columnsLayoutPages.call(context);

      expect(views).toHaveLength(1);
      expect(views[0].memberColumnWidthPx).toBeGreaterThan(0);
    });

    it("gives every batch of a split page the SAME statement/member-column width, not one derived from its own smaller member count", () => {
      // Reported live: a page split into an uneven-looking pair of batches got visibly different
      // column widths per batch (the smaller batch had more slack, so its own columns stretched
      // wider) — the two tables no longer lined up under each other even though they're the same
      // logical page. +5 is deliberately not an exact multiple of MAX_FITTING_SCREEN, so without the
      // fix this would produce batches of different sizes and thus different per-batch widths.
      const context = makeContextWithMembers(MAX_FITTING_SCREEN + 5);
      const views = computed.columnsLayoutPages.call(context);
      expect(views.length).toBeGreaterThan(1);

      const statementWidths = new Set(views.map((v: { statementWidthPx: number }) => v.statementWidthPx));
      const memberWidths = new Set(views.map((v: { memberColumnWidthPx: number }) => v.memberColumnWidthPx));
      expect(statementWidths.size).toBe(1);
      expect(memberWidths.size).toBe(1);
    });

    it("tags each batch with its own memberOffset into the original page, and the true original member count", () => {
      const context = makeContextWithMembers(MAX_FITTING_SCREEN + 5);
      const views = computed.columnsLayoutPages.call(context);
      expect(views.length).toBeGreaterThan(1);

      const batchSize = views[0].page.members.length;
      views.forEach((v: { memberOffset: number; originalMemberCount: number }, i: number) => {
        expect(v.memberOffset).toBe(i * batchSize);
        expect(v.originalMemberCount).toBe(MAX_FITTING_SCREEN + 5);
      });
    });

    it("gives memberOffset 0 for an unsplit page", () => {
      const context = makeContextWithMembers(2);
      const views = computed.columnsLayoutPages.call(context);
      expect(views[0].memberOffset).toBe(0);
      expect(views[0].originalMemberCount).toBe(2);
    });
  });

  describe("rowsLayoutPages", () => {
    it("produces one transposed view per page, with a font size and column width computed", () => {
      const rows = [makeRow({ memberId: "m1", inputId: "a1" }), makeRow({ memberId: "m2", inputId: "a1" })];
      const context = { items: rows, filters: makeFilters(), availablePatrols: [] };
      context.pageSet = computed.pageSet.call(context);

      const views = computed.rowsLayoutPages.call(context);

      expect(views).toHaveLength(1);
      expect(views[0].page.rows.map((r: TransposedWorksheetPage["rows"][number]) => r.memberId)).toEqual(["m1", "m2"]);
      expect(views[0].headerFontSizePx).toBeGreaterThan(0);
      expect(views[0].columnWidthPx).toBeGreaterThan(0);
    });

    it("never splits — a large member count stays one row-set, not multiple sheets", () => {
      const rows = Array.from({ length: MAX_FITTING_MEMBER_COLUMNS + 20 }, (_, i) => makeRow({ memberId: `m${i}` }));
      const context = { items: rows, filters: makeFilters(), availablePatrols: [] };
      context.pageSet = computed.pageSet.call(context);

      const views = computed.rowsLayoutPages.call(context);

      expect(views).toHaveLength(1);
      expect(views[0].page.rows).toHaveLength(MAX_FITTING_MEMBER_COLUMNS + 20);
    });
  });

  describe("hasSplitPages", () => {
    // hasSplitPages reads `this.isMembersAsRows`/`this.columnsLayoutPages`/`this.pageSet` as plain
    // properties — all three need pre-resolving onto the fixture context.
    function makeContext(rows: OASProgressionRow[], filterOverrides: Partial<OASProgressionVueFilterState> = {}) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, filters: makeFilters(filterOverrides), availablePatrols: [] };
      context.pageSet = computed.pageSet.call(context);
      context.isMembersAsRows = computed.isMembersAsRows.call(context);
      context.columnsLayoutPages = computed.columnsLayoutPages.call(context);
      return context;
    }

    it("is false for membersAsRows regardless of member count — that layout never splits", () => {
      const rows = Array.from({ length: MAX_FITTING_MEMBER_COLUMNS + 20 }, (_, i) => makeRow({ memberId: `m${i}` }));
      const context = makeContext(rows, { worksheetLayout: "membersAsRows" });

      expect(computed.hasSplitPages.call(context)).toBe(false);
    });

    it("is false for membersAsColumns when nothing needed splitting", () => {
      const context = makeContext([makeRow()]);

      expect(computed.hasSplitPages.call(context)).toBe(false);
    });

    it("is true for membersAsColumns once a page actually split into more sheets", () => {
      const rows = Array.from({ length: MAX_FITTING_MEMBER_COLUMNS + 5 }, (_, i) => makeRow({ memberId: `m${i}` }));
      const context = makeContext(rows);

      expect(computed.hasSplitPages.call(context)).toBe(true);
    });
  });

  describe("patrolSpansForPage", () => {
    it("returns no spans when break-by-patrol is off", () => {
      const rows = [makeRow({ memberId: "m1", patrolName: "Wombats" }), makeRow({ memberId: "m2", patrolName: "Kookaburras" })];
      const context: { items: OASProgressionRow[]; filters: OASProgressionVueFilterState; availablePatrols: string[]; pageSet?: unknown } = {
        items: rows,
        filters: makeFilters({ worksheetBreakByPatrol: false }),
        availablePatrols: ["Wombats", "Kookaburras"],
      };
      const pageSet = computed.pageSet.call(context);
      context.pageSet = pageSet;

      const spans = methods.patrolSpansForPage.call(context, pageSet.pages[0]);

      expect(spans).toEqual([]);
    });

    it("returns one span per patrol, column counts summing to the page's member count, in the same order as the columns", () => {
      const rows = [makeRow({ memberId: "m1", memberName: "Alba", patrolName: "Wombats" }), makeRow({ memberId: "m2", memberName: "Beth", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", memberName: "Cleo", patrolName: "Wombats" })];
      const context: { items: OASProgressionRow[]; filters: OASProgressionVueFilterState; availablePatrols: string[]; pageSet?: unknown } = {
        items: rows,
        filters: makeFilters({ worksheetBreakByPatrol: true }),
        availablePatrols: ["Wombats", "Kookaburras"],
      };
      const pageSet = computed.pageSet.call(context);
      context.pageSet = pageSet;
      const page = pageSet.pages[0];

      const spans = methods.patrolSpansForPage.call(context, page);

      expect(spans).toEqual([
        { patrolName: "Kookaburras", columnCount: 1 },
        { patrolName: "Wombats", columnCount: 2 },
      ]);
      expect(spans.reduce((sum: number, s: { columnCount: number }) => sum + s.columnCount, 0)).toBe(page.members.length);
      // The spans must appear in the same left-to-right order as page.members itself, or the
      // rendered colspan header would silently misalign with the columns beneath it.
      expect(page.members.map((m: { patrolName: string | null }) => m.patrolName)).toEqual(["Kookaburras", "Wombats", "Wombats"]);
    });
  });

  describe("patrolBorderClassesForPage", () => {
    // Calls `this.patrolSpansForPage(...)` internally — the fixture context needs that method
    // bound onto it too, not just `pageSet`, to behave like a real Vue instance.
    function makeContext(rows: OASProgressionRow[], filterOverrides: Partial<OASProgressionVueFilterState> = {}, availablePatrols: string[] = []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, filters: makeFilters(filterOverrides), availablePatrols, patrolSpansForPage: methods.patrolSpansForPage };
      context.pageSet = computed.pageSet.call(context);
      return context;
    }

    it("returns {start:false, end:false} for every column when break-by-patrol is off, one entry per member", () => {
      const rows = [makeRow({ memberId: "m1", patrolName: "Wombats" }), makeRow({ memberId: "m2", patrolName: "Kookaburras" })];
      const context = makeContext(rows, { worksheetBreakByPatrol: false }, ["Wombats", "Kookaburras"]);
      const page = context.pageSet.pages[0];

      expect(methods.patrolBorderClassesForPage.call(context, page)).toEqual([
        { start: false, end: false },
        { start: false, end: false },
      ]);
    });

    it("flags only the first and last column of each patrol group, not every column in it", () => {
      // Columns end up [m2 (Kookaburras, 1 member), m1 (Wombats), m3 (Wombats)] — see the
      // patrolSpansForPage test above for why.
      const rows = [makeRow({ memberId: "m1", memberName: "Alba", patrolName: "Wombats" }), makeRow({ memberId: "m2", memberName: "Beth", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", memberName: "Cleo", patrolName: "Wombats" })];
      const context = makeContext(rows, { worksheetBreakByPatrol: true }, ["Wombats", "Kookaburras"]);
      const page = context.pageSet.pages[0] as WorksheetPage;

      const borders = methods.patrolBorderClassesForPage.call(context, page);

      expect(borders).toEqual([
        { start: true, end: true }, // Kookaburras' only column — both its own start and end
        { start: true, end: false }, // Wombats' first column
        { start: false, end: true }, // Wombats' last column
      ]);
    });

    it("single-member patrol groups get both start and end on their one column", () => {
      const rows = [makeRow({ memberId: "m1", patrolName: "Wombats" }), makeRow({ memberId: "m2", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", patrolName: "Magpies" })];
      const context = makeContext(rows, { worksheetBreakByPatrol: true }, ["Wombats", "Kookaburras", "Magpies"]);
      const page = context.pageSet.pages[0] as WorksheetPage;

      const borders = methods.patrolBorderClassesForPage.call(context, page);

      expect(borders.every((b: { start: boolean; end: boolean }) => b.start && b.end)).toBe(true);
    });
  });

  describe("patrolDividerBeforeRow (Layout B's row-based patrol grouping)", () => {
    function makeTransposedContext(rows: OASProgressionRow[], breakByPatrol: boolean) {
      const context: { items: OASProgressionRow[]; filters: OASProgressionVueFilterState; availablePatrols: string[]; pageSet?: unknown } = {
        items: rows,
        filters: makeFilters({ worksheetBreakByPatrol: breakByPatrol }),
        availablePatrols: ["Wombats", "Kookaburras"],
      };
      context.pageSet = computed.pageSet.call(context);
      const views = computed.rowsLayoutPages.call(context);
      return { context, transposed: views[0].page as TransposedWorksheetPage };
    }

    it("returns null for every row when break-by-patrol is off", () => {
      const { context, transposed } = makeTransposedContext([makeRow({ memberId: "m1", patrolName: "Wombats" }), makeRow({ memberId: "m2", patrolName: "Kookaburras" })], false);

      expect(methods.patrolDividerBeforeRow.call(context, transposed, 0)).toBeNull();
      expect(methods.patrolDividerBeforeRow.call(context, transposed, 1)).toBeNull();
    });

    it("places a divider before the first row and before each patrol change, not on every row", () => {
      // Row order ends up [m2 (Kookaburras), m1 (Wombats), m3 (Wombats)] — same patrol ordering
      // buildWorksheetPages already applies to columns, now read as rows (Layout B).
      const rows = [makeRow({ memberId: "m1", memberName: "Alba", patrolName: "Wombats" }), makeRow({ memberId: "m2", memberName: "Beth", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", memberName: "Cleo", patrolName: "Wombats" })];
      const { context, transposed } = makeTransposedContext(rows, true);

      expect(methods.patrolDividerBeforeRow.call(context, transposed, 0)).toBe("Kookaburras");
      expect(methods.patrolDividerBeforeRow.call(context, transposed, 1)).toBe("Wombats");
      expect(methods.patrolDividerBeforeRow.call(context, transposed, 2)).toBeNull(); // still Wombats, no change
    });

    it("labels a null patrolName as 'Unassigned'", () => {
      const { context, transposed } = makeTransposedContext([makeRow({ memberId: "m1", patrolName: null })], true);

      expect(methods.patrolDividerBeforeRow.call(context, transposed, 0)).toBe("Unassigned");
    });
  });
});

describe("TEMPORARY DEV AID — large-unit preview via localStorage (delete alongside the feature)", () => {
  afterEach(() => {
    window.localStorage.removeItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY);
  });

  describe("readDevDuplicateCount", () => {
    it("returns 0 when the key is absent", () => {
      expect(readDevDuplicateCount()).toBe(0);
    });

    it("returns 0 for a non-numeric, zero, or negative value", () => {
      window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "not-a-number");
      expect(readDevDuplicateCount()).toBe(0);

      window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "0");
      expect(readDevDuplicateCount()).toBe(0);

      window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "-5");
      expect(readDevDuplicateCount()).toBe(0);
    });

    it("returns the parsed integer for a valid positive value", () => {
      window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "10");
      expect(readDevDuplicateCount()).toBe(10);
    });
  });

  describe("duplicateMembersForDevPreview", () => {
    it("passes items through unchanged (same reference) when duplicateCount is 0", () => {
      const items = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
      expect(duplicateMembersForDevPreview(items, 0)).toBe(items);
    });

    it("multiplies the member count accordingly, with distinct synthesized memberIds", () => {
      const items = [makeRow({ memberId: "m1", memberName: "Alba Sayer" }), makeRow({ memberId: "m2", memberName: "Beth Example" })];

      const result = duplicateMembersForDevPreview(items, 3);

      // 2 real + (2 x 3) duplicates = 8 total.
      expect(result).toHaveLength(8);
      const memberIds = result.map((r) => r.memberId);
      expect(new Set(memberIds).size).toBe(8); // every id distinct — filter+indexOf, not [...new Set()] per this repo's ES5 trap.
      expect(memberIds.filter((id) => id === "m1")).toHaveLength(1);
      expect(memberIds.filter((id) => id.startsWith("m1-dev"))).toHaveLength(3);
    });

    it("keeps every other field (patrol, statement, answered/awarded/date) identical on each duplicate", () => {
      const items = [makeRow({ memberId: "m1", patrolName: "Wombats", inputId: "a1", iStatement: "Some statement", answered: true, awarded: true, date: "2024-02-03" })];

      const result = duplicateMembersForDevPreview(items, 1);

      const duplicate = result.find((r) => r.memberId === "m1-dev1")!;
      expect(duplicate.patrolName).toBe("Wombats");
      expect(duplicate.inputId).toBe("a1");
      expect(duplicate.iStatement).toBe("Some statement");
      expect(duplicate.answered).toBe(true);
      expect(duplicate.awarded).toBe(true);
      expect(duplicate.date).toBe("2024-02-03");
    });
  });

  describe("pageSet wiring", () => {
    it("passes items through unchanged when the dev flag is absent", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const computed = (OASWorksheetsVue as any).computed;
      const rows = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
      const context = { items: rows, filters: makeFilters(), availablePatrols: [] };

      const pageSet = computed.pageSet.call(context);

      expect(pageSet.members).toHaveLength(2);
    });

    it("multiplies the member count when the dev flag is set", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const computed = (OASWorksheetsVue as any).computed;
      const rows = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
      const context = { items: rows, filters: makeFilters(), availablePatrols: [] };
      window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "4");

      const pageSet = computed.pageSet.call(context);

      // 2 real + (2 x 4) duplicates = 10 total.
      expect(pageSet.members).toHaveLength(10);
    });
  });
});

describe("splitTableColumnsForPrint", () => {
  // Mirrors OASWorksheetsVue.vue's own Layout A markup shape closely enough to exercise the real
  // column-slicing logic: a title row (colspan=2 leading cell + one <th> per member), an optional
  // patrol-header row (colspan=2 leading cell + one <th> per patrol, colspan = that patrol's member
  // count), and body rows (an optional rowspan group-band <td>, a statement <td>, one <td> per
  // member).
  function makeTable(memberCount: number, options: { withPatrolHeader?: { patrolSizes: number[] }; memberOffset?: number; memberTotal?: number; title?: string } = {}): HTMLTableElement {
    const table = document.createElement("table");
    table.className = "oas-worksheet-page oas-worksheet-layout-columns";
    if (options.memberOffset !== undefined) {
      table.dataset.oasWorksheetMemberOffset = String(options.memberOffset);
    }
    if (options.memberTotal !== undefined) {
      table.dataset.oasWorksheetMemberTotal = String(options.memberTotal);
    }

    const memberHeaderCells = Array.from({ length: memberCount }, (_, i) => `<th class="oas-worksheet-member-header">Member ${i}</th>`).join("");
    const patrolHeaderRow = options.withPatrolHeader
      ? `<tr class="oas-worksheet-patrol-header-row"><th class="oas-worksheet-group-header" colspan="2"></th>${options.withPatrolHeader.patrolSizes.map((size, i) => `<th class="oas-worksheet-patrol-header" colspan="${size}">Patrol ${i}</th>`).join("")}</tr>`
      : "";
    const memberCells = Array.from({ length: memberCount }, (_, i) => `<td class="oas-worksheet-cell" style="width: 999px; min-width: 999px">${i === 0 ? "" : ""}<span class="oas-worksheet-tick-box"></span></td>`).join("");

    table.innerHTML = `
      <thead>
        ${patrolHeaderRow}
        <tr>
          <th class="oas-worksheet-group-header oas-worksheet-page-title" colspan="2">${options.title ?? "Stage 1 - Bushcraft"}</th>
          ${memberHeaderCells}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="1" class="oas-worksheet-group-band">Plan</td>
          <td class="oas-worksheet-statement" style="width: 999px">Some I-Statement text</td>
          ${memberCells}
        </tr>
      </tbody>
    `;
    return table;
  }

  it("does not mutate the live table passed in — every result is a separate clone", () => {
    const table = makeTable(2);
    const results = splitTableColumnsForPrint(table, 10);

    expect(results[0]).not.toBe(table);
    expect(table.querySelectorAll(".oas-worksheet-cell")).toHaveLength(2);
  });

  it("returns a single table unchanged in member count when it already fits within maxColumns", () => {
    const table = makeTable(5);
    const results = splitTableColumnsForPrint(table, 10);

    expect(results).toHaveLength(1);
    expect(results[0].querySelectorAll(".oas-worksheet-cell")).toHaveLength(5);
    expect(results[0].querySelectorAll(".oas-worksheet-member-header")).toHaveLength(5);
  });

  it("re-splits a table into multiple print-sized tables when it exceeds maxColumns", () => {
    const table = makeTable(20);
    const results = splitTableColumnsForPrint(table, 8);

    // ceil(20/8) = 3 batches, evenly sized: 7/7/6 (same even-split rule as splitPageIntoColumnBatches).
    expect(results).toHaveLength(3);
    expect(results[0].querySelectorAll(".oas-worksheet-cell")).toHaveLength(7);
    expect(results[1].querySelectorAll(".oas-worksheet-cell")).toHaveLength(7);
    expect(results[2].querySelectorAll(".oas-worksheet-cell")).toHaveLength(6);
  });

  it("overwrites each result's statement/member-column widths to print-sized values, not the original screen widths", () => {
    const table = makeTable(20);
    const results = splitTableColumnsForPrint(table, 8);

    results.forEach((result) => {
      expect(result.querySelector<HTMLElement>(".oas-worksheet-statement")!.style.width).not.toBe("999px");
      result.querySelectorAll<HTMLElement>(".oas-worksheet-cell").forEach((cell) => {
        expect(cell.style.width).not.toBe("999px");
        expect(cell.style.minWidth).not.toBe("999px");
      });
    });
  });

  it("gives every re-split batch an identical statement/member-column width (they must visually line up)", () => {
    const table = makeTable(20);
    const results = splitTableColumnsForPrint(table, 8);

    const widths = results.map((r) => r.querySelector<HTMLElement>(".oas-worksheet-statement")!.style.width);
    expect(new Set(widths).size).toBe(1);
  });

  it("labels each re-split batch with a 1-based member range when there's more than one", () => {
    const table = makeTable(20);
    const results = splitTableColumnsForPrint(table, 8);

    expect(results[0].querySelector(".oas-worksheet-page-title")!.textContent).toBe("Stage 1 - Bushcraft (members 1-7 of 20)");
    expect(results[1].querySelector(".oas-worksheet-page-title")!.textContent).toBe("Stage 1 - Bushcraft (members 8-14 of 20)");
    expect(results[2].querySelector(".oas-worksheet-page-title")!.textContent).toBe("Stage 1 - Bushcraft (members 15-20 of 20)");
  });

  it("numbers a re-split batch against the ORIGINAL page's true total, not this table's own local member count", () => {
    // Simulates a table that is ALREADY one screen-split batch (29 of 33 members, per the
    // data-oas-worksheet-member-offset/-total attributes columnsLayoutPages sets) — print's own,
    // smaller budget re-splits this 29-member table further still, and the result must read
    // "of 33" (the true original total), not "of 29" (this table's own local member count).
    const table = makeTable(29, { memberOffset: 0, memberTotal: 33, title: "Stage 1 - Bushcraft (members 1-29 of 33)" });
    const results = splitTableColumnsForPrint(table, 8);

    expect(results).toHaveLength(4);
    expect(results[0].querySelector(".oas-worksheet-page-title")!.textContent).toBe("Stage 1 - Bushcraft (members 1-8 of 33)");
    expect(results[3].querySelector(".oas-worksheet-page-title")!.textContent).toBe("Stage 1 - Bushcraft (members 25-29 of 33)");
  });

  it("does not double up the title suffix when re-splitting an already screen-split (suffixed) table", () => {
    const table = makeTable(29, { memberOffset: 0, memberTotal: 33, title: "Stage 1 - Bushcraft (members 1-29 of 33)" });
    const results = splitTableColumnsForPrint(table, 8);

    results.forEach((result) => {
      const title = result.querySelector(".oas-worksheet-page-title")!.textContent!;
      expect(title.match(/\(members/g)).toHaveLength(1);
    });
  });

  it("leaves the title unchanged when the original page was never split by the screen either", () => {
    const table = makeTable(5, { title: "Stage 1 - Bushcraft" });
    const results = splitTableColumnsForPrint(table, 10);

    expect(results[0].querySelector(".oas-worksheet-page-title")!.textContent).toBe("Stage 1 - Bushcraft");
  });

  it("recomputes patrol-header colspans against each new column range, clipping spans at batch boundaries", () => {
    // 2 patrols of 10 members each (20 total), split into batches of <=8: batch 0 gets [0,8) — all
    // from patrol 0 (colspan 8, patrol 1 dropped entirely); batch 1 gets [8,15) — the last 2 of
    // patrol 0 (colspan 2) plus the first 5 of patrol 1 (colspan 5); etc.
    const table = makeTable(20, { withPatrolHeader: { patrolSizes: [10, 10] } });
    const results = splitTableColumnsForPrint(table, 7);

    const patrolHeadersOf = (result: HTMLTableElement) => Array.from(result.querySelectorAll<HTMLTableCellElement>(".oas-worksheet-patrol-header")).map((th) => ({ text: th.textContent, colspan: th.colSpan }));

    // ceil(20/7) = 3 batches, evenly sized 7/7/6.
    expect(results).toHaveLength(3);
    expect(patrolHeadersOf(results[0])).toEqual([{ text: "Patrol 0", colspan: 7 }]);
    expect(patrolHeadersOf(results[1])).toEqual([
      { text: "Patrol 0", colspan: 3 },
      { text: "Patrol 1", colspan: 4 },
    ]);
    expect(patrolHeadersOf(results[2])).toEqual([{ text: "Patrol 1", colspan: 6 }]);
  });

  it("every re-split batch's total colspan across patrol headers matches its own member count", () => {
    const table = makeTable(20, { withPatrolHeader: { patrolSizes: [10, 10] } });
    const results = splitTableColumnsForPrint(table, 7);

    results.forEach((result) => {
      const totalColspan = Array.from(result.querySelectorAll<HTMLTableCellElement>(".oas-worksheet-patrol-header")).reduce((sum, th) => sum + th.colSpan, 0);
      const memberCellCount = result.querySelectorAll(".oas-worksheet-cell").length;
      expect(totalColspan).toBe(memberCellCount);
    });
  });

  it("keeps the group-band and statement cells from the body row on every batch, untouched", () => {
    const table = makeTable(20);
    const results = splitTableColumnsForPrint(table, 8);

    results.forEach((result) => {
      expect(result.querySelector(".oas-worksheet-group-band")!.textContent).toBe("Plan");
      expect(result.querySelector(".oas-worksheet-statement")!.textContent).toBe("Some I-Statement text");
    });
  });

  it("treats maxColumns <= 0 as 'do not split', matching splitPageIntoColumnBatches", () => {
    const table = makeTable(5);
    const results = splitTableColumnsForPrint(table, 0);

    expect(results).toHaveLength(1);
    expect(results[0].querySelectorAll(".oas-worksheet-cell")).toHaveLength(5);
  });
});
