import { defineComponent } from "vue";
import type { PropType } from "vue";
import moment from "moment";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { sortItems } from "vuetify/es5/util/helpers";
import { getBadgeIconUrl, hasWideIcon } from "../services/getBadgeIconUrl";

export interface DataTableHeader {
  text: string;
  value: string;
  sortable?: boolean;
  sort?: (a: unknown, b: unknown) => number;
  filterType?: "text" | "select";
  filterable?: boolean;
  class?: string;
  cellClass?: string;
}

/** Lets the printout drop the tick-box column by class, not position. */
export const PRESENT_HEADER_CLASS = "present-awards-present-header";
export const PRESENT_CELL_CLASS = "present-awards-present-cell";

interface VuetifyDataTable {
  openCache: Record<string, boolean>;
}

export const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";
export const PICKER_DATE_FORMAT = "YYYY-MM-DD";

export const NOT_PRESENTED = "No";

/** Gotcha: DD/MM/YYYY strings sort wrongly as text, so parse them. "No" and blank sort earliest. */
export function compareDisplayDates(a: unknown, b: unknown): number {
  const toTimestamp = (value: unknown): number => {
    const parsed = moment(String(value ?? ""), DISPLAY_DATE_FORMAT, true);
    return parsed.isValid() ? parsed.valueOf() : Number.NEGATIVE_INFINITY;
  };
  const left = toTimestamp(a);
  const right = toTimestamp(b);
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function comparePresentedStatus(a: unknown, b: unknown): number {
  const isPresented = (value: unknown) => (value && value !== NOT_PRESENTED ? 1 : 0);
  return isPresented(a) - isPresented(b);
}

/** Undefined for "No"/blank, so the picker opens on today. */
export function toPickerDate(displayDate: string): string | undefined {
  const parsed = moment(displayDate, DISPLAY_DATE_FORMAT, true);
  return parsed.isValid() ? parsed.format(PICKER_DATE_FORMAT) : undefined;
}

/** Gotcha: use a 4-digit year. The React page uses "DD/MM/YY" and only works because moment is lenient. */
export function toDisplayDate(pickerDate: string): string {
  return moment(pickerDate, PICKER_DATE_FORMAT, true).format(DISPLAY_DATE_FORMAT);
}

export const HEADERS: DataTableHeader[] = [
  { text: "Name", value: "member" },
  // Award stays a text box: one value per badge would make an unusable dropdown.
  { text: "Type", value: "type", filterType: "select" },
  { text: "Award", value: "achievementName" },
  { text: "Date Awarded", value: "dateAwarded", sort: compareDisplayDates },
  // The Yes/No column keeps the `presented` key so saved filters still apply.
  { text: "Date Presented", value: "presentedDate", sort: compareDisplayDates },
  { text: "Presented", value: "presented", sort: comparePresentedStatus, filterType: "select" },
  { text: "Present", value: "present", sortable: false, filterable: false, class: PRESENT_HEADER_CLASS, cellClass: PRESENT_CELL_CLASS },
];

export const DEFAULT_ITEMS_PER_PAGE = 25;

const TABLE_SORT_LOCALE = "en-US";

const COLUMN_SORTERS: Record<string, (a: unknown, b: unknown) => number> = HEADERS.reduce(
  (sorters, header) => {
    if (header.sort) sorters[header.value] = header.sort;
    return sorters;
  },
  {} as Record<string, (a: unknown, b: unknown) => number>,
);

/** Mirrors VData.sortItems so the Excel export matches the screen. Sorts on stored values, as the table does. */
export function sortPresentAwardRows(items: SummitAchievement[], sortBy: string[], sortDesc: boolean[], groupByMember: boolean): SummitAchievement[] {
  const by = groupByMember ? ["member"].concat(sortBy) : sortBy;
  const desc = groupByMember ? [false].concat(sortDesc) : sortDesc;
  return sortItems(items.slice(), by, desc, TABLE_SORT_LOCALE, COLUMN_SORTERS);
}

/** On-screen values, including unsaved edits. */
export interface PresentAwardsExportRow {
  member: string;
  type: string;
  award: string;
  dateAwarded: string;
  presented: string;
  present: boolean;
}

/** Ignores paging and collapsed groups, as the printout does. */
export interface PresentAwardsExportView {
  grouped: boolean;
  groups: Array<{ label: string; rows: PresentAwardsExportRow[] }>;
}

export const PRESENTED_FILTER_YES = "presented";
export const PRESENTED_FILTER_NO = "no";

const PRESENTED_OPTIONS = [
  { text: "Yes", value: PRESENTED_FILTER_YES },
  { text: "No", value: PRESENTED_FILTER_NO },
];

function toFilterValue(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

/**
 * Gotcha: `presented` holds "No" or a date, so it is matched on meaning, not substring ("no" would match award names).
 * `resolvePresented` gives the on-screen value, so unsaved edits filter correctly.
 */
export function filterPresentAwardRows(
  items: SummitAchievement[],
  columnFilters: Record<string, string> = {},
  resolvePresented: (item: SummitAchievement) => string = (item) => (item.presented !== NOT_PRESENTED ? item.presented : ""),
): SummitAchievement[] {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => value.trim().length > 0);
  if (activeFilters.length === 0) {
    return items;
  }

  return items.filter((row) =>
    activeFilters.every(([field, value]) => {
      const needle = value.trim().toLowerCase();

      if (field === "presented") {
        const isPresented = resolvePresented(row).length > 0;
        return needle === PRESENTED_FILTER_YES ? isPresented : !isPresented;
      }
      if (field === "presentedDate") {
        return resolvePresented(row).toLowerCase().includes(needle);
      }

      return toFilterValue((row as unknown as Record<string, unknown>)[field]).includes(needle);
    }),
  );
}

/** Presentational only: selection and pending edits come in as props; all edit state is in PresentAwardsVueContent. */
export default defineComponent({
  name: "PresentAwardsTableVue",
  props: {
    items: { type: Array as PropType<SummitAchievement[]>, required: true },
    // Gotcha: Vue 2 can't type-check a Set prop.
    selectedIds: { type: null as unknown as PropType<Set<string>>, required: true },
    presentedDates: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    columnFilters: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    groupByMember: { type: Boolean, default: true },
  },
  data() {
    return {
      headers: HEADERS,
      openDateMenus: {} as Record<string, boolean>,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
      page: 1,
      sortBy: [] as string[],
      sortDesc: [] as boolean[],
    };
  },
  computed: {
    filteredItems(): SummitAchievement[] {
      return filterPresentAwardRows(this.items, this.columnFilters, (item) => this.presentedValue(item));
    },
    groupBy(): string[] {
      return this.groupByMember ? ["member"] : [];
    },
    /** Gotcha: when grouping, Vuetify drops the grouped column from its header (VDataTable.js computedHeaders). The filter row must match it. */
    renderedHeaders(): DataTableHeader[] {
      return this.headers.filter((header) => !this.groupBy.includes(header.value));
    },
    /** Gotcha: VData paginates before it groups, so the group slot's `items` only covers the current page. Count across all rows here. */
    outstandingByMember(): Record<string, number> {
      return this.filteredItems.reduce(
        (counts, item) => {
          if (!this.presentedValue(item)) {
            counts[item.member] = (counts[item.member] ?? 0) + 1;
          }
          return counts;
        },
        {} as Record<string, number>,
      );
    },
    /** From all rows, not filteredItems, so one filter never shrinks another's options. */
    columnFilterOptions(): Record<string, Array<{ text: string; value: string }>> {
      return {
        type: Array.from(new Set(this.items.map((item) => item.type)))
          .sort()
          .map((value) => ({ text: value, value })),
        presented: PRESENTED_OPTIONS,
      };
    },
  },
  methods: {
    isSelected(item: SummitAchievement): boolean {
      return this.selectedIds.has(item.id);
    },
    /** Gotcha: an unticked row shows nothing, or the just-cleared stored date would reappear. */
    presentedValue(item: SummitAchievement): string {
      if (!this.selectedIds.has(item.id)) return "";
      return this.presentedDates[item.id] ?? (item.presented !== NOT_PRESENTED ? item.presented : "");
    },
    pickerValue(item: SummitAchievement): string | undefined {
      return toPickerDate(this.presentedValue(item));
    },
    /** Counts outstanding awards, including unsaved ticks, so it counts down during a meeting. */
    groupLabel(groupName: string): string {
      const outstanding = this.outstandingByMember[groupName] ?? 0;
      return outstanding === 0 ? `${groupName} (all presented)` : `${groupName} (${outstanding} not presented)`;
    },
    badgeIconUrl(item: SummitAchievement): string | null {
      return getBadgeIconUrl(item.badgeKey);
    },
    isWideBadge(item: SummitAchievement): boolean {
      return hasWideIcon(item.badgeKey);
    },
    isDateMenuOpen(item: SummitAchievement): boolean {
      return this.openDateMenus[item.id] === true;
    },
    setDateMenuOpen(item: SummitAchievement, isOpen: boolean) {
      // Gotcha: Vue 2 can't detect a newly added key, so replace the object.
      this.openDateMenus = { ...this.openDateMenus, [item.id]: isOpen };
    },
    onTogglePresent(item: SummitAchievement, isSelected: boolean) {
      this.$emit("toggle-present", item, isSelected);
    },
    onDateInput(item: SummitAchievement, pickerDate: string) {
      this.$emit("update-date", item, toDisplayDate(pickerDate));
      this.setDateMenuOpen(item, false);
    },
    onColumnFilterInput(field: string, value: string) {
      this.$emit("update:columnFilters", { ...this.columnFilters, [field]: value });
    },
    /**
     * summit-print only prints rendered rows, so show every row and open every group. Returns a restore function.
     * Learning: Vuetify 2.7 keeps group open state in the table's `openCache`; collapsed groups aren't in the DOM.
     */
    async prepareForPrint(): Promise<() => void> {
      const savedPaging = { itemsPerPage: this.itemsPerPage, page: this.page };
      const table = this.$refs.table as unknown as VuetifyDataTable | undefined;
      const savedGroups = table ? { ...table.openCache } : {};

      this.itemsPerPage = -1;
      this.page = 1;
      await this.$nextTick();
      if (table) {
        Object.keys(table.openCache).forEach((group) => this.$set(table.openCache, group, true));
        await this.$nextTick();
      }

      return () => {
        if (table) {
          Object.keys(savedGroups).forEach((group) => this.$set(table.openCache, group, savedGroups[group]));
        }
        this.itemsPerPage = savedPaging.itemsPerPage;
        this.page = savedPaging.page;
      };
    },
    getExportView(): PresentAwardsExportView {
      const sorted = sortPresentAwardRows(this.filteredItems, this.sortBy, this.sortDesc, this.groupByMember);
      const toRow = (item: SummitAchievement): PresentAwardsExportRow => ({
        member: item.member,
        type: item.type,
        award: item.achievementName,
        dateAwarded: item.dateAwarded,
        presented: this.presentedValue(item),
        present: this.isSelected(item),
      });
      if (!this.groupByMember) {
        return { grouped: false, groups: [{ label: "", rows: sorted.map(toRow) }] };
      }
      const groups: PresentAwardsExportView["groups"] = [];
      let current: string | null = null;
      sorted.forEach((item) => {
        if (item.member !== current) {
          current = item.member;
          groups.push({ label: this.groupLabel(item.member), rows: [] });
        }
        groups[groups.length - 1].rows.push(toRow(item));
      });
      return { grouped: true, groups };
    },
    /** Gotcha: a ref on v-data-table is the component, not the <table>. */
    getPrintTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector(".present-awards-data-table table") ?? undefined;
    },
  },
});
