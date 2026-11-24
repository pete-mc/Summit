import { defineComponent } from "vue";
import type { PropType } from "vue";
import { groupNextStepsRows, type NextStepsRow, type NextStepsGroup } from "@/pages/OasProgressVue/services/nextStepsRows";
import { formatAwardDate } from "./OASPeakAwardSummaryVue";

export const HEADERS = [
  { text: "Group", value: "inputGroup" },
  { text: "Answered", value: "answered" },
  { text: "I-Statement", value: "iStatement" },
  { text: "Date", value: "date" },
];

export default defineComponent({
  name: "OASNextStepsVue",
  props: {
    rows: { type: Array as PropType<NextStepsRow[]>, required: true },
  },
  data() {
    return { headers: HEADERS };
  },
  computed: {
    rowGroups(): NextStepsGroup[] {
      return groupNextStepsRows(this.rows);
    },
  },
  methods: {
    formatDate: formatAwardDate,
    /** Gotcha: a ref on v-data-table is the component, not the <table>. */
    getPrintTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector(".oas-vue-data-table table") ?? undefined;
    },
  },
});
