import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { OAS_SKILLS, filterMembersByPatrol, groupMembersByPatrol, sliceStagesToVisible } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { PatrolGroupOf } from "@/pages/OasProgression/services/filterHeatMapSections";
import { getMemberDisplayName } from "@/pages/OasProgression/services/getMemberDisplayName";
import type { NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";
import { skillTitle, formatStream } from "@/pages/OasProgressionVue/components/OASHeatMapVue";

/**
 * One member's column — same member, same order, on every page of a WorksheetPageSet (except
 * where "Hide completed" has narrowed an individual page — see WorksheetPage.members).
 */
export interface WorksheetMember {
  memberId: string;
  /** Already resolved through codenames / hide-last-name — the string to print. */
  displayName: string;
  /** Real, separate name fields (Terrain's own first_name/last_name) — used for sorting, never displayName, which may be a codename/initial and is never re-split. See .claude/OASProgression/NAME_RESOLUTION.md. */
  firstName: string;
  lastName: string;
  patrolName: string | null;
}

export interface WorksheetCell {
  /** Terrain's completion date as `YYYY-MM-DD`, or a raw passthrough string, or null if not started. */
  date: string | null;
  answered: boolean;
  awarded: boolean;
}

/** One I-Statement row, with one cell per member in `WorksheetPage.members` order. */
export interface WorksheetRow {
  inputId: string;
  iStatement: string;
  /** Same length and order as this row's own page's `members`. */
  cells: WorksheetCell[];
}

/** A Plan/Do/Review/Verify band. Only ever emitted when it has at least one row. */
export interface WorksheetGroup {
  /** "Plan" | "Do" | "Review" | "Verify", or whatever the template actually used. */
  title: string;
  rows: WorksheetRow[];
}

/** A member column set grouped by patrol, for the "break by patrol" display option. */
export type WorksheetPatrolGroup = PatrolGroupOf<WorksheetMember>;

/** One printed page: one Skill × Stream × Stage. */
export interface WorksheetPage {
  key: string;
  /** UI meaning: Terrain's `row.stream`, e.g. "bushwalking". */
  skill: string;
  /** UI meaning: Terrain's `row.branch`. Equals `skill` on the trunk. */
  stream: string;
  stage: number;
  /** "Stage 5 - Bushwalking", or "Stage 4 - Pioneering" for a named stream. */
  title: string;
  groups: WorksheetGroup[];
  /**
   * This page's own member columns, index-aligned with every `WorksheetRow.cells` on this page.
   * Identical to `WorksheetPageSet.members` by reference unless "Hide completed" has dropped
   * someone from this specific page (see buildWorksheetPages's "Hide completed" pass below).
   * Always read columns from here, never from `WorksheetPageSet.members` directly — a narrowed
   * page's cells are only correctly aligned against this list.
   */
  members: WorksheetMember[];
}

export interface WorksheetPageSet {
  /** The full column set before any per-page "Hide completed" narrowing. */
  members: WorksheetMember[];
  /** Present only when "break by patrol" is on; same members, grouped. Null otherwise. */
  patrolGroups: WorksheetPatrolGroup[] | null;
  pages: WorksheetPage[];
}

export interface BuildWorksheetPagesOptions {
  visibleSkills: string[];
  visibleStages: number[];
  selectedPatrols: string[];
  memberFilter: string;
  nameFormat: NameFormat;
  breakByPatrol: boolean;
  /** Drops a member's column from pages where they have completed that Skill/Stage (keyed on `awarded`, not `answered` — see the pass below). */
  hideCompleted: boolean;
  sortBy: "firstName" | "lastName";
}

function sortWorksheetMembers(members: WorksheetMember[], sortBy: "firstName" | "lastName"): WorksheetMember[] {
  const sorted = members.slice();
  if (sortBy === "lastName") {
    sorted.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
  } else {
    sorted.sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName));
  }
  return sorted;
}

