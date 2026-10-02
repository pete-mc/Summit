import { defineComponent } from "vue";
import type { PropType } from "vue";
import moment from "moment";
import { buildWorksheetPages, splitPageIntoColumnBatches, transposeWorksheetPage, splitTransposedPageIntoColumnBatches } from "@/pages/OasProgressionVue/services/buildWorksheetPages";
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

/** Cell state → CSS class, per .claude/OASWorksheets/PLAN_STAGE_1.md's three-state table. Exported so its mapping is independently testable without mounting the component. */
export function worksheetCellClass(cell: WorksheetCell): string {
  if (cell.awarded) {
    return "oas-worksheet-cell-awarded";
  }
  if (cell.answered) {
    return "oas-worksheet-cell-answered";
  }
  return "oas-worksheet-cell-empty";
}

/**
 * Formats a worksheet cell's date for display. buildWorksheetPages deliberately passes dates
 * through unformatted (ISO-ish, or a raw passthrough string when Terrain's own date didn't parse —
 * see PLAN_STAGE_1.md "Cell dates") so formatting is this component's job, not the service's.
 *
 * `DD/MM/YY` matches the xlsx reference's own shorter date column (e.g. "02/11/24") — narrow
 * enough that many member columns still fit a page. A non-ISO passthrough string that moment
 * can't parse is returned as-is rather than throwing or blanking the cell: Terrain's own date is
 * better shown oddly than not shown at all.
 */
export function formatWorksheetDate(date: string | null): string {
  if (!date) {
    return "";
  }
  const parsed = moment(date, moment.ISO_8601, true);
  return parsed.isValid() ? parsed.format("DD/MM/YY") : date;
}

interface WorksheetPatrolSpan {
  patrolName: string;
  /** Number of member columns this patrol's label spans, for the header's colspan. */
  columnCount: number;
}

/** One member column's patrol-boundary state, for the border treatment — see patrolBorderClassesForPage's comment. */
interface PatrolBorderClasses {
  /** This column is the first in its patrol group (gets a LEFT border). */
  start: boolean;
  /** This column is the last in its patrol group (gets a RIGHT border). */
  end: boolean;
}

const NO_PATROL_BORDER: PatrolBorderClasses = { start: false, end: false };

/**
 * TEMPORARY DEV AID — lets a large unit's layout be previewed on screen without a real large
 * Terrain unit. Read a small integer from this localStorage key in DevTools to duplicate every
 * real member that many extra times (e.g. 3 real members × 10 → 33 total):
 *
 *   localStorage.setItem("summit.oasWorksheetsVue.devDuplicateMembers", "10")
 *
 * Remove it again with `localStorage.removeItem(...)`, or just leave it at 0/absent — the default,
 * which passes `items` through unchanged. Not surfaced as a UI control anywhere on purpose: this
 * is a debugging aid for checking small-vs-large layout side by side, not a feature.
 *
 * DELETE THIS WHOLE BLOCK (the constant, `readDevDuplicateCount`, `duplicateMembersForDevPreview`,
 * and the `itemsForDisplay` line inside `pageSet` below) once it's no longer needed.
 */
export const DEV_DUPLICATE_MEMBERS_STORAGE_KEY = "summit.oasWorksheetsVue.devDuplicateMembers";

