import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";

interface DataTableHeader {
  text: string;
  value: string;
  sortable?: boolean;
  /** Defaults to "text" when omitted — a plain filter text box. "select" renders a dropdown
   *  instead, sourced from this component's own per-column options computed (see below). */
  filterType?: "text" | "select";
}

const HEADERS: DataTableHeader[] = [
  { text: "Member", value: "memberName" },
  { text: "Skill", value: "stream", filterType: "select" },
  { text: "Stream", value: "branch", filterType: "select" },
  { text: "Stage", value: "stage", filterType: "select" },
  { text: "Group", value: "inputGroup", filterType: "select" },
  { text: "I-Statement", value: "iStatement" },
  { text: "Answered", value: "answered", filterType: "select" },
  { text: "Awarded", value: "awarded", filterType: "select" },
  { text: "Date", value: "date" },
];

const MAX_STAGE = 9;
const STAGE_OPTIONS = Array.from({ length: MAX_STAGE }, (_, i) => ({ text: String(i + 1), value: String(i + 1) }));
const YES_NO_OPTIONS = [
  { text: "Yes", value: "true" },
  { text: "No", value: "false" },
];

function toFilterValue(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

/**
 * ANDs every non-empty column filter together (empty/missing entries mean "no filter on that
 * column"), matching DataGrid.tsx's own per-column filter semantics. A dropdown column's selected
 * value (e.g. "true" for Answered, "3" for Stage) is stored in the same columnFilters map as a
 * plain string and matched via the same substring logic as text columns — dropdowns are just a
 * different input widget, not a different filtering mechanism.
 */
export function filterOASProgressionRows(items: OASProgressionRow[], columnFilters: Record<string, string> = {}): OASProgressionRow[] {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => value.trim().length > 0);
  if (activeFilters.length === 0) {
    return items;
  }
  return items.filter((row) => activeFilters.every(([field, value]) => toFilterValue((row as unknown as Record<string, unknown>)[field]).includes(value.trim().toLowerCase())));
}

/**
 * Flat, sortable table view of the same OASProgressionRow[] the heat-map renders from — built on
 * Vuetify's own v-data-table (built-in per-column sorting) rather than a port of
 * DataGrid.tsx/@tanstack/react-table, since @tanstack/vue-table requires Vue 3 (Summit is on
 * Vue 2.7). See PLAN_VUESTAGE_5.md.
 */
export default defineComponent({
  name: "OASProgressionTableVue",
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    columnFilters: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    /**
     * Shares the heat map's own setting, so switching views keeps the same organisation. "skill"
     * groups by the Skill column, "member" by Member, and anything else leaves the table flat.
     */
    groupBy: { type: String as PropType<"skill" | "member" | "none">, default: "none" },
  },
  data() {
    return {
      headers: HEADERS,
    };
  },
  computed: {
    filteredItems(): OASProgressionRow[] {
      return filterOASProgressionRows(this.items, this.columnFilters);
    },
    /**
     * v-data-table takes groupBy as an array of field names; an empty array means "don't group".
     * The page's own "skill"/"member" maps onto this table's column names.
     */
    groupByFields(): string[] {
      if (this.groupBy === "member") return ["memberName"];
      if (this.groupBy === "skill") return ["stream"];
      return [];
    },
    /**
     * The headers v-data-table actually renders, which the #body.prepend filter row must mirror
     * cell for cell.
     *
     * Vuetify drops the grouped column from its own header row (`computedHeaders` filters it out
     * — VDataTable.js:126), since its value is shown in the group heading instead. Iterating the
     * raw `headers` emits one <th> too many, shifting every filter box left of its column — the
     * same bug fixed in PresentAwardsTableVue.
     */
    renderedHeaders(): DataTableHeader[] {
      return this.headers.filter((header) => !this.groupByFields.includes(header.value));
    },
    hasActiveColumnFilters(): boolean {
      return Object.values(this.columnFilters).some((value) => value.trim() !== "");
    },
    // Dropdown option lists, keyed by header value. Skill/Stage/Answered/Awarded are fixed;
    // Stream (branch) and Group (inputGroup) have no fixed constant so their options are derived
    // from ALL loaded items (not filteredItems) — deliberately NOT narrowed by other active
    // filters, so the option list stays stable rather than shifting/shrinking as the user filters
    // other columns.
    columnFilterOptions(): Record<string, Array<{ text: string; value: string }>> {
      const distinctSorted = (field: "branch" | "inputGroup") =>
        Array.from(new Set(this.items.map((row) => row[field])))
          .sort()
          .map((value) => ({ text: value, value }));
      return {
        stream: OAS_SKILLS.map((skill) => ({ text: skill, value: skill })),
        branch: distinctSorted("branch"),
        stage: STAGE_OPTIONS,
        inputGroup: distinctSorted("inputGroup"),
        answered: YES_NO_OPTIONS,
        awarded: YES_NO_OPTIONS,
      };
    },
  },
  methods: {
    // `date` sometimes carries a full ISO timestamp rather than just a date (it can fall back to
    // achievement.status_updated / an imported award timestamp — see buildOASProgressionRows.ts)
    // — trim to the date-only portion for display without touching the shared row-building logic.
    formatDate(date: string | null): string {
      if (!date) {
        return "";
      }
      return date.slice(0, 10);
    },
    onColumnFilterInput(field: string, value: string) {
      this.$emit("update:columnFilters", { ...this.columnFilters, [field]: value });
    },
    onClearFiltersClick() {
      this.$emit("update:columnFilters", {});
    },
  },
});
