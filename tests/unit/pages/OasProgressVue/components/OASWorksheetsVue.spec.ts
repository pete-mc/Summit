import OASWorksheetsVue, { worksheetCellClass, formatWorksheetDate } from "@/pages/OasProgressVue/components/OASWorksheetsVue";
import type { WorksheetCell, WorksheetPage, TransposedWorksheetPage } from "@/pages/OasProgressVue/services/buildWorksheetPages";
import {
  maxFittingMemberColumns,
  maxFittingTransposedColumns,
  GROUP_BAND_COLUMN_WIDTH_SCREEN_PX,
  STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX,
  PRINT_USABLE_WIDTH_PX,
  TRANSPOSED_COLUMN_WIDTH_SCREEN_PX,
} from "@/pages/OasProgressVue/services/worksheetPrintPageSize";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";
import { UNASSIGNED_PATROL } from "@/pages/OasProgress/services/filterHeatMapSections";

// Test-fixture convenience only; real code never splits memberName.
function makeRow(overrides: Partial<OASProgressRow> = {}): OASProgressRow {
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

const SKILL_STREAM = "bushcraft::bushcraft";
const MAX_FITTING_MEMBER_COLUMNS = maxFittingMemberColumns(PRINT_USABLE_WIDTH_PX, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX);

function makeFilters(overrides: Partial<OASProgressVueFilterState> = {}): OASProgressVueFilterState {
  return {
    viewMode: "worksheets",
    groupBy: "skill",
    memberFilter: "",
    nameFormat: "full",
    selectedPatrols: [],
    breakByPatrol: false,
    showEmptySkillRows: true,
    showEmptyTopStages: true,
    showAwarded: true,
    showNotStarted: true,
    showAnswered: true,
    visibleStreams: [],
    visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    sortBy: "firstName",
    worksheetSkillStream: SKILL_STREAM,
    worksheetVisibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    worksheetNameFormat: "full",
    worksheetSelectedPatrols: [UNASSIGNED_PATROL],
    worksheetBreakByPatrol: false,
    worksheetShowCompleted: true,
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
    expect(worksheetCellClass(makeCell({ answered: false, awarded: true }))).toBe("oas-worksheet-cell-awarded");
  });

  it("returns the not-applicable class for a statement outside the member's template version", () => {
    expect(worksheetCellClass(makeCell({ notApplicable: true }))).toBe("oas-worksheet-cell-na");
  });
});

