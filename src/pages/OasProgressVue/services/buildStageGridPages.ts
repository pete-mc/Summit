import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import { filterMembersByPatrol, groupMembersByPatrol, sliceStagesToVisible } from "@/pages/OasProgress/services/filterHeatMapSections";
import type { PatrolGroupOf } from "@/pages/OasProgress/services/filterHeatMapSections";
import { getMemberDisplayName } from "@/pages/OasProgress/services/getMemberDisplayName";
import type { NameFormat } from "@/pages/OasProgress/services/getMemberDisplayName";
import { skillTitle, formatStream } from "@/pages/OasProgressVue/components/OASHeatMapVue";
import { skillStreamKey } from "./skillStreams";

export interface StageGridMember {
  memberId: string;
  displayName: string;
  /** Sort on these, never on displayName (it may be a codename). */
  firstName: string;
  lastName: string;
  patrolName: string | null;
}

export interface StageGridCell {
  /** `YYYY-MM-DD`, a raw Terrain string that didn't parse, or null. */
  date: string | null;
  answered: boolean;
  awarded: boolean;
  /** Not in the template version this member started on, so no tick box is shown. */
  notApplicable?: true;
}

export interface StageGridRow {
  inputId: string;
  iStatement: string;
  cells: StageGridCell[];
}

export interface StageGridGroup {
  title: string;
  rows: StageGridRow[];
}

export type StageGridPatrolGroup = PatrolGroupOf<StageGridMember>;

/** One Skill × Stream × Stage. */
export interface StageGridPage {
  key: string;
  /** Terrain's `row.stream`. */
  skill: string;
  /** Terrain's `row.branch`; equals `skill` on the trunk. */
  stream: string;
  stage: number;
  title: string;
  groups: StageGridGroup[];
  /** Gotcha: always read columns from here, not StageGridPageSet.members. "Hide completed" can narrow a page, and its cells only line up with this list. */
  members: StageGridMember[];
}

export interface StageGridPageSet {
  members: StageGridMember[];
  patrolGroups: StageGridPatrolGroup[] | null;
  pages: StageGridPage[];
}

export interface BuildStageGridPagesOptions {
  /** From skillStreamKey(). */
  skillStream: string;
  visibleStages: number[];
  selectedPatrols: string[];
  memberFilter: string;
  nameFormat: NameFormat;
  breakByPatrol: boolean;
  /** Keyed on `awarded`, not `answered`. */
  hideCompleted: boolean;
  sortBy: "firstName" | "lastName";
}

function sortStageGridMembers(members: StageGridMember[], sortBy: "firstName" | "lastName"): StageGridMember[] {
  const sorted = members.slice();
  if (sortBy === "lastName") {
    sorted.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
  } else {
    sorted.sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName));
  }
  return sorted;
}

/** Gotcha: with "break by patrol", members must be re-ordered by patrol, or the column order won't match the patrol-span header. */
function orderMembersByPatrol(members: StageGridMember[]): StageGridMember[] {
  return groupMembersByPatrol(members).flatMap((group) => group.members);
}

/** Columns are decided once for the whole set, not per page. */
function buildMemberList(rows: OASProgressRow[], options: BuildStageGridPagesOptions): StageGridMember[] {
  const seen: string[] = [];
  const byId = new Map<string, StageGridMember>();
  rows.forEach((row) => {
    if (byId.has(row.memberId)) {
      return;
    }
    seen.push(row.memberId);
    byId.set(row.memberId, {
      memberId: row.memberId,
      displayName: getMemberDisplayName(row.firstName, row.lastName, row.memberId, options.nameFormat),
      firstName: row.firstName,
      lastName: row.lastName,
      patrolName: row.patrolName,
    });
  });

  const needle = options.memberFilter.trim().toLowerCase();
  const nameFiltered = seen.map((id) => byId.get(id) as StageGridMember).filter((m) => !needle || m.displayName.toLowerCase().includes(needle));

  // Gotcha: unlike filterMembersByPatrol (empty = everyone, which the React page relies on), an empty selection here shows nobody.
  const patrolFiltered = options.selectedPatrols.length === 0 ? [] : filterMembersByPatrol(nameFiltered, options.selectedPatrols);
  const sorted = sortStageGridMembers(patrolFiltered, options.sortBy);

  return options.breakByPatrol ? orderMembersByPatrol(sorted) : sorted;
}

