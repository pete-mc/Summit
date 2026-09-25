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

export const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";

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
 */
export default defineComponent({
  name: "PresentAwardsTableVue",
  props: {
    items: { type: Array as PropType<SummitAchievement[]>, required: true },
  },
  data() {
    return {
      headers: HEADERS,
    };
  },
});
