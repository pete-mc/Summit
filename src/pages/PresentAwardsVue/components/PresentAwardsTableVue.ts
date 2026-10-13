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
  /** Defaults to "text" — a plain filter box. "select" renders a dropdown instead. */
  filterType?: "text" | "select";
  /** Columns with no underlying data (the checkbox) opt out of filtering entirely. */
  filterable?: boolean;
  /** Vuetify header options: class on the <th>, and on each body <td> in this column. */
  class?: string;
  cellClass?: string;
}

/** Marks the Present (tick-box) column so the printout can drop it by class, not position. */
export const PRESENT_HEADER_CLASS = "present-awards-present-header";
export const PRESENT_CELL_CLASS = "present-awards-present-cell";

/** Vuetify 2.7's own v-data-table instance state used by prepareForPrint (see VDataTable.js openCache). */
interface VuetifyDataTable {
  openCache: Record<string, boolean>;
}

/** What the rest of the page (and the storage event) speaks. */
export const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";
/** What v-date-picker speaks. The only place the two formats meet is this component. */
export const PICKER_DATE_FORMAT = "YYYY-MM-DD";

/** Sentinel the model uses for an award that has not been handed over yet. */
export const NOT_PRESENTED = "No";

/**
 * Both date columns hold DD/MM/YYYY *strings* (SummitAchievement formats them for display), so
 * v-data-table's default comparator would sort them lexically — putting 01/12/2025 before
 * 02/01/2024 because it compares "0" to "0" then "1" to "2". Parse before comparing.
 *
 * "No" (an unpresented award) and empty values sort as the earliest possible value, so ascending
 * order reads as "never presented first, then oldest to newest".
 */
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

/** "05/03/2026" -> "2026-03-05". Returns undefined for "No"/blank, so the picker opens on today. */
export function toPickerDate(displayDate: string): string | undefined {
  const parsed = moment(displayDate, DISPLAY_DATE_FORMAT, true);
  return parsed.isValid() ? parsed.format(PICKER_DATE_FORMAT) : undefined;
}

/**
 * "2026-03-05" -> "05/03/2026".
 *
 * Note the 4-digit year: the React page formats this boundary with "DD/MM/YY" while the model and
 * the save path both parse with "DD/MM/YYYY", which only survives because moment is lenient about
 * 2-digit years. This page uses the full year throughout.
 */
export function toDisplayDate(pickerDate: string): string {
  return moment(pickerDate, PICKER_DATE_FORMAT, true).format(DISPLAY_DATE_FORMAT);
}

/** Exported for the printout's filter line, so it uses the table's own column names. */
export const HEADERS: DataTableHeader[] = [
  { text: "Name", value: "member" },
  // Only ~10 achievement types exist and SummitAchievement already normalises them for display,
  // so a dropdown is both short and exhaustive. Award is deliberately left as a text box: there
  // is one distinct value per badge, which would make an unusable dropdown.
  { text: "Type", value: "type", filterType: "select" },
  // The badge artwork is drawn inside this cell, before the name (#item.achievementName in the
  // .vue) — no column of its own (user, 2026-10-12).
  { text: "Award", value: "achievementName" },
  { text: "Date", value: "dateAwarded", sort: compareDisplayDates },
  { text: "Presented", value: "presented", sort: compareDisplayDates, filterType: "select" },
  { text: "Present", value: "present", sortable: false, filterable: false, class: PRESENT_HEADER_CLASS, cellClass: PRESENT_CELL_CLASS },
];

/** Rows per page until the user picks another from the table footer. */
export const DEFAULT_ITEMS_PER_PAGE = 25;

/** v-data-table's default sort locale (VData.js `locale` prop); the table doesn't override it. */
const TABLE_SORT_LOCALE = "en-US";

/** The columns' own comparers, as v-data-table builds them (VDataTable.js columnSorters). */
const COLUMN_SORTERS: Record<string, (a: unknown, b: unknown) => number> = HEADERS.reduce(
  (sorters, header) => {
    if (header.sort) sorters[header.value] = header.sort;
    return sorters;
  },
  {} as Record<string, (a: unknown, b: unknown) => number>,
);

/**
 * The rows in the order v-data-table shows them: Vuetify's own sortItems with the table's current
 * sort and, when grouping, the member column first (ascending), exactly as VData.sortItems does.
 * So the Excel export (.claude/Excel/PLAN_STAGE_3.md) can't disagree with the screen.
 *
 * Note it sorts on the STORED values, as the table does: an unsaved presented date changes what
 * the row shows, not where the table puts it.
 */
