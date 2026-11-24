import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { OverallProgressCell, OverallProgressColumn, OverallProgressRow } from "@/pages/OasProgress/services/buildOverallProgressRows";
import { CORE_SKILLS, type PeakAwardMemberRow, type StageAward } from "@/pages/OasProgress/services/buildPeakAwardSummaryRows";
import { OAS_SKILLS } from "@/pages/OasProgress/services/filterHeatMapSections";
import type { OASProgressVueFilterState } from "./OASProgressVueFilterPersistence";
import { skillStreamKey, skillStreamLabel } from "./skillStreams";

type ViewMode = OASProgressVueFilterState["viewMode"];

interface Origin {
  viewMode: ViewMode;
  tabName: string;
}

export interface TabJump {
  viewMode: ViewMode;
  filters: Partial<OASProgressVueFilterState>;
  title: string;
  from: Origin & { detail: string };
}

/** Keyed by memberId, aligned with the table's linkable columns. */
export type CellJumps = Record<string, Array<TabJump | null>>;

/** The people the source tab is showing, passed on so the target tab shows the same ones. */
export interface ShownPeople {
  selectedPatrols: string[] | null;
  memberFilter: string;
}

const SUMMARY: Origin = { viewMode: "summary", tabName: "Summary" };
const PEAK_AWARD: Origin = { viewMode: "peakAward", tabName: "Peak Award" };

const MAX_STAGE = 9;

/** Gotcha: keep in step with the v-tabs order in OasProgressVueContent.vue; "Open in" menus list tabs in this order. */
export const TAB_ORDER: ViewMode[] = ["about", "summary", "peakAward", "heatmap", "nextSteps", "stageGrid"];

export function inTabOrder(jumps: TabJump[]): TabJump[] {
  return jumps.slice().sort((a, b) => TAB_ORDER.indexOf(a.viewMode) - TAB_ORDER.indexOf(b.viewMode));
}

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
const memberSkillStreamKey = (memberId: string, skillStream: string) => `${memberId}|${skillStream}`;
const memberSkillKey = (memberId: string, skill: string) => `${memberId}|${skill}`;

