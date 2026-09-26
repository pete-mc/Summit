import { defineComponent } from "vue";
import type { PropType } from "vue";
import moment from "moment";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";

export interface DataTableHeader {
  text: string;
  value: string;
  sortable?: boolean;
  sort?: (a: unknown, b: unknown) => number;
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

const HEADERS: DataTableHeader[] = [
  { text: "Name", value: "member" },
  { text: "Type", value: "type" },
  { text: "Award", value: "achievementName" },
  { text: "Date", value: "dateAwarded", sort: compareDisplayDates },
  { text: "Presented", value: "presented", sort: compareDisplayDates },
  { text: "Present", value: "present", sortable: false },
];

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
  },
  data() {
    return {
      headers: HEADERS,
      /** Per-row open state for the date-picker menus, keyed by achievement id. */
      openDateMenus: {} as Record<string, boolean>,
    };
  },
  methods: {
    isSelected(item: SummitAchievement): boolean {
      return this.selectedIds.has(item.id);
    },
    /** The date to show for a row: a pending edit if there is one, otherwise what was loaded. */
    presentedValue(item: SummitAchievement): string {
      return this.presentedDates[item.id] ?? (item.presented !== NOT_PRESENTED ? item.presented : "");
    },
    pickerValue(item: SummitAchievement): string | undefined {
      return toPickerDate(this.presentedValue(item));
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
  },
});
