import { defineComponent } from "vue";
import type { PropType } from "vue";
import moment from "moment";
import { buildWorksheetPages, evenBatchRanges, splitPageIntoColumnBatches, transposeWorksheetPage, splitTransposedPageIntoColumnBatches } from "@/pages/OasProgressionVue/services/buildWorksheetPages";
import type { WorksheetCell, WorksheetMember, WorksheetPage, WorksheetPageSet, TransposedWorksheetPage } from "@/pages/OasProgressionVue/services/buildWorksheetPages";
import { printWorksheets } from "@/pages/OasProgressionVue/services/printWorksheets";
import {
  maxFittingMemberColumns,
  computeColumnsLayoutMetrics,
  GROUP_BAND_COLUMN_WIDTH_SCREEN_PX,
  GROUP_BAND_COLUMN_WIDTH_PRINT_PX,
  STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX,
  STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX,
  STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX,
  PRINT_USABLE_WIDTH_PX,
  memberNameColumnWidthPx,
  WORKSHEET_FONT_FAMILY,
  WORKSHEET_BODY_FONT_SIZE_SCREEN_PX,
  WORKSHEET_BODY_FONT_SIZE_PRINT_PX,
  TRANSPOSED_COLUMN_WIDTH_SCREEN_PX,
  TRANSPOSED_COLUMN_WIDTH_PRINT_PX,
  maxFittingTransposedColumns,
} from "@/pages/OasProgressionVue/services/worksheetPrintPageSize";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

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
export function duplicateMembersForDevPreview(items: OASProgressionRow[], duplicateCount: number): OASProgressionRow[] {
  if (duplicateCount <= 0) {
    return items;
  }
  const copies: OASProgressionRow[] = [];
  for (let i = 1; i <= duplicateCount; i++) {
    items.forEach((row) => {
      const lastName = `${row.lastName} (dev ${i})`;
      copies.push({ ...row, memberId: `${row.memberId}-dev${i}`, memberName: `${row.firstName} ${lastName}`, lastName });
    });
  }
  return [...items, ...copies];
}

interface TransposedPageView {
  page: TransposedWorksheetPage;
  columnWidthPx: number;
  memberNameColumnWidthPx: number;
  statementOffset: number;
  originalColumnCount: number;
}

interface ColumnsPageView {
  page: WorksheetPage;
  statementWidthPx: number;
  memberColumnWidthPx: number;
  memberOffset: number;
  originalMemberCount: number;
}

/** Gotcha: before the first ResizeObserver reading the width is 0, and a max of 0 means "never split". Fall back to the print width until then. */
function usableScreenWidthPx(measuredWidthPx: number): number {
  return measuredWidthPx > 0 ? measuredWidthPx : PRINT_USABLE_WIDTH_PX;
}

/**
 * Gotcha: print must re-split from its own A4 budget. A wide monitor fits ~29 member columns where A4 fits ~9,
 * so printing the screen's batches clips columns off the page.
 * Works on the live DOM so print matches the screen exactly. The data-oas-worksheet-member-offset/-total
 * attributes give the position in the original unsplit page, so "members X-Y of N" numbering stays correct
 * when an already screen-split table is split again.
 */
export function splitTableColumnsForPrint(table: HTMLTableElement, maxColumns: number): HTMLTableElement[] {
  const headerRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("thead tr"));
  const memberHeaderRow = headerRows[headerRows.length - 1];
  const patrolHeaderRow = headerRows.length > 1 ? headerRows[0] : null;
  const bodyRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr"));

  const leadingTitleCellCount = 1;
  const memberCount = memberHeaderRow.children.length - leadingTitleCellCount;
  const metrics = computeColumnsLayoutMetrics(PRINT_USABLE_WIDTH_PX, GROUP_BAND_COLUMN_WIDTH_PRINT_PX, Math.min(memberCount, Math.max(maxColumns, 1)), STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
  const batchRanges = evenBatchRanges(memberCount, maxColumns);

  const globalOffset = Number(table.dataset.oasWorksheetMemberOffset ?? "0");
  const globalTotal = Number(table.dataset.oasWorksheetMemberTotal ?? memberCount);
  const baseTitle = (table.querySelector<HTMLElement>("th.oas-worksheet-page-title")?.textContent ?? "").replace(/\s*\(members \d+-\d+ of \d+\)$/, "");

  return batchRanges.map(([start, end]) => {
    const clone = table.cloneNode(false) as HTMLTableElement;
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    if (patrolHeaderRow) {
      thead.appendChild(sliceHeaderRowColumns(patrolHeaderRow, start, end, true));
    }
    const titleRowClone = sliceHeaderRowColumns(memberHeaderRow, start, end, false);
    const titleCell = titleRowClone.querySelector<HTMLElement>("th.oas-worksheet-page-title");
    if (titleCell && (batchRanges.length > 1 || globalTotal > memberCount)) {
      titleCell.textContent = `${baseTitle} (members ${globalOffset + start + 1}-${globalOffset + end} of ${globalTotal})`;
    }
    thead.appendChild(titleRowClone);
    clone.appendChild(thead);

    bodyRows.forEach((row) => {
      tbody.appendChild(sliceBodyRowColumns(row, start, end));
    });
    clone.appendChild(tbody);

    applyColumnsLayoutPrintWidths(clone, metrics.statementWidthPx, metrics.memberColumnWidthPx);
    return clone;
  });
}

