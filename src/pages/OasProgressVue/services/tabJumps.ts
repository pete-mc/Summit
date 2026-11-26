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
  showApproved: true,
  showNotStarted: true,
  showAnswered: true,
  showEmptySkillRows: true,
};

const copyPatrols = (patrols: string[] | null) => (patrols ? patrols.slice() : null);
const memberSkillStreamKey = (memberId: string, skillStream: string) => `${memberId}|${skillStream}`;
const memberSkillKey = (memberId: string, skill: string) => `${memberId}|${skill}`;

/** Every member and Skill - Stream with a stage not yet approved: what Next Steps can show. */
export function listOutstandingSkillStreams(items: OASProgressRow[]): Set<string> {
  const keys = new Set<string>();
  items.forEach((row) => {
    if (!row.approved) keys.add(memberSkillStreamKey(row.memberId, skillStreamKey(row.stream, row.branch)));
  });
  return keys;
}

export function lowestStagesNeeded(items: OASProgressRow[], memberIds: string[]): Record<string, number> {
  const lowest: Record<string, number> = {};
  items.forEach((row) => {
    if (row.approved || memberIds.indexOf(row.memberId) === -1) return;
    const key = skillStreamKey(row.stream, row.branch);
    if (lowest[key] === undefined || row.stage < lowest[key]) lowest[key] = row.stage;
  });
  return lowest;
}

