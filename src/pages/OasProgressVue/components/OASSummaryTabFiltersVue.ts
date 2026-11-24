import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { NameFormat } from "@/pages/OasProgress/services/getMemberDisplayName";
import NameFormatSelect from "@/components/NameFormatSelect.vue";

export interface SortOption {
  value: string;
  text: string;
}

type ShowOption = "expandStreams" | "showNotStartedSkills" | "breakByPatrol";

type ShowSelectItem = { value: ShowOption; text: string } | { header: string } | { divider: true };

/** Used by the Summary and Peak Award tabs. Each binds its own filter keys with .sync, so the tabs never share filters. */
export default defineComponent({
  name: "OASSummaryTabFiltersVue",
  components: { NameFormatSelect },
  props: {
    memberFilter: { type: String, required: true },
    selectedPatrols: { type: Array as PropType<string[] | null>, default: null },
    sortBy: { type: String, required: true },
    sortOptions: { type: Array as PropType<SortOption[]>, required: true },
    nameFormat: { type: String as PropType<NameFormat>, required: true },
    breakByPatrol: { type: Boolean, required: true },
    /** null leaves the option out. */
    expandStreams: { type: Boolean as PropType<boolean | null>, default: null },
    /** null leaves the "Not Started" option out. */
    showNotStartedSkills: { type: Boolean as PropType<boolean | null>, default: null },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    canFilterByPatrol: { type: Boolean, default: true },
  },
  computed: {
    showOptions(): ShowSelectItem[] {
      const skillItems: ShowSelectItem[] = [];
      if (this.expandStreams !== null) skillItems.push({ value: "expandStreams", text: "Expand Streams" });
      if (this.showNotStartedSkills !== null) skillItems.push({ value: "showNotStartedSkills", text: "Not Started" });
      const items: ShowSelectItem[] = skillItems.length > 0 ? [{ header: "Skills" } as ShowSelectItem].concat(skillItems) : [];
      if (this.availablePatrols.length > 0) {
        if (items.length > 0) items.push({ divider: true });
        items.push({ header: "Grouping" }, { value: "breakByPatrol", text: "Break by patrol" });
      }
      return items;
    },
    /** Gotcha: derived from showOptions so the selection never holds a value missing from `items`. */
    showSelection(): ShowOption[] {
      const values = this.showOptions.filter((item): item is { value: ShowOption; text: string } => "value" in item).map((item) => item.value);
      return values.filter((key) => this[key] === true);
    },
  },
  methods: {
    onShowChange(selected: ShowOption[]) {
      this.showOptions.forEach((item) => {
        if ("value" in item) {
          this.$emit(`update:${item.value}`, selected.includes(item.value));
        }
      });
    },
  },
});