/** Keeps the leading cell. With `hasColspans`, clips each patrol span to the overlap with [start, end). */
function sliceHeaderRowColumns(row: HTMLTableRowElement, start: number, end: number, hasColspans: boolean): HTMLTableRowElement {
  const clone = row.cloneNode(false) as HTMLTableRowElement;
  const cells = Array.from(row.children) as HTMLTableCellElement[];
  clone.appendChild(cells[0].cloneNode(true));

  if (!hasColspans) {
    cells.slice(1 + start, 1 + end).forEach((cell) => clone.appendChild(cell.cloneNode(true)));
    return clone;
  }

  let columnIndex = 0;
  cells.slice(1).forEach((cell) => {
    const spanStart = columnIndex;
    const spanEnd = columnIndex + (cell.colSpan || 1);
    columnIndex = spanEnd;
    const overlapStart = Math.max(spanStart, start);
    const overlapEnd = Math.min(spanEnd, end);
    if (overlapEnd <= overlapStart) {
      return;
    }
    const cellClone = cell.cloneNode(true) as HTMLTableCellElement;
    cellClone.colSpan = overlapEnd - overlapStart;
    clone.appendChild(cellClone);
  });
  return clone;
}

/** The rowspan group-band cell only exists on a group's first row. */
function sliceBodyRowColumns(row: HTMLTableRowElement, start: number, end: number): HTMLTableRowElement {
  const clone = row.cloneNode(false) as HTMLTableRowElement;
  const cells = Array.from(row.children) as HTMLTableCellElement[];
  const hasGroupBand = cells[0].classList.contains("oas-worksheet-group-band");
  const fixedCount = hasGroupBand ? 2 : 1;

  cells.slice(0, fixedCount).forEach((cell) => clone.appendChild(cell.cloneNode(true)));
  cells.slice(fixedCount + start, fixedCount + end).forEach((cell) => clone.appendChild(cell.cloneNode(true)));
  return clone;
}

function applyColumnsLayoutPrintWidths(table: HTMLTableElement, statementWidthPx: number, memberColumnWidthPx: number): void {
  table.querySelectorAll<HTMLElement>(".oas-worksheet-statement").forEach((cell) => {
    cell.style.width = `${statementWidthPx}px`;
  });
  table.querySelectorAll<HTMLElement>(".oas-worksheet-cell, .oas-worksheet-member-header").forEach((cell) => {
    cell.style.width = `${memberColumnWidthPx}px`;
    cell.style.minWidth = `${memberColumnWidthPx}px`;
  });
}

/**
 * Layout B version of splitTableColumnsForPrint: splits I-Statement columns, and every member row repeats on each batch.
 * The member-name width is re-measured at the print font size, because it decides how many columns fit.
 * Gotcha: the page title is on the FIRST header row's .oas-worksheet-member-name-header. The second row's cell
 * has the same class but just says "Member".
 */
