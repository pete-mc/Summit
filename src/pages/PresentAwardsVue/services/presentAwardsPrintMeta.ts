import type { MetaEntry } from "@/print/summitPrint";
import { HEADERS, PRESENTED_FILTER_YES, PRESENTED_FILTER_NO } from "../components/PresentAwardsTableVue";

/**
 * The column filters in effect, for the printout's header line (.claude/Print/PLAN_STAGE_4.md).
 * Only filters that are set are listed — the user chose column filters only, not the "Show
 * previously presented" display option. Labels are the table's own column names.
 *
 * Type is a dropdown, so its value is printed as chosen; Presented stores yes/no codes rather
 * than text (see filterPresentAwardRows), so it is printed as Yes/No; everything else is a
 * substring match and reads as `contains "…"`.
 */
export function buildPresentAwardsPrintMeta(columnFilters: Record<string, string>): MetaEntry[] {
  const meta: MetaEntry[] = [];
  for (const header of HEADERS) {
    const value = (columnFilters[header.value] ?? "").trim();
    if (!value || !header.text) continue;
    if (header.value === "presented") {
      meta.push({ label: header.text, value: value === PRESENTED_FILTER_YES ? "Yes" : value === PRESENTED_FILTER_NO ? "No" : value });
    } else if (header.filterType === "select") {
      meta.push({ label: header.text, value });
    } else {
      meta.push({ label: header.text, value: `contains "${value}"` });
    }
  }
  return meta;
}
