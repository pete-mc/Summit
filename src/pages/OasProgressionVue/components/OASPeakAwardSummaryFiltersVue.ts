import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";

const SORT_OPTIONS: Array<{ value: OASProgressionVueFilterState["summarySortBy"]; text: string }> = [
  { value: "firstName", text: "First Name" },
  { value: "lastName", text: "Last Name" },
  { value: "progress", text: "Progress" },
];

/**
 * Filter bar for the Summary tab (OASPeakAwardSummaryVue) — a small subset of the Heat Map's own
 * OASProgressionFiltersVue: Member/Patrol/Sort by/Name only. The Heat Map's other controls
 * (Skills, Stages, the Show dropdown, Group by, Break by patrol) have no meaning here — the
 * Summary table always shows the same fixed columns (Core Skills, Progressions, Special) for
 * every member, with no stage range or skill visibility to narrow. See
 * .claude/OASProgression/PLAN_PEAK_AWARD_SUMMARY.md.
 */
export default defineComponent({
  name: "OASPeakAwardSummaryFiltersVue",
  components: { NameFormatSelect },
  props: {
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      sortOptions: SORT_OPTIONS,
    };
  },
  methods: {
    patch(partial: Partial<OASProgressionVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    resetFilters() {
      this.$emit("reset");
    },
  },
});
