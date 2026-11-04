import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import { listSkillStreams, skillStreamLabel } from "@/pages/OasProgressVue/services/skillStreams";

export { skillStreamLabel };

interface DataTableHeader {
  text: string;
  value: string;
  sortable?: boolean;
  filterType?: "text" | "select" | "member";
}

export type OASTableRow = OASProgressRow & { skillStream: string };

interface FilterOption {
  text: string;
  value: string;
}

/** Gotcha: Member is filtered by memberId outside columnFilters, so "Clear filters" can never leave no member selected. */
export const HEADERS: DataTableHeader[] = [
  { text: "Member", value: "memberName", filterType: "member" },
  { text: "Skill", value: "skillStream", filterType: "select" },
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

const SELECT_FIELDS = HEADERS.filter((h) => h.filterType === "select").map((h) => h.value);

export function listTableMembers(items: OASProgressRow[]): FilterOption[] {
  const byId = new Map<string, OASProgressRow>();
  items.forEach((row) => {
    if (!byId.has(row.memberId)) {
      byId.set(row.memberId, row);
    }
  });
  return Array.from(byId.values())
    .sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName))
    .map((row) => ({ text: row.memberName, value: row.memberId }));
}

export function buildTableRows(items: OASProgressRow[], memberId: string): OASTableRow[] {
  return items.filter((row) => row.memberId === memberId).map((row) => ({ ...row, skillStream: skillStreamLabel(row) }));
}

function listSkillStreamOptions(items: OASProgressRow[]): FilterOption[] {
  return listSkillStreams(items).map((s) => ({ text: s.label, value: s.label }));
}

function toFilterValue(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

/** ANDs all non-empty filters: dropdown columns match exactly, text columns as substrings. */
export function filterOASProgressRows(items: OASTableRow[], columnFilters: Record<string, string> = {}): OASTableRow[] {
  const activeFilters = Object.entries(columnFilters)
    .filter(([, value]) => value.trim().length > 0)
    .map(([field, value]) => ({ field, needle: value.trim().toLowerCase(), exact: SELECT_FIELDS.indexOf(field) !== -1 }));
  if (activeFilters.length === 0) {
    return items;
  }
  return items.filter((row) =>
    activeFilters.every(({ field, needle, exact }) => {
      const cell = toFilterValue((row as unknown as Record<string, unknown>)[field]);
      return exact ? cell === needle : cell.includes(needle);
    }),
  );
}

/** Learning: uses v-data-table because @tanstack/vue-table needs Vue 3. */
export default defineComponent({
  name: "OASProgressTableVue",
  props: {
    items: { type: Array as PropType<OASProgressRow[]>, required: true },
    memberId: { type: String, default: "" },
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
    memberOptions(): FilterOption[] {
      return listTableMembers(this.items);
    },
    filteredItems(): OASTableRow[] {
      return filterOASProgressRows(buildTableRows(this.items, this.memberId), this.columnFilters);
    },
    hasActiveColumnFilters(): boolean {
      return Object.values(this.columnFilters).some((value) => value.trim() !== "");
    },
    // Options come from all items, not filteredItems, so the lists don't shrink as other columns are filtered.
    columnFilterOptions(): Record<string, FilterOption[]> {
      return {
        skillStream: listSkillStreamOptions(this.items),
        stage: STAGE_OPTIONS,
        inputGroup: Array.from(new Set(this.items.map((row) => row.inputGroup)))
          .sort()
          .map((value) => ({ text: value, value })),
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
    onMemberChange(memberId: string | null) {
      if (memberId) {
        this.$emit("update:memberId", memberId);
      }
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
