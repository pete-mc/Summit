import type { MetaEntry } from "@/print/summitPrint";
import type { OASProgressionVueFilterState } from "./OASProgressionVueFilterPersistence";

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
