import type { MetaEntry } from "@/print/summitPrint";
import { HEADERS, PRESENTED_FILTER_YES, PRESENTED_FILTER_NO } from "../components/PresentAwardsTableVue";

/** Column filters only. Presented stores codes, so it prints as Yes/No. */
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
