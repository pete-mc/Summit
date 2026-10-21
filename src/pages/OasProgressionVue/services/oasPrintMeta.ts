import type { MetaEntry } from "@/print/summitPrint";
import type { OASProgressionVueFilterState } from "./OASProgressionVueFilterPersistence";
import { skillTitle } from "@/pages/OasProgressionVue/components/OASHeatMapVue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import { HEADERS as TABLE_HEADERS, YES_NO_OPTIONS } from "@/pages/OasProgressionVue/components/OASProgressionTableVue";

const MAX_STAGE = 9;

/** Not the dropdown's labels: on paper there are no subheaders to tell its two "Not started" items apart. */
const HIDDEN_LABELS: Array<{ key: keyof OASProgressionVueFilterState; text: string }> = [
  { key: "showEmptySkillRows", text: "Skills not started" },
  { key: "showEmptyTopStages", text: "Empty top stages" },
  { key: "showAwarded", text: "Awarded I-Statements" },
  { key: "showNotStarted", text: "Not started I-Statements" },
  { key: "showAnswered", text: "Answered I-Statements" },
];

export function describePatrols(selected: string[] | null, options: string[]): string {
  const chosen = selected ?? options;
  if (chosen.length === 0) return "None";
  if (options.length > 0 && options.every((o) => chosen.indexOf(o) !== -1)) return "All";
  return chosen.join(", ");
}

/** Only filters that change who is listed. Sort is visible in the printout itself. */
export function buildSummaryPrintMeta(filters: OASProgressionVueFilterState, patrolOptions: string[], canFilterByPatrol: boolean): MetaEntry[] {
  const meta: MetaEntry[] = [];
  const member = filters.summaryMemberFilter.trim();
  if (member) meta.push({ label: "Member", value: `contains "${member}"` });
  if (canFilterByPatrol) meta.push({ label: "Patrol", value: describePatrols(filters.summarySelectedPatrols, patrolOptions) });
  return meta;
}

/** Only filters that change what is shown. Layout options (group by, break by patrol) are visible in the printout. */
export function buildHeatmapPrintMeta(filters: OASProgressionVueFilterState, patrolOptions: string[], canFilterByPatrol: boolean): MetaEntry[] {
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

export function buildOasTablePrintMeta(columnFilters: Record<string, string>): MetaEntry[] {
  const meta: MetaEntry[] = [];
  for (const header of TABLE_HEADERS) {
    const value = (columnFilters[header.value] ?? "").trim();
    if (!value) continue;
    if (header.filterType !== "select") {
      meta.push({ label: header.text, value: `contains "${value}"` });
      continue;
    }
    const yesNo = header.value === "answered" || header.value === "awarded" ? YES_NO_OPTIONS.filter((o) => o.value === value)[0] : undefined;
    meta.push({ label: header.text, value: yesNo ? yesNo.text : value });
  }
  return meta;
}