/** Exported for direct testing — see the DEV_DUPLICATE_MEMBERS_STORAGE_KEY comment above. */
export function readDevDuplicateCount(): number {
  try {
    const raw = window.localStorage.getItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * Clones every row `duplicateCount` extra times, each clone getting a distinct synthesized
 * `memberId`/`memberName` so buildWorksheetPages treats each copy as its own member — everything
 * else (patrol, statement, answered/awarded/date) stays identical to the row it was copied from,
 * which is enough to exercise column/row count without needing realistic synthetic data.
 */
export function duplicateMembersForDevPreview(items: OASProgressionRow[], duplicateCount: number): OASProgressionRow[] {
  if (duplicateCount <= 0) {
    return items;
  }
  const copies: OASProgressionRow[] = [];
  for (let i = 1; i <= duplicateCount; i++) {
    items.forEach((row) => {
      copies.push({ ...row, memberId: `${row.memberId}-dev${i}`, memberName: `${row.memberName} (dev ${i})` });
    });
  }
  return [...items, ...copies];
}

/**
 * One Layout B ("members as rows") page BATCH, plus the per-page computed values its template
 * needs — bundled the same way Layout A's ColumnsPageView already is. `columnWidthPx` is a fixed
 * constant per surface (screen/print), not computed per page, since I-Statement columns wrap at a
 * fixed width instead of shrinking a shared font to fit every column on one page.
 * `memberNameColumnWidthPx` IS computed per page (the longest member name on that ORIGINAL,
 * unsplit page, measured once and applied to every one of its batches — requested live: never wrap/
 * truncate/ellipsise a name, and keep split tables the same width as each other).
 */
interface TransposedPageView {
  page: TransposedWorksheetPage;
  columnWidthPx: number;
  memberNameColumnWidthPx: number;
  /** This batch's 0-based start index within its ORIGINAL, unsplit page's full column list — see ColumnsPageView.memberOffset's own comment for why print needs this when re-splitting an already screen-split table. 0 when the page wasn't split by the screen. */
  statementOffset: number;
  /** The ORIGINAL, unsplit page's total I-Statement column count — see statementOffset's own comment. */
  originalColumnCount: number;
}

/**
 * One Layout A ("members as columns") page, plus its own per-page statement/member column widths —
 * see computeColumnsLayoutMetrics's own comment for why these vary PER PAGE rather than being one
 * fixed CSS rule: a page with few members gets a relaxed I-Statement width and wide member columns
 * (filling the available width); a page at/near the splitting threshold gets the tight ~50-char
 * wrap width instead, same as every page rendered before this adaptive-width change.
 */
interface ColumnsPageView {
  page: WorksheetPage;
  statementWidthPx: number;
  memberColumnWidthPx: number;
  /** This batch's 0-based start index within its ORIGINAL, unsplit page's full member list — see splitTableColumnsForPrint's own comment for why print needs this (re-splitting an already screen-split table must number its own sub-batches against the true original total, not just the screen batch's own local size). 0 when the page wasn't split by the screen. */
  memberOffset: number;
  /** The ORIGINAL, unsplit page's total member count — see memberOffset's own comment. */
  originalMemberCount: number;
}

/**
 * Re-splits one live Layout A `<table>` for print into one or more print-sized tables, each with at
 * most `maxColumns` member columns, sized to print's own metrics — NOT just a re-style of whatever
 * batch the SCREEN already split into.
 *
 * This is the fix for a real bug reported live: a wide monitor lets the screen fit far more member
 * columns per sheet (e.g. 29) than an A4 sheet ever can (e.g. 9) — the previous version only
 * rewrote each already-screen-sized table's inline widths for print, which left 29 columns squeezed
 * onto one A4 sheet (most clipped off the printable area) instead of actually splitting that sheet
 * further. Printing must always re-derive its OWN column batches from print's fixed
 * PRINT_USABLE_WIDTH_PX budget, independently of whatever the screen's measured width allowed.
 *
 * Re-slicing happens at the DOM level (not by rebuilding HTML from WorksheetPage data again) so
 * Stage 3's exact rendering — patrol tints, cell state classes, already-resolved display names —
 * is reproduced faithfully from the live DOM rather than re-derived a second time with its own
 * chance to drift (same reasoning printWorksheets.ts's own top comment gives for cloning outerHTML
 * at all). Column cells (member headers/body cells) are simply sliced by index; the optional
 * patrol-header row's `colspan`s are recomputed against each new column range, since a patrol span
 * can straddle a print-batch boundary in a way it never did at the screen's own (wider) batch size.
 */
export function splitTableColumnsForPrint(table: HTMLTableElement, maxColumns: number): HTMLTableElement[] {
  const headerRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("thead tr"));
  const memberHeaderRow = headerRows[headerRows.length - 1];
  const patrolHeaderRow = headerRows.length > 1 ? headerRows[0] : null;
  const bodyRows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr"));

  // Member header <th>s are every child of the title row after its own 2 fixed leading cells
  // (group-band-header-placeholder + title, both colspan="2" on ONE <th> — see the template).
  const memberCount = memberHeaderRow.children.length - 1;
  const metrics = computeColumnsLayoutMetrics(PRINT_USABLE_WIDTH_PX, GROUP_BAND_COLUMN_WIDTH_PRINT_PX, Math.min(memberCount, Math.max(maxColumns, 1)), STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);

  const batchRanges: Array<[number, number]> = [];
  if (memberCount <= maxColumns || maxColumns <= 0) {
    batchRanges.push([0, memberCount]);
  } else {
    const batchCount = Math.ceil(memberCount / maxColumns);
    const evenBatchSize = Math.ceil(memberCount / batchCount);
    for (let i = 0; i < batchCount; i++) {
      batchRanges.push([i * evenBatchSize, Math.min((i + 1) * evenBatchSize, memberCount)]);
    }
  }

  // This table may ALREADY be one of several screen-split batches of a larger original page (e.g.
  // screen fit 29 of 33 members on "sheet 1"; print's own, smaller budget re-splits that 29 further
  // still) — the member-offset/-total data attributes (set in the template from columnsLayoutPages'
  // own memberOffset/originalMemberCount) carry the TRUE position within the original, unsplit page,
  // so renumbering here reads "33", not this table's own local "29". The title text itself is NOT
  // parsed for this (a screen-split title like "...(members 1-29 of 33)" is a human-facing label,
  // not a data source — parsing it back would also double up the suffix on re-split).
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

/** Slices a header `<tr>`'s member-column cells to `[start, end)`, keeping its leading fixed cell(s) untouched. `hasColspans` recomputes a patrol-span row's colspans against the new range (clipping/dropping spans that fall outside it); the plain title row's member `<th>`s have no colspan to recompute, only to slice. */
function sliceHeaderRowColumns(row: HTMLTableRowElement, start: number, end: number, hasColspans: boolean): HTMLTableRowElement {
  const clone = row.cloneNode(false) as HTMLTableRowElement;
  const cells = Array.from(row.children) as HTMLTableCellElement[];
  const leadingCell = cells[0].cloneNode(true) as HTMLTableCellElement;
  clone.appendChild(leadingCell);

  if (!hasColspans) {
    cells.slice(1 + start, 1 + end).forEach((cell) => clone.appendChild(cell.cloneNode(true)));
    return clone;
  }

  // Walk the patrol spans accumulating their column ranges, keeping only the portion of each span
  // that overlaps [start, end) and recomputing its colspan to that overlap's size.
  let columnIndex = 0;
  cells.slice(1).forEach((cell) => {
    const span = cell.colSpan || 1;
    const spanStart = columnIndex;
    const spanEnd = columnIndex + span;
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

/** Slices a body `<tr>`'s member-column `<td>`s to `[start, end)`. The optional rowspan group-band `<td>` (only present on a group's first row) and the statement `<td>` are always kept as-is — only member cells are sliced by index. */
function sliceBodyRowColumns(row: HTMLTableRowElement, start: number, end: number): HTMLTableRowElement {
  const clone = row.cloneNode(false) as HTMLTableRowElement;
  const cells = Array.from(row.children) as HTMLTableCellElement[];
  const hasGroupBand = cells[0].classList.contains("oas-worksheet-group-band");
  const fixedCount = hasGroupBand ? 2 : 1;

  cells.slice(0, fixedCount).forEach((cell) => clone.appendChild(cell.cloneNode(true)));
  cells.slice(fixedCount + start, fixedCount + end).forEach((cell) => clone.appendChild(cell.cloneNode(true)));
  return clone;
}

/** Overwrites a print-batched table's own `.oas-worksheet-statement`/`.oas-worksheet-cell` inline widths to print's metrics — mutates the batch in place (it's a fresh clone built by splitTableColumnsForPrint, never the live on-screen table). */
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
 * Layout B's print-splitting — the column-axis mirror of splitTableColumnsForPrint, but splitting
 * I-Statement COLUMNS (this layout's bounded axis) instead of member columns, while every member
 * ROW is kept in full on every resulting table (rows are this layout's unbounded axis — never
 * split). Needed for the same reason Layout A's print splitter is: print's own fixed (now portrait)
 * width budget rarely matches whatever the screen's measured width allowed, so print must re-derive
 * its own column batches rather than just re-style whatever the screen rendered.
 *
 * DOM shape (see OASWorksheetsVue.vue's rows template): `<thead>` has a group-span row (leading
 * `<th class="oas-worksheet-member-name-header">` + one `<th>` per Plan/Do/Review/Verify group, with
 * colspans) and a statement-header row (leading "Member" `<th>` + one `<th>` per I-Statement
 * column). `<tbody>` has optional full-width patrol-divider `<tr>`s (kept as-is on every batch — they
 * don't have per-column cells to slice) and ordinary rows (leading `<td class="oas-worksheet-
 * member-name-cell">` + one `<td>` per column).
 *
 * The member-name column's own width is MEASURED here from the live table's own member names
 * (requested live: never wrap/truncate/ellipsise a name) — read from the DOM rather than passed in,
 * since how many I-Statement columns fit per print sheet depends on it (a wider name column leaves
 * less room for I-Statement columns), the same chicken-and-egg each print surface resolves by
 * measuring its own real content rather than assuming a caller-supplied number.
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

  const batchRanges: Array<[number, number]> = [];
  if (columnCount <= maxColumns || maxColumns <= 0) {
    batchRanges.push([0, columnCount]);
  } else {
    const batchCount = Math.ceil(columnCount / maxColumns);
    const evenBatchSize = Math.ceil(columnCount / batchCount);
    for (let i = 0; i < batchCount; i++) {
      batchRanges.push([i * evenBatchSize, Math.min((i + 1) * evenBatchSize, columnCount)]);
    }
  }

  // Same reasoning as splitTableColumnsForPrint's own offset/total attributes: this table may
  // already be one of several screen-split column batches of a larger original page, so renumbering
  // must read against the TRUE original column total, not this table's own local count.
  const globalOffset = Number(table.dataset.oasWorksheetStatementOffset ?? "0");
  const globalTotal = Number(table.dataset.oasWorksheetStatementTotal ?? columnCount);
  // The page TITLE lives on the group-span row's leading <th> — the statement-header row's own
  // leading <th> shares the same .oas-worksheet-member-name-header class but holds the literal text
  // "Member" (see the .vue template), so this must specifically target the FIRST row's cell.
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

    // The screen's own inline column width (view.columnWidthPx, TRANSPOSED_COLUMN_WIDTH_SCREEN_PX)
    // carries over via cloneNode — overwrite it with print's own fixed width, same reasoning as
    // Layout A's applyColumnsLayoutPrintWidths: screen and print are different fixed surfaces here,
    // not one width shared between them. The member-name column width, by contrast, is the SAME
    // measured value on both surfaces here (columnWidthPx is the caller's own, per-surface fixed
    // value) — overwritten too, since the screen's own measured width was taken at the screen's
    // font size, not print's.
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

/** Slices a Layout B body `<tr>`'s I-Statement column `<td>`s to `[start, end)`, keeping the leading member-name `<td>` untouched. Patrol-divider rows are handled separately by the caller (they have one full-width colspan cell, nothing to slice). */
function sliceRowsBodyRowColumns(row: HTMLTableRowElement, start: number, end: number): HTMLTableRowElement {
  const clone = row.cloneNode(false) as HTMLTableRowElement;
  const cells = Array.from(row.children) as HTMLTableCellElement[];
  clone.appendChild(cells[0].cloneNode(true));
  cells.slice(1 + start, 1 + end).forEach((cell) => clone.appendChild(cell.cloneNode(true)));
  return clone;
}

/**
 * Worksheets view: one printable table per Skill x Stream x Stage, for manual checkoff during an
 * activity. See .claude/OASWorksheets/PLAN_STAGE_3.md for the original design, PLAN_STAGE_1.md for
 * the data layer, and PLAN_STAGE_5_LARGE_UNITS.md for the two-layout (membersAsColumns/
 * membersAsRows) split this file now implements — added after a live print test of the original
 * single layout silently clipped most of a 40-member unit's columns off the printed page.
 *
 * Owns no filter state of its own — receives `filters` (the whole page's filter object, like its
 * heat-map sibling) and reads only its own `worksheet*` keys from it, emitting `update:filters`/
 * `reset` the same way OASProgressionFiltersVue's consumer does.
 */
export default defineComponent({
  name: "OASWorksheetsVue",
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
  },
  data() {
    return {
      /**
       * Layout A's measured available width, in CSS px — unlike print (a fixed physical page size,
       * PRINT_USABLE_WIDTH_PX), the screen has no fixed width to calculate against; it can only be
       * read off the live DOM. Tracked reactively via a ResizeObserver (see mounted/beforeDestroy
       * below) so resizing the browser window re-flows member-column widths without a reload. Starts
       * at 0 (nothing measured yet, pre-mount) — columnsLayoutPages falls back to
       * PRINT_USABLE_WIDTH_PX for that one pre-mount render rather than using 0 directly (see its
       * own comment for why 0 can't be fed straight into the fitting calculation).
       */
      screenAvailableWidthPx: 0,
      /** The ResizeObserver instance itself — see mounted()/beforeDestroy() below. Not templated off directly (nothing reads it reactively, only the width it writes into screenAvailableWidthPx above), kept here only because a plain instance property isn't otherwise declarable on a defineComponent instance. */
      resizeObserver: null as ResizeObserver | null,
    };
  },
  computed: {
    pageSet(): WorksheetPageSet {
      // TEMPORARY DEV AID — see DEV_DUPLICATE_MEMBERS_STORAGE_KEY's own comment above. A no-op
      // (passes `this.items` through unchanged) unless the dev flag is set. Inlined here directly
      // rather than as its own computed so existing tests calling `computed.pageSet.call(context)`
      // don't need a second computed-on-computed value pre-resolved onto their fixture context.
      const itemsForDisplay = duplicateMembersForDevPreview(this.items, readDevDuplicateCount());
      return buildWorksheetPages(itemsForDisplay, {
        visibleSkills: this.filters.worksheetVisibleSkills,
        stageRange: this.filters.worksheetStageRange,
        selectedPatrols: [],
        memberFilter: "",
        hideLastName: this.filters.worksheetHideLastName,
        useCodenames: this.filters.worksheetUseCodenames,
        breakByPatrol: this.filters.worksheetBreakByPatrol,
        hideCompleted: this.filters.worksheetHideCompleted,
        sortBy: "firstName",
      });
    },
    isMembersAsRows(): boolean {
      return this.filters.worksheetLayout === "membersAsRows";
    },
    /**
     * Layout A's actual render list: pageSet.pages split into column batches wherever a page has
     * more members fit at the screen's own available width — see PLAN_STAGE_5_LARGE_UNITS.md §3 for
     * the original splitting design, and worksheetPrintPageSize.ts's maxFittingMemberColumns/
     * computeColumnsLayoutMetrics for why this is now adaptive rather than one fixed constant
     * (requested live: member columns should fill the available width, I-Statement should only wrap
     * once splitting is actually needed).
     *
     * Before the ResizeObserver's first measurement, `screenAvailableWidthPx` is 0 — rather than
     * feed that straight into maxFittingMemberColumns (0 or negative there means "don't split at
     * all", per splitPageIntoColumnBatches's own `maxColumns <= 0` guard — the OPPOSITE of what's
     * wanted for an unmeasured width), fall back to print's own PRINT_USABLE_WIDTH_PX for that one
     * pre-mount render. That's a real, sensible page width (not a magic sentinel), so the very first
     * render already splits/sizes sensibly rather than rendering one giant unsplit page for a frame;
     * the instant the observer fires its first real measurement, this recomputes against the actual
     * viewport.
     *
     * A page within the limit comes back as a single-element array (unchanged, by reference) from
     * splitPageIntoColumnBatches.
     *
     * Every batch of the SAME split page shares one set of widths, computed from that page's own
     * largest batch (its first — splitPageIntoColumnBatches now sizes batches evenly, so the first
     * is always the largest or tied for it) — NOT recomputed per batch from that batch's own,
     * smaller member count. Reported live: with per-batch metrics, a 33-member page split into two
     * batches got visibly different column widths on each sheet (the smaller batch had more slack,
     * so its columns stretched wider), so the two tables no longer lined up under each other even
     * though they're the same logical page. Using one page-wide width for every batch keeps them
     * visually identical, matching the request that split tables "line up under each other."
     */
    columnsLayoutPages(): ColumnsPageView[] {
      const usableWidthPx = this.screenAvailableWidthPx > 0 ? this.screenAvailableWidthPx : PRINT_USABLE_WIDTH_PX;
      const maxColumns = maxFittingMemberColumns(usableWidthPx, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, STATEMENT_COLUMN_WRAP_WIDTH_SCREEN_PX);
      return this.pageSet.pages.flatMap((page) => {
        const batches = splitPageIntoColumnBatches(page, maxColumns);
        const metrics = computeColumnsLayoutMetrics(usableWidthPx, GROUP_BAND_COLUMN_WIDTH_SCREEN_PX, batches[0].members.length, STATEMENT_COLUMN_RELAXED_MAX_WIDTH_PX);
        // Each batch's own start offset within `page`'s full member list — splitPageIntoColumnBatches
        // sizes every batch evenly (batches[0].members.length each, the last one possibly shorter),
        // so the Nth batch always starts at N x that size. Needed so printCurrentPages() can
        // re-split an already screen-split table for print and still number its own sub-batches
        // against the TRUE original total (see splitTableColumnsForPrint's own comment).
        const batchSize = batches[0].members.length;
        return batches.map((batch, batchIndex) => ({
          page: batch,
          statementWidthPx: metrics.statementWidthPx,
          memberColumnWidthPx: metrics.memberColumnWidthPx,
          memberOffset: batchIndex * batchSize,
          originalMemberCount: page.members.length,
        }));
      });
    },
    /**
     * Layout B's render list — every page in the set, transposed and then split into column
     * batches wherever it has more I-Statement columns than fit at a fixed, word-wrapped column
     * width (TRANSPOSED_COLUMN_WIDTH_SCREEN_PX) — rows (members) are NEVER split, they repeat
     * in full on every batch, since rows are unbounded and that's this layout's whole point (see
     * PLAN_STAGE_5_LARGE_UNITS.md §1). This replaces the old "shrink one shared font size to fit
     * every column on one page, indefinitely" behaviour (fitRotatedHeaderFont.ts) — requested live:
     * wrap at a fixed, never-shrinking font size, split onto extra sheets instead.
     *
     * Uses maxFittingTransposedColumns, NOT maxFittingMemberColumns — the latter always divides by
     * MEMBER_COLUMN_MIN_WIDTH_PX (Layout A's own, much narrower, member-column width), which
     * silently overcounted how many wider I-Statement columns fit and was the direct cause of a
     * reported bug: columns rendered far wider than the screen with no splitting kicking in.
     *
     * The member-name column's own width is MEASURED per page (memberNameColumnWidthPx — the
     * longest member name on that page, in full, never wrapped/truncated/ellipsised) from the
     * ORIGINAL, unsplit page's member list, computed ONCE and applied to every one of that page's
     * batches — same discipline as columnsLayoutPages' own per-page metrics, so split tables render
     * at the same width as each other rather than drifting batch to batch.
     *
     * Same pre-mount fallback as columnsLayoutPages: screenAvailableWidthPx is 0 before the
     * ResizeObserver's first measurement, which would make maxFittingTransposedColumns go <= 0
     * (="don't split" per splitTransposedPageIntoColumnBatches's own guard) — falls back to
     * PRINT_USABLE_WIDTH_PX for that one pre-mount render instead.
     */
    rowsLayoutPages(): TransposedPageView[] {
      const usableWidthPx = this.screenAvailableWidthPx > 0 ? this.screenAvailableWidthPx : PRINT_USABLE_WIDTH_PX;
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
    /**
     * Whether the current layout's own splitting actually produced more sheets than there are
     * Skill/Stage pages — drives an informational (not alarming) note, replacing Stage 4's
     * "squeezed/clipped" warning now that nothing is actually lost any more (PLAN_STAGE_5_LARGE_
     * UNITS.md §3's "reword it" instruction). Both layouts can split now — Layout A on the member
     * axis, Layout B on the I-Statement axis (see rowsLayoutPages's own comment) — so this checks
     * whichever one is currently showing rather than assuming only Layout A ever splits.
     */
    hasSplitPages(): boolean {
      const renderedBatchCount = this.isMembersAsRows ? this.rowsLayoutPages.length : this.columnsLayoutPages.length;
      return renderedBatchCount > this.pageSet.pages.length;
    },
  },
  methods: {
    worksheetCellClass,
    formatWorksheetDate,
    /**
     * Member columns are ordered by patrol with a spanning label row above them, rather than a
     * dividing row — a patrol is a set of members, and members are COLUMNS on a worksheet (the
     * opposite axis from the heat map, where members are rows and a dividing row makes sense).
     * See PLAN_STAGE_3.md's "Break by patrol" section. Layout A only — see patrolRowSpansForPage
     * for Layout B's row-based equivalent.
     *
     * Returns one span per patrol group IN THE SAME ORDER AS `page.members`, so the header row can
     * walk both arrays in lockstep rather than re-deriving grouping per page.
     */
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
    /**
     * One {start, end} pair per member column, index-aligned with `page.members` — expands
     * patrolSpansForPage()'s spans back into per-column boundary flags. A border around each
     * patrol's own block (left edge of its first column, right edge of its last) marks the
     * boundary without touching any cell's own background — see the
     * `.oas-worksheet-patrol-group-start`/`-end` CSS rules for the actual treatment.
     *
     * Every column gets a {false, false} entry when "break by patrol" is off (array still
     * index-aligned with `page.members`, just inert), so the template never needs to branch on
     * whether patrol grouping is active — only on `patrolSpansForPage(page).length > 0` for the
     * header row, same as before.
     */
    patrolBorderClassesForPage(page: WorksheetPage): PatrolBorderClasses[] {
      const spans = this.patrolSpansForPage(page);
      if (spans.length === 0) {
        return page.members.map(() => NO_PATROL_BORDER);
      }
      return spans.flatMap((span) => Array.from({ length: span.columnCount }, (_, i) => ({ start: i === 0, end: i === span.columnCount - 1 })));
    },
    /**
     * Layout B's patrol grouping: a labelled divider ROW before each patrol's first member row —
     * the same convention the heat map itself uses (members are rows there too), rather than
     * Layout A's column-spanning header. Returns the patrol name to show above `rowIndex`'s row,
     * or null when no divider belongs there (every row when "break by patrol" is off, and every
     * row except a patrol's first when it's on).
     */
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
    /**
     * Layout B's Plan/Do/Review/Verify GROUP boundary, as a per-column border — the column-axis
     * mirror of patrolBorderClassesForPage above, but keyed off `page.groupSpans` instead of patrol
     * spans. One {start, end} pair per I-Statement column, index-aligned with `page.columns`.
     *
     * Requested live: extend the existing heavier-border treatment "all the way down" each group's
     * block of columns (header AND every body row), not just the one hardcoded border Stage 5 put
     * on the group-span header cell itself. Reuses the SAME CSS classes
     * (`oas-worksheet-patrol-group-start`/`-end`) already styled and already mirrored in
     * printWorksheets.ts — only the per-column computation is new, matching how Layout A already
     * computes its own per-member-column patrol borders instead of a single hardcoded header border.
     */
    groupBorderClassesForPage(page: TransposedWorksheetPage): PatrolBorderClasses[] {
      if (page.groupSpans.length === 0) {
        return page.columns.map(() => NO_PATROL_BORDER);
      }
      const classes: PatrolBorderClasses[] = page.columns.map(() => NO_PATROL_BORDER);
      page.groupSpans.forEach((span) => {
        for (let i = 0; i < span.columnCount; i++) {
          classes[span.startColumnIndex + i] = { start: i === 0, end: i === span.columnCount - 1 };
        }
      });
      return classes;
    },
    /**
     * Collects the live, already-rendered <table class="oas-worksheet-page"> elements (whichever
     * layout is currently showing — both layouts render that same class, see the templates) and
     * hands them to printWorksheets() — asked for rather than reached into via a method like
     * OASHeatMapVue.getExportTable(), since the parent only needs "print what's on screen now",
     * not a reference to this component's internal DOM structure. Returns false when the popup was
     * blocked, so the caller can tell the user rather than nothing visibly happening.
     *
     * Both layouts' screen tables are batched/sized against the SCREEN's own measured width (a wide
     * monitor can fit far more columns per sheet than a physical page ever can) — printWorksheets()
     * clones outerHTML verbatim (see that file's own top comment for why: no cascade fight, real
     * text, a real repeating thead), so printing the live tables unchanged would carry the SCREEN's
     * batch sizes onto a physical sheet with a different, fixed, much smaller budget — reported live
     * (for Layout A) as most member columns being clipped off the printed page.
     * `splitTableColumnsForPrint`/`splitRowsTableColumnsForPrint` re-split (and, for Layout A,
     * re-size) each live table into print's OWN, independently-computed column batches before
     * handing off, leaving the live screen DOM (and its on-screen rendering) completely untouched.
     *
     * Both layouts print landscape (requested live — portrait made Layout B's print output too
     * small/cramped; Layout A has always printed landscape). Orientation is still passed through
     * printWorksheets() as an explicit parameter rather than hardcoded there, so a layout-specific
     * orientation remains straightforward to reintroduce later if ever wanted again.
     */
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
  /**
   * Measures Layout A's actual available width so columnsLayoutPages can adapt member-column widths
   * to it (see screenAvailableWidthPx's own comment in data() above) — a ResizeObserver on the
   * component's own root element, since that's the ancestor `.oas-worksheet-page` tables actually
   * lay out against (the root has no side padding of its own — see the .vue file's
   * `.oas-worksheet-scroll` rule — so its width is the real available width, not an approximation).
   */
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