function pageTitle(skill: string, stream: string, stage: number): string {
  const label = stream === skill ? skillTitle(skill) : formatStream(stream);
  return `Stage ${stage} - ${label}`;
}

interface PageAccumulator {
  key: string;
  skill: string;
  stream: string;
  stage: number;
  groupOrder: string[];
  groups: Map<string, Map<string, StageGridRow>>;
  /** Used to mark the cells a member didn't fill as not-applicable. */
  memberIndicesWithRows: Set<number>;
  filledCells: Set<string>;
}

/** Guards against `.every()` being vacuously true on an empty page. */
function isMemberCompleteOnPage(page: StageGridPage, memberIndex: number): boolean {
  const allRows = page.groups.flatMap((group) => group.rows);
  if (allRows.length === 0) {
    return false;
  }
  const applicableCells = allRows.map((row) => row.cells[memberIndex]).filter((cell) => !cell?.notApplicable);
  return applicableCells.length > 0 && applicableCells.every((cell) => cell?.awarded === true);
}

/** Gotcha: members and cells must be narrowed together so the indexes stay aligned. */
function applyHideCompletedToPage(page: StageGridPage, allMembers: StageGridMember[]): StageGridPage | null {
  const keepIndices: number[] = [];
  allMembers.forEach((_, index) => {
    if (!isMemberCompleteOnPage(page, index)) {
      keepIndices.push(index);
    }
  });

  if (keepIndices.length === allMembers.length) {
    return page;
  }
  if (keepIndices.length === 0) {
    return null;
  }

  return {
    ...page,
    members: keepIndices.map((i) => allMembers[i]),
    groups: page.groups.map((group) => ({
      title: group.title,
      rows: group.rows.map((row) => ({
        ...row,
        cells: keepIndices.map((i) => row.cells[i]),
      })),
    })),
  };
}

/** Pass the full unfiltered rows; all filtering happens here. */
export function buildStageGridPages(rows: OASProgressRow[], options: BuildStageGridPagesOptions): StageGridPageSet {
  const members = buildMemberList(rows, options);
  const memberIndexById = new Map(members.map((m, i) => [m.memberId, i]));

  const stages = sliceStagesToVisible(
    Array.from({ length: 9 }, (_, i) => i + 1),
    options.visibleStages,
  );
  const stageSet = new Set(stages);

  const filteredRows = rows.filter((row) => skillStreamKey(row.stream, row.branch) === options.skillStream && stageSet.has(row.stage) && memberIndexById.has(row.memberId));

  const pageAccumulators = new Map<string, PageAccumulator>();
  filteredRows.forEach((row) => {
    const pageKey = `${row.stream}::${row.branch}::${row.stage}`;
    let page = pageAccumulators.get(pageKey);
    if (!page) {
      page = { key: pageKey, skill: row.stream, stream: row.branch, stage: row.stage, groupOrder: [], groups: new Map(), memberIndicesWithRows: new Set(), filledCells: new Set() };
      pageAccumulators.set(pageKey, page);
    }

    let group = page.groups.get(row.inputGroup);
    if (!group) {
      group = new Map();
      page.groups.set(row.inputGroup, group);
      page.groupOrder.push(row.inputGroup);
    }

    let stageGridRow = group.get(row.inputId);
    if (!stageGridRow) {
      stageGridRow = { inputId: row.inputId, iStatement: row.iStatement, cells: members.map(() => ({ date: null, answered: false, awarded: false })) };
      group.set(row.inputId, stageGridRow);
    }

    const memberIndex = memberIndexById.get(row.memberId);
    if (memberIndex === undefined) {
      return;
    }
    stageGridRow.cells[memberIndex] = { date: row.date, answered: row.answered, awarded: row.awarded };
    page.memberIndicesWithRows.add(memberIndex);
    page.filledCells.add(`${row.inputId}#${memberIndex}`);
  });

  // Rows on the page but not this statement = a different template version (not-applicable). No rows at all = a plain blank column.
  pageAccumulators.forEach((page) => {
    page.groups.forEach((group) => {
      group.forEach((stageGridRow) => {
        page.memberIndicesWithRows.forEach((memberIndex) => {
          if (!page.filledCells.has(`${stageGridRow.inputId}#${memberIndex}`)) {
            stageGridRow.cells[memberIndex] = { date: null, answered: false, awarded: false, notApplicable: true };
          }
        });
      });
    });
  });

  const builtPages: StageGridPage[] = Array.from(pageAccumulators.values()).map((acc) => ({
    key: acc.key,
    skill: acc.skill,
    stream: acc.stream,
    stage: acc.stage,
    title: pageTitle(acc.skill, acc.stream, acc.stage),
    members,
    groups: acc.groupOrder.map((title) => ({ title, rows: Array.from(acc.groups.get(title)!.values()) })),
  }));

  const narrowedPages = options.hideCompleted ? builtPages.map((page) => applyHideCompletedToPage(page, members)).filter((page): page is StageGridPage => page !== null) : builtPages;

  narrowedPages.sort((a, b) => a.stage - b.stage);

  const patrolGroups: StageGridPatrolGroup[] | null = options.breakByPatrol ? groupMembersByPatrol(members) : null;

  return { members, patrolGroups, pages: narrowedPages };
}

