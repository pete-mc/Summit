import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";

const SORT_OPTIONS: Array<{ value: OASProgressVueFilterState["summarySortBy"]; text: string }> = [
  { value: "firstName", text: "First Name" },
  { value: "lastName", text: "Last Name" },
  { value: "progress", text: "Progress" },
];

export default defineComponent({
  name: "OASPeakAwardSummaryFiltersVue",
  components: { NameFormatSelect },
  props: {
    filters: { type: Object as PropType<OASProgressVueFilterState>, required: true },
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      sortOptions: SORT_OPTIONS,
    };
  },
  methods: {
    patch(partial: Partial<OASProgressVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    resetFilters() {
      this.$emit("reset");
    },
  },
});