export function sortPresentAwardRows(items: SummitAchievement[], sortBy: string[], sortDesc: boolean[], groupByMember: boolean): SummitAchievement[] {
  const by = groupByMember ? ["member"].concat(sortBy) : sortBy;
  const desc = groupByMember ? [false].concat(sortDesc) : sortDesc;
  return sortItems(items.slice(), by, desc, TABLE_SORT_LOCALE, COLUMN_SORTERS);
}

/** One exported row: the values ON SCREEN, including unsaved edits. `presented` is "" when not presented. */
export interface PresentAwardsExportRow {
  member: string;
  type: string;
  award: string;
  dateAwarded: string;
  presented: string;
}

/**
 * The table as the Excel export sees it: filtered, sorted and grouped as on screen, ignoring paging
 * and collapsed groups (as the printout does). Ungrouped: one group with an empty label.
 */
export interface PresentAwardsExportView {
  grouped: boolean;
  groups: Array<{ label: string; rows: PresentAwardsExportRow[] }>;
}

/** Values stored in columnFilters.presented — not substrings of the underlying data. */
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
 * ANDs every non-empty column filter together; empty entries mean "no filter on that column".
 * Matches filterOASProgressionRows' semantics, with one special case.
 *
 * `presented` is not a plain value like the other columns — it is either the literal "No" or a
 * DD/MM/YYYY date. Substring matching cannot express "any date", and matching "no" as a substring
 * would also hit award names containing "no". So this column is matched on meaning rather than
 * text. (The OAS table hit the same class of bug with its Answered/Awarded columns, where typing
 * "yes" matched nothing because the raw value stringified to "true".)
 *
 * `resolvePresented` lets the caller supply the value currently ON SCREEN for a row, so that
 * filtering agrees with the visible state even when an edit has not been saved yet.
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

      return toFilterValue((row as unknown as Record<string, unknown>)[field]).includes(needle);
    }),
  );
}

/**
 * Flat, sortable table of the unit's awarded achievements — built on Vuetify's v-data-table to
 * match the OAS Progression table view (src/pages/OasProgressionVue/components/
 * OASProgressionTableVue.ts) rather than a port of DataGrid.tsx/@tanstack/react-table, since
 * @tanstack/vue-table requires Vue 3 and Summit is on Vue 2.7.
 *
 * Presentational only: the current selection and pending date edits arrive as props, and user
 * intent goes back up as events. All edit state lives in PresentAwardsVueContent.
 */