/** Per member and skill, the stream holding their highest award; the trunk wins a tie. */
export function highestApprovedStreams(items: OASProgressRow[]): Record<string, string> {
  const best: Record<string, { stream: string; stage: number }> = {};
  items.forEach((row) => {
    if (!row.approved) return;
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

  return nextStepsTarget(memberId, displayName, skill, stream, null, origin);
}

/** A null stage lets Next Steps open the lowest stage still needed. */
function nextStepsTarget(memberId: string, displayName: string, skill: string, stream: string, stage: number | null, origin: Origin): TabJump {
  const stageText = stage === null ? "" : ` stage ${stage}`;
  const detail = `${displayName} – ${skillStreamLabel({ stream: skill, branch: stream })}${stageText}`;
  return {
    viewMode: "nextSteps",
    filters: { nextStepsMemberId: memberId, nextStepsSkillStream: skillStreamKey(skill, stream), nextStepsStage: stage },
    title: `Open Next Steps: ${detail}`,
    from: { ...origin, detail },
  };
}

function stageGridJump(skill: string, stream: string, stage: number, people: ShownPeople, origin: Origin): TabJump {
  const detail = skillStreamLabel({ stream: skill, branch: stream });
  return {
    viewMode: "stageGrid",
    filters: { stageGridSkillStream: skillStreamKey(skill, stream), stageGridStage: stage, stageGridSelectedPatrols: copyPatrols(people.selectedPatrols), stageGridShowApproved: true },
    title: `Open in Stage Grid (stage ${stage})`,
    from: { ...origin, detail: `${detail} stage ${stage}` },
  };
}

function summaryMemberJump(memberName: string, people: ShownPeople, from: TabJump["from"]): TabJump {
  return { viewMode: "summary", filters: { summaryMemberFilter: memberName, summarySelectedPatrols: copyPatrols(people.selectedPatrols) }, title: "Open in Summary", from };
}

function peakAwardMemberJump(memberName: string, people: ShownPeople, from: TabJump["from"]): TabJump {
  return { viewMode: "peakAward", filters: { peakAwardMemberFilter: memberName, peakAwardSelectedPatrols: copyPatrols(people.selectedPatrols) }, title: "Open in Peak Award", from };
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

  const stage = lowestStages[skillStreamKey(skill, stream)];
  if (stage !== undefined && stage <= maxStage) jumps.push(stageGridJump(skill, stream, stage, people, origin));
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
  if (canOpenPeakAward) jumps.push(peakAwardMemberJump(memberName, people, from));
  return inTabOrder(jumps);
}

export function peakAwardMemberJumps(row: PeakAwardMemberRow, displayName: string, people: ShownPeople): TabJump[] {
  const from = { ...PEAK_AWARD, detail: displayName };
  return inTabOrder([summaryMemberJump(row.memberName, people, from), heatMapMemberJump(row.memberName, people, from)]);
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

const HEAT_MAP: Origin = { viewMode: "heatmap", tabName: "Heat Map" };

/** One member's row in one Skill - Stream, in either Heat Map layout. stream is the skill on the trunk. */
export interface HeatMapRowTarget {
  memberId: string;
  displayName: string;
  skill: string;
  stream: string;
}

/** The "Stage" number: like a Summary cell, opens the lowest stage still needed. */
export function heatMapStageColumnJump(row: HeatMapRowTarget, outstanding: Set<string>): TabJump | null {
  return nextStepsJump(row.memberId, row.displayName, row.skill, row.stream, outstanding, HEAT_MAP);
}

/** A stage cell opens that exact stage. Approved or hidden stages are not links. */
export function heatMapStageCellJump(row: HeatMapRowTarget, stage: number, cellKind: "empty" | "bar-approved" | "bar-unstarted" | "squares"): TabJump | null {
  if (cellKind !== "squares" && cellKind !== "bar-unstarted") return null;
  return nextStepsTarget(row.memberId, row.displayName, row.skill, row.stream, stage, HEAT_MAP);
}

export function heatMapMemberJumps(memberName: string, displayName: string, people: ShownPeople, canOpenPeakAward: boolean): TabJump[] {
  const from = { ...HEAT_MAP, detail: displayName };
  const jumps = [summaryMemberJump(memberName, people, from)];
  if (canOpenPeakAward) jumps.push(peakAwardMemberJump(memberName, people, from));
  return inTabOrder(jumps);
}

/** Grouped by skill, stage is the lowest any shown member needs; grouped by member, that member's own next stage. */
export function heatMapSkillStreamJumps(skill: string, stream: string, stage: number | undefined, people: ShownPeople): TabJump[] {
  return stage === undefined ? [] : [stageGridJump(skill, stream, stage, people, HEAT_MAP)];
}

/** Per member and Skill - Stream, the lowest stage not yet approved. */
export function lowestStagesByMember(items: OASProgressRow[]): Record<string, number> {
  const lowest: Record<string, number> = {};
  items.forEach((row) => {
    if (row.approved) return;
    const key = memberSkillStreamKey(row.memberId, skillStreamKey(row.stream, row.branch));
    if (lowest[key] === undefined || row.stage < lowest[key]) lowest[key] = row.stage;
  });
  return lowest;
}

export function memberLowestStage(lowestByMember: Record<string, number>, memberId: string, skill: string, stream: string): number | undefined {
  return lowestByMember[memberSkillStreamKey(memberId, skillStreamKey(skill, stream))];
}

const STAGE_GRID: Origin = { viewMode: "stageGrid", tabName: "Stage Grid" };

const memberStageKey = (memberId: string, skill: string, stream: string, stage: number) => `${memberSkillStreamKey(memberId, skillStreamKey(skill, stream))}|${stage}`;

/** Every member, Skill - Stream and stage not yet approved. */
export function listOutstandingStages(items: OASProgressRow[]): Set<string> {
  const keys = new Set<string>();
  items.forEach((row) => {
    if (!row.approved) keys.add(memberStageKey(row.memberId, row.stream, row.branch, row.stage));
  });
  return keys;
}

/** Null when the member's stage is already approved: Next Steps would have nothing to show. */
export function stageGridNextStepsJump(row: HeatMapRowTarget, stage: number, outstandingStages: Set<string>): TabJump | null {
  if (!outstandingStages.has(memberStageKey(row.memberId, row.skill, row.stream, stage))) return null;
  return nextStepsTarget(row.memberId, row.displayName, row.skill, row.stream, stage, STAGE_GRID);
}

export function stageGridMemberJumps(memberName: string, nextSteps: TabJump | null, people: ShownPeople, canOpenPeakAward: boolean, displayName: string): TabJump[] {
  const from = { ...STAGE_GRID, detail: displayName };
  const jumps = [summaryMemberJump(memberName, people, from), heatMapMemberJump(memberName, people, from)];
  if (canOpenPeakAward) jumps.push(peakAwardMemberJump(memberName, people, from));
  if (nextSteps) jumps.push({ ...nextSteps, title: `Open in Next Steps (stage ${nextSteps.filters.nextStepsStage})` });
  return inTabOrder(jumps);
}

export function stageGridPageJumps(skill: string, stream: string, stage: number, people: ShownPeople): TabJump[] {
  return [heatMapSkillsJump([skill], people, { ...STAGE_GRID, detail: `${skillStreamLabel({ stream: skill, branch: stream })} stage ${stage}` })];
}
