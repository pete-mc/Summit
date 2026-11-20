import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";

type ShowOption = "summaryShowNotStartedSkills" | "summaryBreakByPatrol";

type ShowSelectItem = { value: ShowOption; text: string } | { header: string } | { divider: true };

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
    availablePatrols: { type: Array as PropType<string[]>, required: true },
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      sortOptions: SORT_OPTIONS,
    };
  },
  computed: {
    showOptions(): ShowSelectItem[] {
      const items: ShowSelectItem[] = [{ header: "Skills" }, { value: "summaryShowNotStartedSkills", text: "Not Started" }];
      if (this.availablePatrols.length > 0) {
        items.push({ divider: true }, { header: "Grouping" }, { value: "summaryBreakByPatrol", text: "Break by patrol" });
      }
      return items;
    },
    /** Gotcha: derived from showOptions so the selection never holds a value missing from `items`. */
    showSelection(): ShowOption[] {
      const selectableValues = this.showOptions.filter((item): item is { value: ShowOption; text: string } => "value" in item).map((item) => item.value);
      return selectableValues.filter((key) => this.filters[key]);
    },
  },
  methods: {
    patch(partial: Partial<OASProgressVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    onShowChange(selected: ShowOption[]) {
      const partial: Partial<OASProgressVueFilterState> = {};
      this.showOptions.forEach((item) => {
        if ("value" in item) {
          partial[item.value] = selected.includes(item.value);
        }
      });
      this.patch(partial);
    },
    resetFilters() {
      this.$emit("reset");
    },
  },
});