/**
 * Flattens groupMembersByPatrol's grouping back into one ordered member list — patrol-alphabetical
 * (Unassigned last), each patrol's own members keeping the order they arrived in. This is what
 * makes "break by patrol" a genuine COLUMN order on a worksheet (members are columns here, the
 * opposite axis from the heat map, where a patrol grouping only needs a row label) — see
 * .claude/OASWorksheets/PLAN_STAGE_3.md's "Break by patrol" section. Without this, `members` would
 * stay name-sorted while `patrolGroups` presented a different order, and a page's rendered column
 * order would silently disagree with its own patrol-span header.
 */
function orderMembersByPatrol(members: WorksheetMember[]): WorksheetMember[] {
  return groupMembersByPatrol(members).flatMap((group) => group.members);
}

/** Builds the page's own full column set from the whole (unfiltered-by-skill-or-stage) row set — see step 1 in PLAN_STAGE_1.md §4: columns are decided once, not per page. */
function buildMemberList(rows: OASProgressionRow[], options: BuildWorksheetPagesOptions): WorksheetMember[] {
  const seen: string[] = [];
  const byId = new Map<string, WorksheetMember>();
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
  const nameFiltered = seen.map((id) => byId.get(id) as WorksheetMember).filter((m) => !needle || m.displayName.toLowerCase().includes(needle));

  // filterMembersByPatrol is generic over `{ patrolName }` (see its own comment), so a
  // WorksheetMember satisfies it directly — no reshaping into SectionMemberRow needed. Contrast
  // with sortMembers, which genuinely cannot be reused this way (PLAN_STAGE_1.md §2).
  //
  // Unlike filterMembersByPatrol's own shared "empty = show everyone" contract (kept unchanged
  // there, since the legacy React page also relies on it), this options.selectedPatrols behaves
  // like every other Worksheets filter: nothing selected means nothing shown. See
  // .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
  const patrolFiltered = options.selectedPatrols.length === 0 ? [] : filterMembersByPatrol(nameFiltered, options.selectedPatrols);
  const sorted = sortWorksheetMembers(patrolFiltered, options.sortBy);

  // When "break by patrol" is on, member COLUMNS are reordered by patrol (see
  // orderMembersByPatrol's comment) — the name sort above still decides order WITHIN each patrol.
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
  // Preserves first-seen (template) order — see PLAN_STAGE_1.md §4 step 5.
  groupOrder: string[];
  groups: Map<string, Map<string, WorksheetRow>>;
}

/**
 * A member has completed a page when every cell in every one of its rows is awarded — see
 * PLAN_STAGE_1.md §4a for why `awarded`, not `answered`, is the right signal. A page is only ever
 * built from at least one row (see the accumulation loop in buildWorksheetPages), so the `false`
 * fallback below is defensive only, guarding against `.every()`'s vacuous truth on an empty list
 * rather than a real case — an actually-empty page must never be treated as "everyone complete".
 */
function isMemberCompleteOnPage(page: WorksheetPage, memberIndex: number): boolean {
  const allRows = page.groups.flatMap((group) => group.rows);
  if (allRows.length === 0) {
    return false;
  }
  return allRows.every((row) => row.cells[memberIndex]?.awarded === true);
}

