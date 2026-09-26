import { defineComponent } from "vue";
import type { PropType } from "vue";

export interface PresentAwardsDisplayFilters {
  showPreviouslyPresented: boolean;
  groupByMember: boolean;
}

/**
 * Display-options row for the Present Awards page, mirroring OASProgressionFiltersVue's own
 * "Display" fieldset — a legend plus dense v-checkboxes — so the two pages read the same way.
 *
 * These were pill buttons in the header row until the row reached six of them; as checkboxes they
 * also show their current state directly rather than encoding it in a toggling label
 * ("Ungroup" vs "Group by Member"), which always requires a beat of thought to decode.
 *
 * Presentational only: state arrives as a prop and changes go back up as `update:filters` with a
 * partial patch, the same contract OASProgressionFiltersVue uses.
 */
export default defineComponent({
  name: "PresentAwardsFiltersVue",
  props: {
    filters: { type: Object as PropType<PresentAwardsDisplayFilters>, required: true },
  },
  methods: {
    patch(change: Partial<PresentAwardsDisplayFilters>) {
      this.$emit("update:filters", { ...this.filters, ...change });
    },
  },
});
