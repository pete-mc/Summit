import { defineComponent } from "vue";
import type { PropType } from "vue";
import { parseRowDate } from "@/pages/OasProgressVue/services/parseRowDate";
import { buildStageGridPages, patrolRunLengths, splitPageIntoColumnBatches, transposeStageGridPage, splitTransposedPageIntoColumnBatches } from "@/pages/OasProgressVue/services/buildStageGridPages";
import type { StageGridCell, StageGridMember, StageGridPage, StageGridPageSet, TransposedStageGridPage } from "@/pages/OasProgressVue/services/buildStageGridPages";
import {
  maxFittingMemberColumns,
  computeColumnsLayoutMetrics,
  GROUP_BAND_COLUMN_WIDTH_SCREEN_PX,
  STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX,
  STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX,
  PRINT_USABLE_WIDTH_PX,
  memberNameColumnWidthPx,
  STAGE_GRID_FONT_FAMILY,
  STAGE_GRID_BODY_FONT_SIZE_SCREEN_PX,
  TRANSPOSED_COLUMN_WIDTH_SCREEN_PX,
  maxFittingTransposedColumns,
} from "@/pages/OasProgressVue/services/stageGridPrintPageSize";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";

export function stageGridCellClass(cell: StageGridCell): string {
  if (cell.notApplicable) {
    return "oas-stage-grid-cell-na";
  }
  if (cell.awarded) {
    return "oas-stage-grid-cell-awarded";
  }
  if (cell.answered) {
    return "oas-stage-grid-cell-answered";
  }
  return "oas-stage-grid-cell-empty";
}

export function stageGridSquareClass(cell: StageGridCell): string {
  if (cell.awarded) {
    return "oas-heatmap-square-awarded";
  }
  return cell.answered ? "oas-heatmap-square-answered" : "oas-heatmap-square-unanswered";
}

export function stageGridSquareTitle(cell: StageGridCell): string {
  const status = cell.awarded ? "Awarded" : cell.answered ? "Answered" : "Not answered";
  return cell.date ? `${status} ${formatStageGridDate(cell.date)}` : status;
}

/** Terrain dates that don't parse are shown as-is: better odd than blank. */
export function formatStageGridDate(date: string | null): string {
  if (!date) {
    return "";
  }
  const parsed = parseRowDate(date);
  return parsed.isValid() ? parsed.format("DD/MM/YY") : date;
}

interface StageGridPatrolSpan {
  patrolName: string;
  columnCount: number;
}

interface PatrolBorderClasses {
  start: boolean;
  end: boolean;
}

const NO_PATROL_BORDER: PatrolBorderClasses = { start: false, end: false };

export interface StageGridExportView {
  pages: StageGridPage[];
  membersAsRows: boolean;
  breakByPatrol: boolean;
}

interface TransposedPageView {
  page: TransposedStageGridPage;
  columnWidthPx: number;
  memberNameColumnWidthPx: number;
}

interface ColumnsPageView {
  page: StageGridPage;
  statementWidthPx: number;
  memberColumnWidthPx: number;
}

/** Gotcha: before the first ResizeObserver reading the width is 0, and a max of 0 means "never split". Fall back to the print width until then. */
function usableScreenWidthPx(measuredWidthPx: number): number {
  return measuredWidthPx > 0 ? measuredWidthPx : PRINT_USABLE_WIDTH_PX;
}