/** Narrows a single page's member columns and cells together, keeping both arrays aligned at every index — see PLAN_STAGE_1.md §4a, the trap this function exists to avoid. */
function applyHideCompletedToPage(page: WorksheetPage, allMembers: WorksheetMember[]): WorksheetPage | null {
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

/**
 * Builds the OAS Worksheets page set from already-loaded OASProgressionRow data — no fetching
 * here, see .claude/OASWorksheets/PLAN_STAGE_1.md §1. `rows` should be the full, unfiltered set
 * for the unit; all filtering (skills, stage range, member, patrol) happens inside.
 */
export function buildWorksheetPages(rows: OASProgressionRow[], options: BuildWorksheetPagesOptions): WorksheetPageSet {
  const members = buildMemberList(rows, options);
  const memberIndexById = new Map(members.map((m, i) => [m.memberId, i]));

  const visibleSkillSet = new Set(options.visibleSkills);
  const stages = sliceStagesToVisible(
    Array.from({ length: 9 }, (_, i) => i + 1),
    options.visibleStages,
  );
  const stageSet = new Set(stages);

  const filteredRows = rows.filter((row) => visibleSkillSet.has(row.stream) && stageSet.has(row.stage) && memberIndexById.has(row.memberId));

  const pageAccumulators = new Map<string, PageAccumulator>();
  filteredRows.forEach((row) => {
    const pageKey = `${row.stream}::${row.branch}::${row.stage}`;
    let page = pageAccumulators.get(pageKey);
    if (!page) {
      page = { key: pageKey, skill: row.stream, stream: row.branch, stage: row.stage, groupOrder: [], groups: new Map() };
      pageAccumulators.set(pageKey, page);
    }

    let group = page.groups.get(row.inputGroup);
    if (!group) {
      group = new Map();
      page.groups.set(row.inputGroup, group);
      page.groupOrder.push(row.inputGroup);
    }

    let worksheetRow = group.get(row.inputId);
    if (!worksheetRow) {
      worksheetRow = { inputId: row.inputId, iStatement: row.iStatement, cells: members.map(() => ({ date: null, answered: false, awarded: false })) };
      group.set(row.inputId, worksheetRow);
    }

    const memberIndex = memberIndexById.get(row.memberId);
    if (memberIndex === undefined) {
      return;
    }
    worksheetRow.cells[memberIndex] = { date: row.date, answered: row.answered, awarded: row.awarded };
  });

  const builtPages: WorksheetPage[] = Array.from(pageAccumulators.values()).map((acc) => ({
    key: acc.key,
    skill: acc.skill,
    stream: acc.stream,
    stage: acc.stage,
    title: pageTitle(acc.skill, acc.stream, acc.stage),
    members,
    // acc.groupOrder only ever gains a title at the same moment acc.groups gains that key
    // (see the accumulation loop above), so this lookup is always defined.
    groups: acc.groupOrder.map((title) => ({ title, rows: Array.from(acc.groups.get(title)!.values()) })),
  }));

  const narrowedPages = options.hideCompleted ? builtPages.map((page) => applyHideCompletedToPage(page, members)).filter((page): page is WorksheetPage => page !== null) : builtPages;

  const skillOrderIndex = new Map(OAS_SKILLS.map((s, i) => [s, i]));
  narrowedPages.sort((a, b) => {
    const skillDiff = (skillOrderIndex.get(a.skill) ?? OAS_SKILLS.length) - (skillOrderIndex.get(b.skill) ?? OAS_SKILLS.length);
    if (skillDiff !== 0) return skillDiff;
    if (a.stage !== b.stage) return a.stage - b.stage;
    const aIsTrunk = a.stream === a.skill;
    const bIsTrunk = b.stream === b.skill;
    if (aIsTrunk !== bIsTrunk) return aIsTrunk ? -1 : 1;
    return a.stream.localeCompare(b.stream);
  });

  const patrolGroups: WorksheetPatrolGroup[] | null = options.breakByPatrol ? groupMembersByPatrol(members) : null;

  return { members, patrolGroups, pages: narrowedPages };
}

/**
 * Splits one page's member columns into batches of at most `maxColumns`, each becoming its own
 * full page with identical I-Statement rows (same groups/order) but only that batch's columns —
 * see .claude/OASWorksheets/PLAN_STAGE_5_LARGE_UNITS.md §3. This is the Layout A ("members as
 * columns") answer to a unit too large for one sheet's width: nothing is dropped, the same stage
 * simply prints across more sheets.
 *
 * Reuses the exact index-alignment shape `applyHideCompletedToPage` already established — slicing
 * `WorksheetRow.cells` by the same index range used to slice `members`, so cells stay aligned with
 * their own batch's columns rather than the page's original full list.
 *
 * A page with `members.length <= maxColumns` is returned as a single-element array unchanged (by
 * reference), so a caller can always treat the result as "the pages to render," split or not,
 * without a separate branch — matching how `applyHideCompletedToPage` returns `page` itself by
 * reference when no narrowing was needed.
 */
export function splitPageIntoColumnBatches(page: WorksheetPage, maxColumns: number): WorksheetPage[] {
  if (page.members.length <= maxColumns || maxColumns <= 0) {
    return [page];
  }

  const batchCount = Math.ceil(page.members.length / maxColumns);
  // Evenly sized batches (e.g. 33 members / 29-max -> 2 batches of 17, not a 29 + a 4) — requested
  // live: a lopsided last batch (nearly-full first sheet, nearly-empty last one) visibly renders at
  // a different, wider column width than its siblings once each batch's own width is computed from
  // ITS OWN member count (see OASWorksheetsVue.ts's own columnsLayoutPages comment on why every
  // batch of the same page must now share one member count for that reason). Even sizing keeps
  // every batch of a split page the same size, which is what keeps them the same width too.
  const evenBatchSize = Math.ceil(page.members.length / batchCount);
  const batches: WorksheetPage[] = [];

  for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
    const startIndex = batchIndex * evenBatchSize;
    const endIndex = Math.min(startIndex + evenBatchSize, page.members.length);
    const batchMembers = page.members.slice(startIndex, endIndex);

    batches.push({
      ...page,
      key: `${page.key}::batch${batchIndex}`,
      // "(members 1-13 of 40)" style suffix — see PLAN_STAGE_5_LARGE_UNITS.md §3 — so a leader
      // holding a stack of printouts can tell batches apart and reassemble them mentally. 1-based
      // for the human-facing numbers; startIndex/endIndex above stay 0-based array indices.
      title: batchCount > 1 ? `${page.title} (members ${startIndex + 1}-${endIndex} of ${page.members.length})` : page.title,
      members: batchMembers,
      groups: page.groups.map((group) => ({
        title: group.title,
        rows: group.rows.map((row) => ({
          ...row,
          cells: row.cells.slice(startIndex, endIndex),
        })),
      })),
    });
  }

  return batches;
}