/**
 * [start, end) index ranges of at most `maxPerBatch`. A max of 0 or less means "don't split".
 * Learning: batches are even (33 → 17 + 16, not 29 + 4), so every sheet of a split page has the same column widths.
 */
export function evenBatchRanges(itemCount: number, maxPerBatch: number): Array<[number, number]> {
  if (itemCount <= maxPerBatch || maxPerBatch <= 0) {
    return [[0, itemCount]];
  }
  const batchCount = Math.ceil(itemCount / maxPerBatch);
  const evenBatchSize = Math.ceil(itemCount / batchCount);
  return Array.from({ length: batchCount }, (_, i) => [i * evenBatchSize, Math.min((i + 1) * evenBatchSize, itemCount)] as [number, number]);
}

function packRuns(runLengths: number[], cap: number): number[] {
  const batchSizes: number[] = [];
  runLengths.forEach((length) => {
    const last = batchSizes.length - 1;
    if (last >= 0 && batchSizes[last] + length <= cap) batchSizes[last] += length;
    else batchSizes.push(length);
  });
  return batchSizes;
}

/**
 * Like evenBatchRanges, but never splits a run (a patrol, or a Plan / Do / Review group) unless it alone is wider
 * than a sheet. Uses the fewest sheets, then evens them out: runs of 10, 10, 2 with room for 20 give 10 + 12, not 20 + 2.
 */
export function runBatchRanges(runLengths: number[], maxPerBatch: number): Array<[number, number]> {
  const total = runLengths.reduce((sum, length) => sum + length, 0);
  if (total <= maxPerBatch || maxPerBatch <= 0) {
    return [[0, total]];
  }
  const pieces = runLengths.filter((length) => length > 0).flatMap((length) => evenBatchRanges(length, maxPerBatch).map(([start, end]) => end - start));
  const fewestBatches = packRuns(pieces, maxPerBatch).length;
  let cap = Math.max(Math.max.apply(null, pieces), Math.ceil(total / fewestBatches));
  while (packRuns(pieces, cap).length > fewestBatches) {
    cap++;
  }
  let start = 0;
  return packRuns(pieces, cap).map((size) => {
    const range: [number, number] = [start, start + size];
    start += size;
    return range;
  });
}

export function patrolRunLengths(members: Array<{ patrolName: string | null }>): number[] {
  const runs: number[] = [];
  members.forEach((member, index) => {
    if (index > 0 && member.patrolName === members[index - 1].patrolName) runs[runs.length - 1]++;
    else runs.push(1);
  });
  return runs;
}

