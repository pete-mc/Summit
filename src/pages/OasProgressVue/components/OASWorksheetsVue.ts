import { defineComponent } from "vue";
import type { PropType } from "vue";
import moment from "moment";
import { buildWorksheetPages, splitPageIntoColumnBatches, transposeWorksheetPage, splitTransposedPageIntoColumnBatches } from "@/pages/OasProgressVue/services/buildWorksheetPages";
import type { WorksheetCell, WorksheetMember, WorksheetPage, WorksheetPageSet, TransposedWorksheetPage } from "@/pages/OasProgressVue/services/buildWorksheetPages";
import {
  maxFittingMemberColumns,
  computeColumnsLayoutMetrics,
  GROUP_BAND_COLUMN_WIDTH_SCREEN_PX,
  STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX,
  STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX,
  PRINT_USABLE_WIDTH_PX,
  memberNameColumnWidthPx,
  WORKSHEET_FONT_FAMILY,
  WORKSHEET_BODY_FONT_SIZE_SCREEN_PX,
  TRANSPOSED_COLUMN_WIDTH_SCREEN_PX,
  maxFittingTransposedColumns,
} from "@/pages/OasProgressVue/services/worksheetPrintPageSize";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";

export function worksheetCellClass(cell: WorksheetCell): string {
  if (cell.notApplicable) {
    return "oas-worksheet-cell-na";
  }
  if (cell.awarded) {
    return "oas-worksheet-cell-awarded";
  }
  if (cell.answered) {
    return "oas-worksheet-cell-answered";
  }
  return "oas-worksheet-cell-empty";
}

/** Terrain dates that don't parse are shown as-is: better odd than blank. */
export function formatWorksheetDate(date: string | null): string {
  if (!date) {
    return "";
  }
  const parsed = moment(date, moment.ISO_8601, true);
  return parsed.isValid() ? parsed.format("DD/MM/YY") : date;
}

interface WorksheetPatrolSpan {
  patrolName: string;
  columnCount: number;
}

interface PatrolBorderClasses {
  start: boolean;
  end: boolean;
}

const NO_PATROL_BORDER: PatrolBorderClasses = { start: false, end: false };

/**
 * Dev aid: preview a large unit without one. In DevTools:
 *   localStorage.setItem("summit.oasWorksheetsVue.devDuplicateMembers", "10")
 * Delete this key, readDevDuplicateCount, duplicateMembersForDevPreview and their use in pageSet once no longer needed.
 */
export const DEV_DUPLICATE_MEMBERS_STORAGE_KEY = "summit.oasWorksheetsVue.devDuplicateMembers";