/** One I-Statement as a transposed COLUMN — see TransposedWorksheetPage. */
export interface TransposedStatementColumn {
  inputId: string;
  iStatement: string;
  /** "Plan" | "Do" | "Review" | "Verify", or whatever the template used — the spanning group-header row groups by this. */
  inputGroup: string;
}

/** One member as a transposed ROW, with one cell per `TransposedWorksheetPage.columns` entry, in the same order. */
export interface TransposedWorksheetRow {
  memberId: string;
  displayName: string;
  patrolName: string | null;
  /** Same length and order as the page's own `columns`. */
  cells: WorksheetCell[];
}

/** A Plan/Do/Review/Verify span over a contiguous run of `columns` — the transposed layout's equivalent of WorksheetGroup, now describing a column range instead of a set of rows. */
export interface TransposedGroupSpan {
  title: string;
  /** Index into `columns` of this span's first column. */
  startColumnIndex: number;
  /** Number of columns this span covers, for the header's colspan. */
  columnCount: number;
}

/** Layout B ("members as rows") — see .claude/OASWorksheets/PLAN_STAGE_5_LARGE_UNITS.md §1. The transposed form of one WorksheetPage: same Skill/Stream/Stage, same underlying data, I-Statements and members swapped between the row and column axes. */
export interface TransposedWorksheetPage {
  key: string;
  skill: string;
  stream: string;
  stage: number;
  title: string;
  columns: TransposedStatementColumn[];
  groupSpans: TransposedGroupSpan[];
  rows: TransposedWorksheetRow[];
}

