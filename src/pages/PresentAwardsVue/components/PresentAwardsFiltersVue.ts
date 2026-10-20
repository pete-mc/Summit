import { defineComponent } from "vue";
import type { PropType } from "vue";

export interface PresentAwardsDisplayFilters {
  showPreviouslyPresented: boolean;
  groupByMember: boolean;
}

export default defineComponent({
  name: "PresentAwardsFiltersVue",
  props: {
    filters: { type: Object as PropType<PresentAwardsDisplayFilters>, required: true },
  },
  methods: {
    patch(change: Partial<PresentAwardsDisplayFilters>) {
      this.$emit("update:filters", { ...this.filters, ...change });
    },
    resetFilters() {
      this.$emit("reset");
    },
  },
});