export default defineComponent({
  name: "PresentAwardsTableVue",
  props: {
    items: { type: Array as PropType<SummitAchievement[]>, required: true },
    // Vue 2 has no constructor check for Set, so declaring `type: Set` logs a spurious
    // invalid-prop warning — the same workaround OasProgressionVueContent.ts uses for
    // loadingStreams.
    selectedIds: { type: null as unknown as PropType<Set<string>>, required: true },
    presentedDates: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    columnFilters: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    groupByMember: { type: Boolean, default: true },
  },
  data() {
    return {
      headers: HEADERS,
      /** Per-row open state for the date-picker menus, keyed by achievement id. */
      openDateMenus: {} as Record<string, boolean>,
      // Bound with .sync rather than literals so prepareForPrint() can show every row and then
      // put the user's own paging back.
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
      page: 1,
      // Bound with .sync so the Excel export can follow the on-screen sort (getExportView).
      sortBy: [] as string[],
      sortDesc: [] as boolean[],
    };
  },
  computed: {
    filteredItems(): SummitAchievement[] {
      return filterPresentAwardRows(this.items, this.columnFilters, (item) => this.presentedValue(item));
    },
    /**
     * v-data-table takes groupBy as an array of field names; an empty array means "don't group".
     * Grouping by `member` (the display name) rather than memberid keeps the group headers
     * readable and sorts them alphabetically for free.
     */
    groupBy(): string[] {
      return this.groupByMember ? ["member"] : [];
    },
    /**
     * The headers v-data-table actually renders, which the #body.prepend filter row must mirror
     * cell for cell.
     *
     * When grouping is on, Vuetify drops the grouped column from its own header row
     * (`computedHeaders` filters it out — VDataTable.js:126), since the value is shown in the
     * group header instead. Iterating the raw `headers` here emitted one <th> too many, shifting
     * every filter box left of its column.
     */
    renderedHeaders(): DataTableHeader[] {
      return this.headers.filter((header) => !this.groupBy.includes(header.value));
    },
    /**
     * Outstanding award count per member name, across ALL filtered rows.
     *
     * Computed here rather than from the group.header slot's own `items`, because VData paginates
     * before it groups (`computedItems` slices, then `groupedItems` groups the slice — see
     * VData.js:156-164). The slot therefore only ever sees the current page's share of a member's
     * awards, so a member with 30 outstanding awards on a 25-row page reported the wrong number.
     */
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
    /**
     * Dropdown options keyed by header value. Type's options come from every row this table was
     * given — deliberately NOT from filteredItems, so choosing one filter never shrinks another
     * column's own option list out from under the user.
     */
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
    /**
     * The date to show for a row: a pending edit if there is one, otherwise what was loaded.
     *
     * An unticked row shows nothing regardless of what is stored — unticking clears the pending
     * date, so falling through to `item.presented` would redisplay the very date just cleared.
     */
    presentedValue(item: SummitAchievement): string {
      if (!this.selectedIds.has(item.id)) return "";
      return this.presentedDates[item.id] ?? (item.presented !== NOT_PRESENTED ? item.presented : "");
    },
    pickerValue(item: SummitAchievement): string | undefined {
      return toPickerDate(this.presentedValue(item));
    },
    /**
     * Group header label, e.g. "Alex Scout (2 not presented)".
     *
     * Counts what is still to hand over rather than the member's total, so the number answers the
     * question actually being asked at a meeting — and it ticks down as rows are checked off.
     * Reads the on-screen value, so it reflects unsaved ticks immediately.
     *
     * Deliberately takes only the group NAME: the count comes from outstandingByMember, which
     * spans every filtered row, not from the slot's own paginated `items`.
     */
    groupLabel(groupName: string): string {
      const outstanding = this.outstandingByMember[groupName] ?? 0;
      return outstanding === 0 ? `${groupName} (all presented)` : `${groupName} (${outstanding} not presented)`;
    },
    /** Artwork URL for a row's badge, or null when only a placeholder is available. */
    badgeIconUrl(item: SummitAchievement): string | null {
      return getBadgeIconUrl(item.badgeKey);
    },
    /** True for wide (non-square) artwork, which needs more width than the 28px icon box. */
    isWideBadge(item: SummitAchievement): boolean {
      return hasWideIcon(item.badgeKey);
    },
    isDateMenuOpen(item: SummitAchievement): boolean {
      return this.openDateMenus[item.id] === true;
    },
    setDateMenuOpen(item: SummitAchievement, isOpen: boolean) {
      // Replaced rather than index-assigned: Vue 2 cannot detect a key added to a reactive
      // object after the fact, so `this.openDateMenus[id] = true` would not re-render the menu.
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
     * Puts every row in the DOM for summit-print, which prints only what is rendered
     * (.claude/Print/PLAN_STAGE_4.md): all rows on one page, every member group open. Returns a
     * restore() that puts the user's paging and collapsed groups back.
     *
     * Groups: Vuetify 2.7 keeps each group's open state in the table's own `openCache`, keyed by
     * group name; a group not in it yet defaults to open, and a collapsed group's rows aren't in
     * the DOM at all (VDataTable.js genGroupedRows/genDefaultGroupedRow).
     */
    async prepareForPrint(): Promise<() => void> {
      const savedPaging = { itemsPerPage: this.itemsPerPage, page: this.page };
      const table = this.$refs.table as unknown as VuetifyDataTable | undefined;
      const savedGroups = table ? { ...table.openCache } : {};

      this.itemsPerPage = -1;
      this.page = 1;
      await this.$nextTick(); // groups from other pages register themselves (as open) on render
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
    /** The rows for the Excel export, as on screen. See PresentAwardsExportView. */
    getExportView(): PresentAwardsExportView {
      const sorted = sortPresentAwardRows(this.filteredItems, this.sortBy, this.sortDesc, this.groupByMember);
      const toRow = (item: SummitAchievement): PresentAwardsExportRow => ({
        member: item.member,
        type: item.type,
        award: item.achievementName,
        dateAwarded: item.dateAwarded,
        presented: this.presentedValue(item),
      });
      if (!this.groupByMember) {
        return { grouped: false, groups: [{ label: "", rows: sorted.map(toRow) }] };
      }
      // Sorted by member first, so each member's rows are already together.
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
    /** The <table> for summit-print. A method, since a ref on v-data-table is a component, not an element. */
    getPrintTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector(".present-awards-data-table table") ?? undefined;
    },
  },
});