describe("formatWorksheetDate", () => {
  it("formats an ISO date as DD/MM/YY", () => {
    expect(formatWorksheetDate("2024-02-03")).toBe("03/02/24");
  });

  it("formats an imported day-first date as DD/MM/YY, not as US month/day", () => {
    expect(formatWorksheetDate("5/6/2023")).toBe("05/06/23");
    expect(formatWorksheetDate("24/6/2023")).toBe("24/06/23");
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
    const context = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters({ worksheetVisibleStages: [1, 2, 3] }), availablePatrols: [] };

    const pageSet = computed.pageSet.call(context);

    expect(pageSet.pages.map((p: WorksheetPage) => p.stage)).toEqual([1]);
  });

  it("builds from the skillStream prop, not the heat map's visibleStreams", () => {
    const rows = [makeRow({ stream: "bushcraft" }), makeRow({ stream: "camping", branch: "camping" })];
    // visibleStreams would exclude bushcraft, proving the worksheet ignores it.
    const context = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters({ visibleStreams: ["camping"] }), availablePatrols: [] };

    const pageSet = computed.pageSet.call(context);

    expect(pageSet.pages.map((p: WorksheetPage) => p.skill)).toEqual(["bushcraft"]);
  });

  it("hasPages is false when no pages match the current filters", () => {
    const context: { items: OASProgressRow[]; skillStream: string; filters: OASProgressVueFilterState; availablePatrols: string[]; pageSet?: unknown } = {
      items: [makeRow({ stream: "bushcraft" })],
      skillStream: "camping::camping",
      filters: makeFilters(),
      availablePatrols: [],
    };
    // Computed-on-computed: pre-resolve pageSet onto the context.
    context.pageSet = computed.pageSet.call(context);

    expect(computed.hasPages.call(context)).toBe(false);
  });

  describe("isMembersAsRows", () => {
    it("is false for the default membersAsColumns layout", () => {
      const context = { skillStream: SKILL_STREAM, filters: makeFilters({ worksheetLayout: "membersAsColumns" }) };
      expect(computed.isMembersAsRows.call(context)).toBe(false);
    });

    it("is true for the membersAsRows (transposed) layout", () => {
      const context = { skillStream: SKILL_STREAM, filters: makeFilters({ worksheetLayout: "membersAsRows" }) };
      expect(computed.isMembersAsRows.call(context)).toBe(true);
    });
  });

  describe("columnsLayoutPages", () => {
    // A fixed measured width, so these test the splitting math rather than the pre-mount fallback.
    const SCREEN_WIDTH_PX = PRINT_USABLE_WIDTH_PX;
    const MAX_FITTING_SCREEN = maxFittingMemberColumns(SCREEN_WIDTH_PX, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX);

    function makeContextWithMembers(memberCount: number) {
      const rows = Array.from({ length: memberCount }, (_, i) => makeRow({ memberId: `m${i}`, memberName: `Member${i}` }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = {
        items: rows,
        skillStream: SKILL_STREAM,
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
      const totalMembers = views.reduce((sum: number, v: { page: WorksheetPage }) => sum + v.page.members.length, 0);
      expect(totalMembers).toBe(MAX_FITTING_SCREEN + 5);
    });

    it("gives a batch at the fitting threshold the minimum member-column width — no room left to expand", () => {
      // An exact multiple packs every batch fully, so widths stay at the minimum.
      const context = makeContextWithMembers(MAX_FITTING_SCREEN * 2);
      const views = computed.columnsLayoutPages.call(context);
      expect(views.length).toBeGreaterThan(1);
      views.forEach((v: { statementWidthPx: number; memberColumnWidthPx: number }) => {
        expect(v.memberColumnWidthPx).toBe(70);
      });
    });

    // Two members used to be stretched across the whole screen.
    it("keeps an unsplit small page's member columns at the minimum width, with the relaxed statement width", () => {
      const context = makeContextWithMembers(2);
      const views = computed.columnsLayoutPages.call(context);
      expect(views).toHaveLength(1);
      expect(views[0].memberColumnWidthPx).toBe(70);
      expect(views[0].statementWidthPx).toBe(420);
    });

    it("falls back to PRINT_USABLE_WIDTH_PX before the ResizeObserver has measured anything (screenAvailableWidthPx unset)", () => {
      const rows = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters(), availablePatrols: [] };
      context.pageSet = computed.pageSet.call(context);

      const views = computed.columnsLayoutPages.call(context);

      expect(views).toHaveLength(1);
      expect(views[0].memberColumnWidthPx).toBeGreaterThan(0);
    });

    it("gives every batch of a split page the SAME statement/member-column width, not one derived from its own smaller member count", () => {
      // Regression: uneven batches got different column widths and stopped lining up.
      const context = makeContextWithMembers(MAX_FITTING_SCREEN + 5);
      const views = computed.columnsLayoutPages.call(context);
      expect(views.length).toBeGreaterThan(1);

      const statementWidths = new Set(views.map((v: { statementWidthPx: number }) => v.statementWidthPx));
      const memberWidths = new Set(views.map((v: { memberColumnWidthPx: number }) => v.memberColumnWidthPx));
      expect(statementWidths.size).toBe(1);
      expect(memberWidths.size).toBe(1);
    });
  });

  describe("rowsLayoutPages", () => {
    const SCREEN_WIDTH_PX = PRINT_USABLE_WIDTH_PX;
    // The name column is measured, so compute MAX_FITTING_SCREEN from the real name.
    function maxFittingScreenFor(memberCount: number): number {
      const rows = Array.from({ length: memberCount }, (_, i) => makeRow({ memberId: `m${i}` }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters(), availablePatrols: [], screenAvailableWidthPx: SCREEN_WIDTH_PX };
      context.pageSet = computed.pageSet.call(context);
      const views = computed.rowsLayoutPages.call(context);
      return maxFittingTransposedColumns(SCREEN_WIDTH_PX, views[0].memberNameColumnWidthPx, TRANSPOSED_COLUMN_WIDTH_SCREEN_PX);
    }
    const MAX_FITTING_SCREEN = maxFittingScreenFor(1);

    function makeContextWithStatements(statementCount: number) {
      const rows = Array.from({ length: statementCount }, (_, i) => makeRow({ memberId: "m1", inputId: `a${i}`, iStatement: `Statement ${i}` }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters(), availablePatrols: [], screenAvailableWidthPx: SCREEN_WIDTH_PX };
      context.pageSet = computed.pageSet.call(context);
      return context;
    }

    it("produces one transposed view per page, with a fixed column width, when within the fitting threshold", () => {
      const rows = [makeRow({ memberId: "m1", inputId: "a1" }), makeRow({ memberId: "m2", inputId: "a1" })];
      const context = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters(), availablePatrols: [], screenAvailableWidthPx: SCREEN_WIDTH_PX };
      context.pageSet = computed.pageSet.call(context);

      const views = computed.rowsLayoutPages.call(context);

      expect(views).toHaveLength(1);
      expect(views[0].page.rows.map((r: TransposedWorksheetPage["rows"][number]) => r.memberId)).toEqual(["m1", "m2"]);
      expect(views[0].columnWidthPx).toBe(TRANSPOSED_COLUMN_WIDTH_SCREEN_PX);
    });

    it("never splits members (rows) — a large member count stays in full on every column batch", () => {
      const rows = Array.from({ length: 40 }, (_, i) => makeRow({ memberId: `m${i}` }));
      const context = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters(), availablePatrols: [], screenAvailableWidthPx: SCREEN_WIDTH_PX };
      context.pageSet = computed.pageSet.call(context);

      const views = computed.rowsLayoutPages.call(context);

      views.forEach((v: { page: TransposedWorksheetPage }) => {
        expect(v.page.rows).toHaveLength(40);
      });
    });

    it("splits into multiple sheets when a page has more I-Statement columns than fit wrapped", () => {
      const context = makeContextWithStatements(MAX_FITTING_SCREEN + 5);
      const views = computed.rowsLayoutPages.call(context);

      expect(views.length).toBeGreaterThan(1);
      const totalColumns = views.reduce((sum: number, v: { page: TransposedWorksheetPage }) => sum + v.page.columns.length, 0);
      expect(totalColumns).toBe(MAX_FITTING_SCREEN + 5);
    });

    it("gives every batch a fixed column width — never shrinking, unlike the old font-fitting approach", () => {
      const context = makeContextWithStatements(MAX_FITTING_SCREEN + 5);
      const views = computed.rowsLayoutPages.call(context);

      expect(views.length).toBeGreaterThan(1);
      views.forEach((v: { columnWidthPx: number }) => {
        expect(v.columnWidthPx).toBe(TRANSPOSED_COLUMN_WIDTH_SCREEN_PX);
      });
    });

    it("falls back to PRINT_USABLE_WIDTH_PX before the ResizeObserver has measured anything (screenAvailableWidthPx unset)", () => {
      const rows = [makeRow({ memberId: "m1", inputId: "a1" })];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters(), availablePatrols: [] };
      context.pageSet = computed.pageSet.call(context);

      const views = computed.rowsLayoutPages.call(context);

      expect(views).toHaveLength(1);
      expect(views[0].columnWidthPx).toBe(TRANSPOSED_COLUMN_WIDTH_SCREEN_PX);
    });

    it("measures the member-name column width from the longest member name on the page, applying it to every batch", () => {
      const rows = [makeRow({ memberId: "m1", memberName: "Jo", inputId: "a1" }), makeRow({ memberId: "m2", memberName: "Alexandra Montgomery-Smith", inputId: "a1" }), makeRow({ memberId: "m3", memberName: "Beth", inputId: "a1" })];
      const context = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters(), availablePatrols: [], screenAvailableWidthPx: SCREEN_WIDTH_PX };
      context.pageSet = computed.pageSet.call(context);

      const views = computed.rowsLayoutPages.call(context);

      expect(views).toHaveLength(1);
      expect(views[0].memberNameColumnWidthPx).toBeGreaterThan(0);
    });

    it("gives every batch of a split page the SAME member-name column width, derived from the ORIGINAL page's full member list", () => {
      const context = makeContextWithStatements(MAX_FITTING_SCREEN + 5);
      const views = computed.rowsLayoutPages.call(context);

      expect(views.length).toBeGreaterThan(1);
      const widths = new Set(views.map((v: { memberNameColumnWidthPx: number }) => v.memberNameColumnWidthPx));
      expect(widths.size).toBe(1);
    });
  });

  describe("hasSplitPages", () => {
    // Pre-resolve the computeds hasSplitPages reads.
    function makeContext(rows: OASProgressRow[], filterOverrides: Partial<OASProgressVueFilterState> = {}) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters(filterOverrides), availablePatrols: [], screenAvailableWidthPx: PRINT_USABLE_WIDTH_PX };
      context.pageSet = computed.pageSet.call(context);
      context.isMembersAsRows = computed.isMembersAsRows.call(context);
      context.columnsLayoutPages = computed.columnsLayoutPages.call(context);
      context.rowsLayoutPages = computed.rowsLayoutPages.call(context);
      return context;
    }

    it("is false for membersAsRows when nothing needed splitting — many members alone don't force a split on this axis", () => {
      const rows = Array.from({ length: MAX_FITTING_MEMBER_COLUMNS + 20 }, (_, i) => makeRow({ memberId: `m${i}` }));
      const context = makeContext(rows, { worksheetLayout: "membersAsRows" });

      expect(computed.hasSplitPages.call(context)).toBe(false);
    });

    it("is true for membersAsRows once a page has more I-Statement columns than fit wrapped", () => {
      const rows = Array.from({ length: MAX_FITTING_MEMBER_COLUMNS + 10 }, (_, i) => makeRow({ memberId: "m1", inputId: `a${i}` }));
      const context = makeContext(rows, { worksheetLayout: "membersAsRows" });

      expect(computed.hasSplitPages.call(context)).toBe(true);
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
      const context: { items: OASProgressRow[]; skillStream: string; filters: OASProgressVueFilterState; availablePatrols: string[]; pageSet?: unknown } = {
        items: rows,
        skillStream: SKILL_STREAM,
        filters: makeFilters({ worksheetBreakByPatrol: false, worksheetSelectedPatrols: ["Wombats", "Kookaburras"] }),
        availablePatrols: ["Wombats", "Kookaburras"],
      };
      const pageSet = computed.pageSet.call(context);
      context.pageSet = pageSet;

      const spans = methods.patrolSpansForPage.call(context, pageSet.pages[0]);

      expect(spans).toEqual([]);
    });

    it("returns one span per patrol, column counts summing to the page's member count, in the same order as the columns", () => {
      const rows = [makeRow({ memberId: "m1", memberName: "Amy", patrolName: "Wombats" }), makeRow({ memberId: "m2", memberName: "Beth", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", memberName: "Cleo", patrolName: "Wombats" })];
      const context: { items: OASProgressRow[]; skillStream: string; filters: OASProgressVueFilterState; availablePatrols: string[]; pageSet?: unknown } = {
        items: rows,
        skillStream: SKILL_STREAM,
        filters: makeFilters({ worksheetBreakByPatrol: true, worksheetSelectedPatrols: ["Wombats", "Kookaburras"] }),
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
      // Out-of-order spans would misalign the colspan header.
      expect(page.members.map((m: { patrolName: string | null }) => m.patrolName)).toEqual(["Kookaburras", "Wombats", "Wombats"]);
    });
  });

  describe("patrolBorderClassesForPage", () => {
    // Binds patrolSpansForPage onto the context, as a real instance would have it.
    function makeContext(rows: OASProgressRow[], filterOverrides: Partial<OASProgressVueFilterState> = {}, availablePatrols: string[] = []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context: any = { items: rows, skillStream: SKILL_STREAM, filters: makeFilters({ worksheetSelectedPatrols: availablePatrols, ...filterOverrides }), availablePatrols, patrolSpansForPage: methods.patrolSpansForPage };
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
      const rows = [makeRow({ memberId: "m1", memberName: "Amy", patrolName: "Wombats" }), makeRow({ memberId: "m2", memberName: "Beth", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", memberName: "Cleo", patrolName: "Wombats" })];
      const context = makeContext(rows, { worksheetBreakByPatrol: true }, ["Wombats", "Kookaburras"]);
      const page = context.pageSet.pages[0] as WorksheetPage;

      const borders = methods.patrolBorderClassesForPage.call(context, page);

      expect(borders).toEqual([
        { start: true, end: true },
        { start: true, end: false },
        { start: false, end: true },
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

  describe("groupBorderClassesForPage (Layout B's Plan/Do/Review/Verify column borders)", () => {
    it("returns {start:false, end:false} for every column when there are no group spans", () => {
      const page: TransposedWorksheetPage = { key: "k", skill: "bushcraft", stream: "bushcraft", stage: 1, title: "t", columns: [{ inputId: "a1", iStatement: "x", inputGroup: "Plan" }], groupSpans: [], rows: [] };

      expect(methods.groupBorderClassesForPage.call({}, page)).toEqual([{ start: false, end: false }]);
    });

    it("flags only the first and last column of each group, not every column in it", () => {
      const columns = [
        { inputId: "a1", iStatement: "x", inputGroup: "Plan" },
        { inputId: "a2", iStatement: "x", inputGroup: "Do" },
        { inputId: "a3", iStatement: "x", inputGroup: "Do" },
      ];
      const page: TransposedWorksheetPage = {
        key: "k",
        skill: "bushcraft",
        stream: "bushcraft",
        stage: 1,
        title: "t",
        columns,
        groupSpans: [
          { title: "Plan", startColumnIndex: 0, columnCount: 1 },
          { title: "Do", startColumnIndex: 1, columnCount: 2 },
        ],
        rows: [],
      };

      const borders = methods.groupBorderClassesForPage.call({}, page);

      expect(borders).toEqual([
        { start: true, end: true },
        { start: true, end: false },
        { start: false, end: true },
      ]);
    });
  });

  describe("patrolDividerBeforeRow (Layout B's row-based patrol grouping)", () => {
    function makeTransposedContext(rows: OASProgressRow[], breakByPatrol: boolean) {
      const context: { items: OASProgressRow[]; skillStream: string; filters: OASProgressVueFilterState; availablePatrols: string[]; pageSet?: unknown } = {
        items: rows,
        skillStream: SKILL_STREAM,
        filters: makeFilters({ worksheetBreakByPatrol: breakByPatrol, worksheetSelectedPatrols: ["Wombats", "Kookaburras", UNASSIGNED_PATROL] }),
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
      const rows = [makeRow({ memberId: "m1", memberName: "Amy", patrolName: "Wombats" }), makeRow({ memberId: "m2", memberName: "Beth", patrolName: "Kookaburras" }), makeRow({ memberId: "m3", memberName: "Cleo", patrolName: "Wombats" })];
      const { context, transposed } = makeTransposedContext(rows, true);

      expect(methods.patrolDividerBeforeRow.call(context, transposed, 0)).toBe("Kookaburras");
      expect(methods.patrolDividerBeforeRow.call(context, transposed, 1)).toBe("Wombats");
      expect(methods.patrolDividerBeforeRow.call(context, transposed, 2)).toBeNull();
    });

    it("labels a null patrolName as 'Unassigned'", () => {
      const { context, transposed } = makeTransposedContext([makeRow({ memberId: "m1", patrolName: null })], true);

      expect(methods.patrolDividerBeforeRow.call(context, transposed, 0)).toBe("Unassigned");
    });
  });
});