/** Returns [page] unchanged when it already fits. Pass patrolRunLengths to keep patrols together. */
export function splitPageIntoColumnBatches(page: StageGridPage, maxColumns: number, runLengths: number[] = [page.members.length]): StageGridPage[] {
  const ranges = runBatchRanges(runLengths, maxColumns);
  if (ranges.length === 1) {
    return [page];
  }
  return ranges.map(([startIndex, endIndex], batchIndex) => ({
    ...page,
    key: `${page.key}::batch${batchIndex}`,
    title: `${page.title} (members ${startIndex + 1}-${endIndex} of ${page.members.length})`,
    members: page.members.slice(startIndex, endIndex),
    groups: page.groups.map((group) => ({
      title: group.title,
      rows: group.rows.map((row) => ({
        ...row,
        cells: row.cells.slice(startIndex, endIndex),
      })),
    })),
  }));
}

export interface TransposedStatementColumn {
  inputId: string;
  iStatement: string;
  inputGroup: string;
}

export interface TransposedStageGridRow {
  memberId: string;
  displayName: string;
  patrolName: string | null;
  cells: StageGridCell[];
}

export interface TransposedGroupSpan {
  title: string;
  startColumnIndex: number;
  columnCount: number;
}

/** Layout B (members as rows): a StageGridPage with the row and column axes swapped. */
export interface TransposedStageGridPage {
  key: string;
  skill: string;
  stream: string;
  stage: number;
  title: string;
  columns: TransposedStatementColumn[];
  groupSpans: TransposedGroupSpan[];
  rows: TransposedStageGridRow[];
}

export function transposeStageGridPage(page: StageGridPage): TransposedStageGridPage {
  const columns: TransposedStatementColumn[] = [];
  const groupSpans: TransposedGroupSpan[] = [];

  page.groups.forEach((group) => {
    if (group.rows.length === 0) {
      return;
    }
    groupSpans.push({ title: group.title, startColumnIndex: columns.length, columnCount: group.rows.length });
    group.rows.forEach((row) => {
      columns.push({ inputId: row.inputId, iStatement: row.iStatement, inputGroup: group.title });
    });
  });

  const rows: TransposedStageGridRow[] = page.members.map((member, memberIndex) => {
    const cells: StageGridCell[] = [];
    page.groups.forEach((group) => {
      group.rows.forEach((row) => {
        cells.push(row.cells[memberIndex]);
      });
    });
    return { memberId: member.memberId, displayName: member.displayName, patrolName: member.patrolName, cells };
  });

  return {
    key: page.key,
    skill: page.skill,
    stream: page.stream,
    stage: page.stage,
    title: page.title,
    columns,
    groupSpans,
    rows,
  };
}

/** Splits I-Statement columns, keeping each Plan / Do / Review group together where it fits; every member row repeats on each batch. */
export function splitTransposedPageIntoColumnBatches(page: TransposedStageGridPage, maxColumns: number): TransposedStageGridPage[] {
  const ranges = runBatchRanges(
    page.groupSpans.map((span) => span.columnCount),
    maxColumns,
  );
  if (ranges.length === 1) {
    return [page];
  }
  return ranges.map(([startIndex, endIndex], batchIndex) => ({
    ...page,
    key: `${page.key}::batch${batchIndex}`,
    title: `${page.title} (statements ${startIndex + 1}-${endIndex} of ${page.columns.length})`,
    columns: page.columns.slice(startIndex, endIndex),
    groupSpans: clipGroupSpansToRange(page.groupSpans, startIndex, endIndex),
    rows: page.rows.map((row) => ({
      ...row,
      cells: row.cells.slice(startIndex, endIndex),
    })),
  }));
}

function clipGroupSpansToRange(spans: TransposedGroupSpan[], startIndex: number, endIndex: number): TransposedGroupSpan[] {
  return spans
    .map((span) => {
      const overlapStart = Math.max(span.startColumnIndex, startIndex);
      const overlapEnd = Math.min(span.startColumnIndex + span.columnCount, endIndex);
      if (overlapEnd <= overlapStart) {
        return null;
      }
      return { title: span.title, startColumnIndex: overlapStart - startIndex, columnCount: overlapEnd - overlapStart };
    })
    .filter((span): span is TransposedGroupSpan => span !== null);
}
