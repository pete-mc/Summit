import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";

interface DataTableHeader {
  text: string;
  value: string;
  sortable?: boolean;
  filterType?: "text" | "select";
}

export const HEADERS: DataTableHeader[] = [
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
export const DEFAULT_ITEMS_PER_PAGE = 25;

export const YES_NO_OPTIONS = [
  { text: "Yes", value: "true" },
  { text: "No", value: "false" },
];

function toFilterValue(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

/** ANDs all non-empty filters as substring matches. Dropdown values are stored the same way as text. */
export function filterOASProgressionRows(items: OASProgressionRow[], columnFilters: Record<string, string> = {}): OASProgressionRow[] {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => value.trim().length > 0);
  if (activeFilters.length === 0) {
    return items;
  }
  return items.filter((row) => activeFilters.every(([field, value]) => toFilterValue((row as unknown as Record<string, unknown>)[field]).includes(value.trim().toLowerCase())));
}

/** Learning: uses v-data-table because @tanstack/vue-table needs Vue 3. */
export default defineComponent({
  name: "OASProgressionTableVue",
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    columnFilters: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  },
  data() {
    return {
      headers: HEADERS,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
      page: 1,
    };
  },
  computed: {
    filteredItems(): OASProgressionRow[] {
      return filterOASProgressionRows(this.items, this.columnFilters);
    },
    hasActiveColumnFilters(): boolean {
      return Object.values(this.columnFilters).some((value) => value.trim() !== "");
    },
    // Options come from all items, not filteredItems, so the lists don't shrink as other columns are filtered.
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
    // `date` can be a full ISO timestamp.
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
    /** summit-print only prints rendered rows, so show them all. Returns a restore function. */
    async prepareForPrint(): Promise<() => void> {
      const saved = { itemsPerPage: this.itemsPerPage, page: this.page };
      this.itemsPerPage = -1;
      this.page = 1;
      await this.$nextTick();
      return () => {
        this.itemsPerPage = saved.itemsPerPage;
        this.page = saved.page;
      };
    },
    /** Gotcha: a ref on v-data-table is the component, not the <table>. */
    getPrintTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector(".oas-vue-data-table table") ?? undefined;
    },
  },
});