export function splitRowsTableColumnsForPrint(table: HTMLTableElement, usableWidthPx: number, columnWidthPx: number): HTMLTableElement[] {
  const headerRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("thead tr"));
  const groupSpanRow = headerRows[0];
  const statementHeaderRow = headerRows[1];
  const bodyRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr"));

  const columnCount = statementHeaderRow.children.length - 1;
  const memberNames = Array.from(table.querySelectorAll<HTMLElement>(".oas-worksheet-member-name-cell")).map((cell) => cell.textContent ?? "");
  const nameColumnWidthPx = memberNameColumnWidthPx(memberNames, WORKSHEET_BODY_FONT_SIZE_PRINT_PX, WORKSHEET_FONT_FAMILY);
  const maxColumns = maxFittingTransposedColumns(usableWidthPx, nameColumnWidthPx, columnWidthPx);
  const batchRanges = evenBatchRanges(columnCount, maxColumns);

  const globalOffset = Number(table.dataset.oasWorksheetStatementOffset ?? "0");
  const globalTotal = Number(table.dataset.oasWorksheetStatementTotal ?? columnCount);
  const baseTitle = (groupSpanRow.querySelector<HTMLElement>("th.oas-worksheet-member-name-header")?.textContent ?? "").replace(/\s*\(statements \d+-\d+ of \d+\)$/, "");

  return batchRanges.map(([start, end]) => {
    const clone = table.cloneNode(false) as HTMLTableElement;
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const groupSpanRowClone = sliceHeaderRowColumns(groupSpanRow, start, end, true);
    const titleCell = groupSpanRowClone.querySelector<HTMLElement>("th.oas-worksheet-member-name-header");
    if (titleCell && (batchRanges.length > 1 || globalTotal > columnCount)) {
      titleCell.textContent = `${baseTitle} (statements ${globalOffset + start + 1}-${globalOffset + end} of ${globalTotal})`;
    }
    thead.appendChild(groupSpanRowClone);
    thead.appendChild(sliceHeaderRowColumns(statementHeaderRow, start, end, false));
    clone.appendChild(thead);

    bodyRows.forEach((row) => {
      tbody.appendChild(row.classList.contains("oas-worksheet-patrol-divider-row") ? (row.cloneNode(true) as HTMLTableRowElement) : sliceRowsBodyRowColumns(row, start, end));
    });
    clone.appendChild(tbody);

    clone.querySelectorAll<HTMLElement>(".oas-worksheet-statement-header").forEach((cell) => {
      cell.style.width = `${columnWidthPx}px`;
      cell.style.minWidth = `${columnWidthPx}px`;
    });
    clone.querySelectorAll<HTMLElement>(".oas-worksheet-member-name-cell").forEach((cell) => {
      cell.style.width = `${nameColumnWidthPx}px`;
      cell.style.minWidth = `${nameColumnWidthPx}px`;
    });

    return clone;
  });
}

function sliceRowsBodyRowColumns(row: HTMLTableRowElement, start: number, end: number): HTMLTableRowElement {
  const clone = row.cloneNode(false) as HTMLTableRowElement;
  const cells = Array.from(row.children) as HTMLTableCellElement[];
  clone.appendChild(cells[0].cloneNode(true));
  cells.slice(1 + start, 1 + end).forEach((cell) => clone.appendChild(cell.cloneNode(true)));
  return clone;
}

export default defineComponent({
  name: "OASWorksheetsVue",
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
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
        visibleSkills: this.filters.worksheetVisibleSkills,
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
        return batches.map((batch, batchIndex) => ({
          page: batch,
          statementWidthPx: metrics.statementWidthPx,
          memberColumnWidthPx: metrics.memberColumnWidthPx,
          memberOffset: batchIndex * batchSize,
          originalMemberCount: page.members.length,
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
        const batchSize = batches[0].columns.length;
        return batches.map((batch, batchIndex) => ({
          page: batch,
          columnWidthPx: TRANSPOSED_COLUMN_WIDTH_SCREEN_PX,
          memberNameColumnWidthPx: nameColumnWidthPx,
          statementOffset: batchIndex * batchSize,
          originalColumnCount: transposed.columns.length,
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
    /** Returns false when the print popup was blocked. */
    printCurrentPages(): boolean {
      const liveTables = Array.from((this.$el as HTMLElement).querySelectorAll<HTMLTableElement>("table.oas-worksheet-page"));
      if (liveTables.length === 0) {
        return false;
      }
      let tables: HTMLTableElement[];
      if (this.isMembersAsRows) {
        tables = liveTables.flatMap((table) => splitRowsTableColumnsForPrint(table, PRINT_USABLE_WIDTH_PX, TRANSPOSED_COLUMN_WIDTH_PRINT_PX));
      } else {
        const printMaxColumns = maxFittingMemberColumns(PRINT_USABLE_WIDTH_PX, GROUP_BAND_COLUMN_WIDTH_PRINT_PX, STATEMENT_COLUMN_WRAP_WIDTH_PRINT_PX);
        tables = liveTables.flatMap((table) => splitTableColumnsForPrint(table, printMaxColumns));
      }
      return printWorksheets({
        pageTables: tables,
        documentTitle: "Terrain | Summit - OAS Worksheets",
        orientation: "landscape",
      });
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
