import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { OverallProgressCell, OverallProgressColumn, OverallProgressRow } from "@/pages/OasProgress/services/buildOverallProgressRows";
import type { StageAward } from "@/pages/OasProgress/services/buildPeakAwardSummaryRows";
import { OAS_SKILLS } from "@/pages/OasProgress/services/filterHeatMapSections";
import type { OASProgressVueFilterState } from "./OASProgressVueFilterPersistence";
import { skillStreamKey, skillStreamLabel } from "./skillStreams";

type ViewMode = OASProgressVueFilterState["viewMode"];

export interface TabJump {
  viewMode: ViewMode;
  filters: Partial<OASProgressVueFilterState>;
  title: string;
  from: { viewMode: ViewMode; tabName: string; detail: string };
}

/** Keyed by memberId, aligned with the Summary columns. */
export type SummaryCellJumps = Record<string, Array<TabJump | null>>;

const memberSkillStreamKey = (memberId: string, skillStream: string) => `${memberId}|${skillStream}`;

/** Every member and Skill - Stream with a stage not yet awarded: what Next Steps can show. */
export function listOutstandingSkillStreams(items: OASProgressRow[]): Set<string> {
  const keys = new Set<string>();
  items.forEach((row) => {
    if (!row.awarded) keys.add(memberSkillStreamKey(row.memberId, skillStreamKey(row.stream, row.branch)));
  });
  return keys;
}

/** A merged skill cell uses the stream whose award gives the number shown; a tie goes to the first listed (trunk first). */
export function cellStream(column: OverallProgressColumn, cell: OverallProgressCell): string {
  if (column.stream) return column.stream;
  const highest = (cell.awards ?? []).reduce<StageAward | null>((best, award) => (!best || award.stage > best.stage ? award : best), null);
  return highest ? highest.branch : column.skill;
}

/** Null when the member has nothing left to do in that Skill - Stream. */
export function nextStepsCellJump(row: OverallProgressRow, column: OverallProgressColumn, cell: OverallProgressCell, outstanding: Set<string>): TabJump | null {
  const stream = cellStream(column, cell);
  const skillStream = skillStreamKey(column.skill, stream);
  if (!outstanding.has(memberSkillStreamKey(row.memberId, skillStream))) return null;

  const detail = `${row.displayName} – ${skillStreamLabel({ stream: column.skill, branch: stream })}`;
  return {
    viewMode: "nextSteps",
    filters: { nextStepsMemberId: row.memberId, nextStepsSkillStream: skillStream, nextStepsStage: null },
    title: `Open Next Steps: ${detail}`,
    from: { viewMode: "summary", tabName: "Summary", detail },
  };
}

/** The people Summary is showing, passed on so the target tab shows the same ones. */
export interface SummaryPeople {
  selectedPatrols: string[] | null;
  memberFilter: string;
}

const MAX_STAGE = 9;

/** Gotcha: a jump resets these so leftover Heat Map settings can't hide what was clicked. */
const HEAT_MAP_SHOW_EVERYTHING: Partial<OASProgressVueFilterState> = {
  visibleStages: Array.from({ length: MAX_STAGE }, (_, i) => i + 1),
  showAwarded: true,
  showNotStarted: true,
  showAnswered: true,
  showEmptySkillRows: true,
  showEmptyTopStages: true,
};

const copyPatrols = (patrols: string[] | null) => (patrols ? patrols.slice() : null);

/** Gotcha: keep in step with the v-tabs order in OasProgressVueContent.vue; "Open in" menus list tabs in this order. */
export const TAB_ORDER: ViewMode[] = ["about", "summary", "peakAward", "heatmap", "nextSteps", "stageGrid"];

export function inTabOrder(jumps: TabJump[]): TabJump[] {
  return jumps.slice().sort((a, b) => TAB_ORDER.indexOf(a.viewMode) - TAB_ORDER.indexOf(b.viewMode));
}

export function lowestStagesNeeded(items: OASProgressRow[], memberIds: string[]): Record<string, number> {
  const lowest: Record<string, number> = {};
  items.forEach((row) => {
    if (row.awarded || memberIds.indexOf(row.memberId) === -1) return;
    const key = skillStreamKey(row.stream, row.branch);
    if (lowest[key] === undefined || row.stage < lowest[key]) lowest[key] = row.stage;
  });
  return lowest;
}

/** A merged skill column opens Stage Grid on its trunk. Stage Grid is left out when every shown member has finished. */
export function summaryColumnJumps(column: OverallProgressColumn, people: SummaryPeople, lowestStages: Record<string, number>): TabJump[] {
  const stream = column.stream ?? column.skill;
  const detail = skillStreamLabel({ stream: column.skill, branch: stream });
  const from = { viewMode: "summary" as const, tabName: "Summary", detail };

  const jumps: TabJump[] = [
    {
      viewMode: "heatmap",
      filters: { ...HEAT_MAP_SHOW_EVERYTHING, groupBy: "skill", visibleStreams: [column.skill], selectedPatrols: copyPatrols(people.selectedPatrols), memberFilter: people.memberFilter },
      title: "Open in Heat Map",
      from,
    },
  ];

  const skillStream = skillStreamKey(column.skill, stream);
  const stage = lowestStages[skillStream];
  if (stage !== undefined) {
    jumps.push({
      viewMode: "stageGrid",
      filters: { stageGridSkillStream: skillStream, stageGridStage: stage, stageGridSelectedPatrols: copyPatrols(people.selectedPatrols), stageGridShowCompleted: true },
      title: `Open in Stage Grid (stage ${stage})`,
      from: { ...from, detail: `${detail} stage ${stage}` },
    });
  }
  return inTabOrder(jumps);
}

/** memberName is the full name, which Heat Map and Peak Award match their Member filter against. */
export function summaryMemberJumps(row: OverallProgressRow, memberName: string, people: SummaryPeople, canOpenPeakAward: boolean): TabJump[] {
  const from = { viewMode: "summary" as const, tabName: "Summary", detail: row.displayName };
  const jumps: TabJump[] = [
    {
      viewMode: "heatmap",
      filters: { ...HEAT_MAP_SHOW_EVERYTHING, groupBy: "member", visibleStreams: OAS_SKILLS.slice(), selectedPatrols: copyPatrols(people.selectedPatrols), memberFilter: memberName },
      title: "Open in Heat Map",
      from,
    },
  ];
  if (canOpenPeakAward) {
    jumps.push({ viewMode: "peakAward", filters: { peakAwardMemberFilter: memberName, peakAwardSelectedPatrols: copyPatrols(people.selectedPatrols) }, title: "Open in Peak Award", from });
  }
  return inTabOrder(jumps);
}

export function buildSummaryCellJumps(columns: OverallProgressColumn[], rows: OverallProgressRow[], outstanding: Set<string>): SummaryCellJumps {
  const jumps: SummaryCellJumps = {};
  rows.forEach((row) => {
    jumps[row.memberId] = row.cells.map((cell, index) => nextStepsCellJump(row, columns[index], cell, outstanding));
  });
  return jumps;
}