/**
 * Transposes one WorksheetPage into its Layout B form. Pure reshape — no new data, no filtering;
 * `page.members`/`page.groups` are already exactly what's wanted, just read along the other axis.
 *
 * Column order follows `page.groups`' own order (template order, per PLAN_STAGE_1.md §4 step 5),
 * flattening each group's rows into one contiguous run of columns — this is what lets
 * `groupSpans` describe simple contiguous ranges rather than a scattered set of column indices.
 */
export function transposeWorksheetPage(page: WorksheetPage): TransposedWorksheetPage {
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

  // One row per member, cells rebuilt in COLUMN order (i.e. in the flattened group.rows order
  // above) by looking up that member's own cell off each original WorksheetRow — the original
  // row's `cells` array is indexed by MEMBER, so `cells[memberIndex]` is this member's value for
  // that statement.
  const rows: TransposedWorksheetRow[] = page.members.map((member, memberIndex) => {
    const cells: WorksheetCell[] = [];
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

/**
 * Splits one transposed (Layout B, "members as rows") page's I-Statement COLUMNS into batches of at
 * most `maxColumns`, each becoming its own full page with identical member ROWS (every member
 * repeats in full on every batch — rows are this layout's whole point, never split) but only that
 * batch's columns. The column-axis mirror of splitPageIntoColumnBatches above, replacing the old
 * "shrink the font to fit every column on one page" behaviour (fitRotatedHeaderFont.ts) now that
 * I-Statement columns wrap at a fixed width/font instead of shrinking indefinitely.
 *
 * Same even-batch-size approach as splitPageIntoColumnBatches, for the same reason: every batch
 * should render at the same column width as its siblings, which even sizing guarantees and a
 * lopsided remainder batch would not.
 *
 * groupSpans are clipped to each batch's own column range the same way splitTableColumnsForPrint's
 * sliceHeaderRowColumns clips a patrol span against a new DOM column range: a span with no overlap
 * is dropped, a span that partially overlaps is kept with its columnCount/startColumnIndex
 * recomputed to the overlapping portion only.
 *
 * A page with `columns.length <= maxColumns` is returned as a single-element array unchanged (by
 * reference), matching splitPageIntoColumnBatches's own contract.
 */
export function splitTransposedPageIntoColumnBatches(page: TransposedWorksheetPage, maxColumns: number): TransposedWorksheetPage[] {
  if (page.columns.length <= maxColumns || maxColumns <= 0) {
    return [page];
  }

  const batchCount = Math.ceil(page.columns.length / maxColumns);
  const evenBatchSize = Math.ceil(page.columns.length / batchCount);
  const batches: TransposedWorksheetPage[] = [];

  for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
    const startIndex = batchIndex * evenBatchSize;
    const endIndex = Math.min(startIndex + evenBatchSize, page.columns.length);
    const batchColumns = page.columns.slice(startIndex, endIndex);

    const batchGroupSpans: TransposedGroupSpan[] = page.groupSpans
      .map((span) => {
        const spanStart = span.startColumnIndex;
        const spanEnd = span.startColumnIndex + span.columnCount;
        const overlapStart = Math.max(spanStart, startIndex);
        const overlapEnd = Math.min(spanEnd, endIndex);
        if (overlapEnd <= overlapStart) {
          return null;
        }
        return { title: span.title, startColumnIndex: overlapStart - startIndex, columnCount: overlapEnd - overlapStart };
      })
      .filter((span): span is TransposedGroupSpan => span !== null);

    batches.push({
      ...page,
      key: `${page.key}::batch${batchIndex}`,
      // "(statements 1-13 of 40)" — deliberately "statements", not "members": rows (members) still
      // repeat in FULL on every batch here, unlike Layout A's member-range split, so the suffix must
      // not read like a member-range label.
      title: batchCount > 1 ? `${page.title} (statements ${startIndex + 1}-${endIndex} of ${page.columns.length})` : page.title,
      columns: batchColumns,
      groupSpans: batchGroupSpans,
      rows: page.rows.map((row) => ({
        ...row,
        cells: row.cells.slice(startIndex, endIndex),
      })),
    });
  }

  return batches;
}