export default defineComponent({
  name: "OASStageGridVue",
  props: {
    items: { type: Array as PropType<OASProgressRow[]>, required: true },
    filters: { type: Object as PropType<OASProgressVueFilterState>, required: true },
    skillStream: { type: String, required: true },
    stage: { type: Number as PropType<number | null>, default: null },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
  },
  data() {
    return {
      screenAvailableWidthPx: 0,
      resizeObserver: null as ResizeObserver | null,
    };
  },
  computed: {
    pageSet(): StageGridPageSet {
      const selectedPatrols = this.filters.stageGridSelectedPatrols ?? [];
      return buildStageGridPages(this.items, {
        skillStream: this.skillStream,
        visibleStages: this.stage === null ? [] : [this.stage],
        selectedPatrols,
        memberFilter: "",
        nameFormat: this.filters.stageGridNameFormat,
        breakByPatrol: this.filters.stageGridBreakByPatrol,
        hideCompleted: !this.filters.stageGridShowCompleted,
        sortBy: this.filters.stageGridSortBy === "lastName" ? "lastName" : "firstName",
      });
    },
    isMembersAsRows(): boolean {
      return this.filters.stageGridLayout === "membersAsRows";
    },
    /** Every batch of a split page uses the widest batch's widths, so split tables line up. */
    columnsLayoutPages(): ColumnsPageView[] {
      const usableWidthPx = usableScreenWidthPx(this.screenAvailableWidthPx);
      const maxColumns = maxFittingMemberColumns(usableWidthPx, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX);
      return this.pageSet.pages.flatMap((page) => {
        const runLengths = this.filters.stageGridBreakByPatrol ? patrolRunLengths(page.members) : [page.members.length];
        const batches = splitPageIntoColumnBatches(page, maxColumns, runLengths);
        const batchSize = Math.max.apply(
          null,
          batches.map((batch) => batch.members.length),
        );
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
        const transposed = transposeStageGridPage(page);
        const nameColumnWidthPx = memberNameColumnWidthPx(
          transposed.rows.map((r) => r.displayName),
          STAGE_GRID_BODY_FONT_SIZE_SCREEN_PX,
          STAGE_GRID_FONT_FAMILY,
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
    stageGridCellClass,
    stageGridSquareClass,
    stageGridSquareTitle,
    patrolSpansForPage(page: StageGridPage): StageGridPatrolSpan[] {
      if (!this.filters.stageGridBreakByPatrol || !this.pageSet.patrolGroups) {
        return [];
      }
      const memberIdsOnPage = new Set(page.members.map((m) => m.memberId));
      return this.pageSet.patrolGroups
        .map((group) => ({
          patrolName: group.patrolName,
          columnCount: group.members.filter((m: StageGridMember) => memberIdsOnPage.has(m.memberId)).length,
        }))
        .filter((span) => span.columnCount > 0);
    },
    patrolBorderClassesForPage(page: StageGridPage): PatrolBorderClasses[] {
      const spans = this.patrolSpansForPage(page);
      if (spans.length === 0) {
        return page.members.map(() => NO_PATROL_BORDER);
      }
      return spans.flatMap((span) => Array.from({ length: span.columnCount }, (_, i) => ({ start: i === 0, end: i === span.columnCount - 1 })));
    },
    patrolDividerBeforeRow(transposed: TransposedStageGridPage, rowIndex: number): string | null {
      if (!this.filters.stageGridBreakByPatrol) {
        return null;
      }
      const row = transposed.rows[rowIndex];
      const previousRow = transposed.rows[rowIndex - 1];
      if (rowIndex === 0 || row.patrolName !== previousRow.patrolName) {
        return row.patrolName ?? "Unassigned";
      }
      return null;
    },
    groupBorderClassesForPage(page: TransposedStageGridPage): PatrolBorderClasses[] {
      const classes: PatrolBorderClasses[] = page.columns.map(() => NO_PATROL_BORDER);
      page.groupSpans.forEach((span) => {
        for (let i = 0; i < span.columnCount; i++) {
          classes[span.startColumnIndex + i] = { start: i === 0, end: i === span.columnCount - 1 };
        }
      });
      return classes;
    },
    getPrintTables(): HTMLTableElement[] {
      return Array.from((this.$el as HTMLElement).querySelectorAll<HTMLTableElement>(".oas-stage-grid-page table"));
    },
    /** Unsplit pages: Excel has no page width. */
    getExportView(): StageGridExportView {
      return { pages: this.pageSet.pages, membersAsRows: this.isMembersAsRows, breakByPatrol: this.filters.stageGridBreakByPatrol };
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
