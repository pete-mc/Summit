import type { MetaEntry } from "@/print/summitPrint";
import type { OASProgressionVueFilterState } from "./OASProgressionVueFilterPersistence";
import { skillTitle } from "@/pages/OasProgressionVue/components/OASHeatMapVue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";

const MAX_STAGE = 9;

/**
 * The Heatmap's "Show" options, worded for a printout. Deliberately not the dropdown's own labels:
 * the dropdown relies on its "Skills"/"I Statements" subheaders to tell its two "Not started"
 * items apart, and a flat list on paper has no subheaders. Order follows the dropdown's.
 */
const HIDDEN_LABELS: Array<{ key: keyof OASProgressionVueFilterState; text: string }> = [
  { key: "showEmptySkillRows", text: "Skills not started" },
  { key: "showEmptyTopStages", text: "Empty top stages" },
  { key: "showAwarded", text: "Awarded I-Statements" },
  { key: "showNotStarted", text: "Not started I-Statements" },
  { key: "showAnswered", text: "Answered I-Statements" },
];

/** "All" when every option is selected, "None" when nothing is, otherwise the names. */
export function describePatrols(selected: string[] | null, options: string[]): string {
  const chosen = selected ?? options;
  if (chosen.length === 0) return "None";
  if (options.length > 0 && options.every((o) => chosen.indexOf(o) !== -1)) return "All";
  return chosen.join(", ");
}

/**
 * The filters in effect on the Summary tab, for the printout's header (.claude/Print/PLAN.md
 * "Header and footer design") — only filters that change WHO is listed. Sort order is left out
 * (user, 2026-10-10): it is visible in the printout itself. Labels match the filter bar's own.
 */
export function buildSummaryPrintMeta(filters: OASProgressionVueFilterState, patrolOptions: string[], canFilterByPatrol: boolean): MetaEntry[] {
  const meta: MetaEntry[] = [];
  const member = filters.summaryMemberFilter.trim();
  if (member) meta.push({ label: "Member", value: `contains "${member}"` });
  if (canFilterByPatrol) meta.push({ label: "Patrol", value: describePatrols(filters.summarySelectedPatrols, patrolOptions) });
  return meta;
}

/**
 * The filters in effect on the Heatmap tab (.claude/Print/PLAN_STAGE_2.md). Same rule as the
 * Summary: only what changes who or what is shown, and only when it isn't "everything". Group by
 * and Break by patrol are layout, visible in the printout itself, so they're left out like sort.
 */
export function buildHeatmapPrintMeta(filters: OASProgressionVueFilterState, patrolOptions: string[], canFilterByPatrol: boolean): MetaEntry[] {
  const meta: MetaEntry[] = [];
  const member = filters.memberFilter.trim();
  if (member) meta.push({ label: "Member", value: `contains "${member}"` });
  if (canFilterByPatrol) meta.push({ label: "Patrol", value: describePatrols(filters.selectedPatrols, patrolOptions) });

  // Listed in the filter's own (canonical) order, not the order they were ticked in.
  const skills = OAS_SKILLS.filter((s) => filters.visibleStreams.indexOf(s) !== -1);
  if (skills.length < OAS_SKILLS.length) meta.push({ label: "Skills", value: skills.length ? skills.map(skillTitle).join(", ") : "None" });

  const stages = filters.visibleStages.slice().sort((a, b) => a - b);
  if (stages.length < MAX_STAGE) meta.push({ label: "Stages", value: stages.length ? stages.join(", ") : "None" });

  const hidden = HIDDEN_LABELS.filter((h) => filters[h.key] === false).map((h) => h.text);
  if (hidden.length) meta.push({ label: "Hidden", value: hidden.join(", ") });
  return meta;
}