/** Every member and Skill - Stream with a stage not yet awarded: what Next Steps can show. */
export function listOutstandingSkillStreams(items: OASProgressRow[]): Set<string> {
  const keys = new Set<string>();
  items.forEach((row) => {
    if (!row.awarded) keys.add(memberSkillStreamKey(row.memberId, skillStreamKey(row.stream, row.branch)));
  });
  return keys;
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

/** Per member and skill, the stream holding their highest award; the trunk wins a tie. */
export function highestAwardedStreams(items: OASProgressRow[]): Record<string, string> {
  const best: Record<string, { stream: string; stage: number }> = {};
  items.forEach((row) => {
    if (!row.awarded) return;
    const key = memberSkillKey(row.memberId, row.stream);
    const current = best[key];
    const isTrunk = row.branch === row.stream;
    if (!current || row.stage > current.stage || (row.stage === current.stage && isTrunk)) best[key] = { stream: row.branch, stage: row.stage };
  });
  const streams: Record<string, string> = {};
  Object.keys(best).forEach((key) => (streams[key] = best[key].stream));
  return streams;
}

function nextStepsJump(memberId: string, displayName: string, skill: string, stream: string, outstanding: Set<string>, origin: Origin): TabJump | null {
  const skillStream = skillStreamKey(skill, stream);
  if (!outstanding.has(memberSkillStreamKey(memberId, skillStream))) return null;

  const detail = `${displayName} – ${skillStreamLabel({ stream: skill, branch: stream })}`;
  return {
    viewMode: "nextSteps",
    filters: { nextStepsMemberId: memberId, nextStepsSkillStream: skillStream, nextStepsStage: null },
    title: `Open Next Steps: ${detail}`,
    from: { ...origin, detail },
  };
}

function heatMapSkillsJump(skills: string[], people: ShownPeople, from: TabJump["from"]): TabJump {
  return {
    viewMode: "heatmap",
    filters: { ...HEAT_MAP_SHOW_EVERYTHING, groupBy: "skill", visibleStreams: skills.slice(), selectedPatrols: copyPatrols(people.selectedPatrols), memberFilter: people.memberFilter },
    title: "Open in Heat Map",
    from,
  };
}

/** memberName is the full name, which every tab's Member filter matches against. */
function heatMapMemberJump(memberName: string, people: ShownPeople, from: TabJump["from"]): TabJump {
  return {
    viewMode: "heatmap",
    filters: { ...HEAT_MAP_SHOW_EVERYTHING, groupBy: "member", visibleStreams: OAS_SKILLS.slice(), selectedPatrols: copyPatrols(people.selectedPatrols), memberFilter: memberName },
    title: "Open in Heat Map",
    from,
  };
}

/** Stage Grid is left out when no shown member needs a stage up to maxStage. */
function skillColumnJumps(skill: string, stream: string, people: ShownPeople, lowestStages: Record<string, number>, origin: Origin, maxStage = MAX_STAGE): TabJump[] {
  const detail = skillStreamLabel({ stream: skill, branch: stream });
  const jumps = [heatMapSkillsJump([skill], people, { ...origin, detail })];

  const skillStream = skillStreamKey(skill, stream);
  const stage = lowestStages[skillStream];
  if (stage !== undefined && stage <= maxStage) {
    jumps.push({
      viewMode: "stageGrid",
      filters: { stageGridSkillStream: skillStream, stageGridStage: stage, stageGridSelectedPatrols: copyPatrols(people.selectedPatrols), stageGridShowCompleted: true },
      title: `Open in Stage Grid (stage ${stage})`,
      from: { ...origin, detail: `${detail} stage ${stage}` },
    });
  }
  return inTabOrder(jumps);
}

/** A merged skill cell uses the stream whose award gives the number shown; a tie goes to the first listed (trunk first). */
export function cellStream(column: OverallProgressColumn, cell: OverallProgressCell): string {
  if (column.stream) return column.stream;
  const highest = (cell.awards ?? []).reduce<StageAward | null>((best, award) => (!best || award.stage > best.stage ? award : best), null);
  return highest ? highest.branch : column.skill;
}

export function nextStepsCellJump(row: OverallProgressRow, column: OverallProgressColumn, cell: OverallProgressCell, outstanding: Set<string>): TabJump | null {
  return nextStepsJump(row.memberId, row.displayName, column.skill, cellStream(column, cell), outstanding, SUMMARY);
}

export function buildSummaryCellJumps(columns: OverallProgressColumn[], rows: OverallProgressRow[], outstanding: Set<string>): CellJumps {
  const jumps: CellJumps = {};
  rows.forEach((row) => {
    jumps[row.memberId] = row.cells.map((cell, index) => nextStepsCellJump(row, columns[index], cell, outstanding));
  });
  return jumps;
}

/** A merged skill column opens Stage Grid on its trunk. */
export function summaryColumnJumps(column: OverallProgressColumn, people: ShownPeople, lowestStages: Record<string, number>): TabJump[] {
  return skillColumnJumps(column.skill, column.stream ?? column.skill, people, lowestStages, SUMMARY);
}

export function summaryMemberJumps(row: OverallProgressRow, memberName: string, people: ShownPeople, canOpenPeakAward: boolean): TabJump[] {
  const from = { ...SUMMARY, detail: row.displayName };
  const jumps = [heatMapMemberJump(memberName, people, from)];
  if (canOpenPeakAward) {
    jumps.push({ viewMode: "peakAward", filters: { peakAwardMemberFilter: memberName, peakAwardSelectedPatrols: copyPatrols(people.selectedPatrols) }, title: "Open in Peak Award", from });
  }
  return inTabOrder(jumps);
}

export function peakAwardMemberJumps(row: PeakAwardMemberRow, displayName: string, people: ShownPeople): TabJump[] {
  const from = { ...PEAK_AWARD, detail: displayName };
  const summary: TabJump = {
    viewMode: "summary",
    filters: { summaryMemberFilter: row.memberName, summarySelectedPatrols: copyPatrols(people.selectedPatrols) },
    title: "Open in Summary",
    from,
  };
  return inTabOrder([summary, heatMapMemberJump(row.memberName, people, from)]);
}

/** Only while the requirement is unmet. Uses the stream holding their highest award of that skill. */
export function buildPeakAwardCoreSkillJumps(rows: PeakAwardMemberRow[], displayName: (row: PeakAwardMemberRow) => string, highestStreams: Record<string, string>, outstanding: Set<string>): CellJumps {
  const jumps: CellJumps = {};
  rows.forEach((row) => {
    jumps[row.memberId] = row.coreSkills.map((coreSkill) => {
      if (coreSkill.met) return null;
      const stream = highestStreams[memberSkillKey(row.memberId, coreSkill.skill)] ?? coreSkill.skill;
      return nextStepsJump(row.memberId, displayName(row), coreSkill.skill, stream, outstanding, PEAK_AWARD);
    });
  });
  return jumps;
}

/** Stage Grid is capped at the Peak Award stage, so it never offers a stage beyond the requirement. */
export function peakAwardCoreSkillHeaderJumps(people: ShownPeople, lowestStages: Record<string, number>, requiredStage: number): TabJump[][] {
  return CORE_SKILLS.map((skill) => skillColumnJumps(skill, skill, people, lowestStages, PEAK_AWARD, requiredStage));
}

export function peakAwardCoreSkillsGroupJumps(people: ShownPeople): TabJump[] {
  return [heatMapSkillsJump(CORE_SKILLS.slice(), people, { ...PEAK_AWARD, detail: "Core Skills" })];
}