export function readDevDuplicateCount(): number {
  try {
    const raw = window.localStorage.getItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/** Gotcha: the suffix must go on lastName, because sorting and display read firstName/lastName. */
export function duplicateMembersForDevPreview(items: OASProgressRow[], duplicateCount: number): OASProgressRow[] {
  if (duplicateCount <= 0) {
    return items;
  }
  const copies: OASProgressRow[] = [];
  for (let i = 1; i <= duplicateCount; i++) {
    items.forEach((row) => {
      const lastName = `${row.lastName} (dev ${i})`;
      copies.push({ ...row, memberId: `${row.memberId}-dev${i}`, memberName: `${row.firstName} ${lastName}`, lastName });
    });
  }
  return [...items, ...copies];
}

export interface WorksheetExportView {
  pages: WorksheetPage[];
  membersAsRows: boolean;
  breakByPatrol: boolean;
}

interface TransposedPageView {
  page: TransposedWorksheetPage;
  columnWidthPx: number;
  memberNameColumnWidthPx: number;
}

interface ColumnsPageView {
  page: WorksheetPage;
  statementWidthPx: number;
  memberColumnWidthPx: number;
}

/** Gotcha: before the first ResizeObserver reading the width is 0, and a max of 0 means "never split". Fall back to the print width until then. */
function usableScreenWidthPx(measuredWidthPx: number): number {
  return measuredWidthPx > 0 ? measuredWidthPx : PRINT_USABLE_WIDTH_PX;
}

export default defineComponent({
  name: "OASWorksheetsVue",
  props: {
    items: { type: Array as PropType<OASProgressRow[]>, required: true },
    filters: { type: Object as PropType<OASProgressVueFilterState>, required: true },
    skillStream: { type: String, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
  },
  data() {
    return {
      screenAvailableWidthPx: 0,
      resizeObserver: null as ResizeObserver | null,
    };
  },
  computed: {
    pageSet(): WorksheetPageSet {
      const itemsForDisplay = duplicateMembersForDevPreview(this.items, readDevDuplicateCount());
      const selectedPatrols = this.filters.worksheetSelectedPatrols ?? [];
      return buildWorksheetPages(itemsForDisplay, {
        skillStream: this.skillStream,
        visibleStages: this.filters.worksheetVisibleStages,
        selectedPatrols,
        memberFilter: "",
        nameFormat: this.filters.worksheetNameFormat,
        breakByPatrol: this.filters.worksheetBreakByPatrol,
        hideCompleted: !this.filters.worksheetShowCompleted,
        sortBy: "firstName",
      });
    },
    isMembersAsRows(): boolean {
      return this.filters.worksheetLayout === "membersAsRows";
    },
    /** Every batch of a split page uses the first batch's widths, so split tables line up. */
    columnsLayoutPages(): ColumnsPageView[] {
      const usableWidthPx = usableScreenWidthPx(this.screenAvailableWidthPx);
      const maxColumns = maxFittingMemberColumns(usableWidthPx, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX);
      return this.pageSet.pages.flatMap((page) => {
        const batches = splitPageIntoColumnBatches(page, maxColumns);
        const batchSize = batches[0].members.length;
        const metrics = computeColumnsLayoutMetrics(usableWidthPx, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, batchSize, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
        return batches.map((batch) => ({
          page: batch,
          statementWidthPx: metrics.statementWidthPx,
          memberColumnWidthPx: metrics.memberColumnWidthPx,
        }));
      });
    },
    rowsLayoutPages(): TransposedPageView[] {
      const usableWidthPx = usableScreenWidthPx(this.screenAvailableWidthPx);
      return this.pageSet.pages.flatMap((page) => {
        const transposed = transposeWorksheetPage(page);
        const nameColumnWidthPx = memberNameColumnWidthPx(
          transposed.rows.map((r) => r.displayName),
          WORKSHEET_BODY_FONT_SIZE_SCREEN_PX,
          WORKSHEET_FONT_FAMILY,
        );
        const maxColumns = maxFittingTransposedColumns(usableWidthPx, nameColumnWidthPx, TRANSPOSED_COLUMN_WIDTH_SCREEN_PX);
        const batches = splitTransposedPageIntoColumnBatches(transposed, maxColumns);
        return batches.map((batch) => ({
          page: batch,
          columnWidthPx: TRANSPOSED_COLUMN_WIDTH_SCREEN_PX,
          memberNameColumnWidthPx: nameColumnWidthPx,
        }));
      });
    },
    hasPages(): boolean {
      return this.pageSet.pages.length > 0;
    },
    hasSplitPages(): boolean {
      const renderedBatchCount = this.isMembersAsRows ? this.rowsLayoutPages.length : this.columnsLayoutPages.length;
      return renderedBatchCount > this.pageSet.pages.length;
    },
  },
  methods: {
    worksheetCellClass,
    formatWorksheetDate,
    patrolSpansForPage(page: WorksheetPage): WorksheetPatrolSpan[] {
      if (!this.filters.worksheetBreakByPatrol || !this.pageSet.patrolGroups) {
        return [];
      }
      const memberIdsOnPage = new Set(page.members.map((m) => m.memberId));
      return this.pageSet.patrolGroups
        .map((group) => ({
          patrolName: group.patrolName,
          columnCount: group.members.filter((m: WorksheetMember) => memberIdsOnPage.has(m.memberId)).length,
        }))
        .filter((span) => span.columnCount > 0);
    },
    patrolBorderClassesForPage(page: WorksheetPage): PatrolBorderClasses[] {
      const spans = this.patrolSpansForPage(page);
      if (spans.length === 0) {
        return page.members.map(() => NO_PATROL_BORDER);
      }
      return spans.flatMap((span) => Array.from({ length: span.columnCount }, (_, i) => ({ start: i === 0, end: i === span.columnCount - 1 })));
    },
    patrolDividerBeforeRow(transposed: TransposedWorksheetPage, rowIndex: number): string | null {
      if (!this.filters.worksheetBreakByPatrol) {
        return null;
      }
      const row = transposed.rows[rowIndex];
      const previousRow = transposed.rows[rowIndex - 1];
      if (rowIndex === 0 || row.patrolName !== previousRow.patrolName) {
        return row.patrolName ?? "Unassigned";
      }
      return null;
    },
    groupBorderClassesForPage(page: TransposedWorksheetPage): PatrolBorderClasses[] {
      const classes: PatrolBorderClasses[] = page.columns.map(() => NO_PATROL_BORDER);
      page.groupSpans.forEach((span) => {
        for (let i = 0; i < span.columnCount; i++) {
          classes[span.startColumnIndex + i] = { start: i === 0, end: i === span.columnCount - 1 };
        }
      });
      return classes;
    },
    getPrintTables(): HTMLTableElement[] {
      return Array.from((this.$el as HTMLElement).querySelectorAll<HTMLTableElement>(".oas-worksheet-page table"));
    },
    /** Unsplit pages: Excel has no page width. */
    getExportView(): WorksheetExportView {
      return { pages: this.pageSet.pages, membersAsRows: this.isMembersAsRows, breakByPatrol: this.filters.worksheetBreakByPatrol };
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        this.screenAvailableWidthPx = entry.contentRect.width;
      }
    });
    this.resizeObserver.observe(this.$el as HTMLElement);
  },
  beforeDestroy() {
    this.resizeObserver?.disconnect();
  },
});
