import type { MetaEntry } from "@/print/summitPrint";
import type { OASProgressVueFilterState } from "./OASProgressVueFilterPersistence";
import { skillTitle } from "@/pages/OasProgressVue/services/skillNames";
import { OAS_SKILLS } from "@/pages/OasProgress/services/filterHeatMapSections";

const MAX_STAGE = 9;

const HIDDEN_LABELS: Array<{ key: keyof OASProgressVueFilterState; text: string }> = [
  { key: "showEmptySkillRows", text: "Skills not started" },
  { key: "showNotStarted", text: "Stages not started" },
  { key: "showApproved", text: "Approved I-Statements" },
  { key: "showAnswered", text: "Answered I-Statements" },
];

export function describePatrols(selected: string[] | null, options: string[]): string {
  const chosen = selected ?? options;
  if (chosen.length === 0) return "None";
  if (options.length > 0 && options.every((o) => chosen.indexOf(o) !== -1)) return "All";
  return chosen.join(", ");
}

/** Only filters that change who or what is listed. Sort and break by patrol are visible in the printout itself. */
export function buildSummaryPrintMeta(filters: OASProgressVueFilterState, patrolOptions: string[], canFilterByPatrol: boolean): MetaEntry[] {
  const meta: MetaEntry[] = [];
  const member = filters.summaryMemberFilter.trim();
  if (member) meta.push({ label: "Member", value: `contains "${member}"` });
  if (canFilterByPatrol) meta.push({ label: "Patrol", value: describePatrols(filters.summarySelectedPatrols, patrolOptions) });
  if (filters.summaryExpandStreams === false) meta.push({ label: "Streams", value: "Collapsed" });
  if (filters.summaryShowNotStartedSkills === false) meta.push({ label: "Hidden", value: "Skills not started" });
  return meta;
}

export function buildPeakAwardPrintMeta(filters: OASProgressVueFilterState, patrolOptions: string[], canFilterByPatrol: boolean): MetaEntry[] {
  const meta: MetaEntry[] = [];
  const member = filters.peakAwardMemberFilter.trim();
  if (member) meta.push({ label: "Member", value: `contains "${member}"` });
  if (canFilterByPatrol) meta.push({ label: "Patrol", value: describePatrols(filters.peakAwardSelectedPatrols, patrolOptions) });
  return meta;
}

/** Only filters that change what is shown. Layout options (group by, break by patrol) are visible in the printout. */
export function buildHeatmapPrintMeta(filters: OASProgressVueFilterState, patrolOptions: string[], canFilterByPatrol: boolean): MetaEntry[] {
  const meta: MetaEntry[] = [];
  const member = filters.memberFilter.trim();
  if (member) meta.push({ label: "Member", value: `contains "${member}"` });
  if (canFilterByPatrol) meta.push({ label: "Patrol", value: describePatrols(filters.selectedPatrols, patrolOptions) });

  const skills = OAS_SKILLS.filter((s) => filters.visibleStreams.indexOf(s) !== -1);
  if (skills.length < OAS_SKILLS.length) meta.push({ label: "Skills", value: skills.length ? skills.map(skillTitle).join(", ") : "None" });

  const stages = filters.visibleStages.slice().sort((a, b) => a - b);
  if (stages.length < MAX_STAGE) meta.push({ label: "Stages", value: stages.length ? stages.join(", ") : "None" });

  const hidden = HIDDEN_LABELS.filter((h) => filters[h.key] === false).map((h) => h.text);
  if (hidden.length) meta.push({ label: "Hidden", value: hidden.join(", ") });
  return meta;
}

export function buildNextStepsPrintMeta(memberName: string, skillStreamLabel: string, stage: number | null): MetaEntry[] {
  const meta: MetaEntry[] = [];
  if (memberName) meta.push({ label: "Member", value: memberName });
  if (skillStreamLabel) meta.push({ label: "Skill", value: skillStreamLabel });
  if (stage !== null) meta.push({ label: "Stage", value: String(stage) });
  return meta;
}

/** Layout, name format and break by patrol are visible in the printout itself. */
export function buildStageGridPrintMeta(filters: OASProgressVueFilterState, skillStreamLabel: string, stage: number | null, patrolOptions: string[], canFilterByPatrol: boolean): MetaEntry[] {
  const meta: MetaEntry[] = skillStreamLabel ? [{ label: "Skill", value: skillStreamLabel }] : [];
  if (stage !== null) meta.push({ label: "Stage", value: String(stage) });
  if (canFilterByPatrol) meta.push({ label: "Patrol", value: describePatrols(filters.stageGridSelectedPatrols, patrolOptions) });
  if (!filters.stageGridShowApproved) meta.push({ label: "Hidden", value: "Members approved for the stage" });
  return meta;
}
