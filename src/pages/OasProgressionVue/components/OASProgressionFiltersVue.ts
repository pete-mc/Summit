import { defineComponent } from "vue";
import type { PropType } from "vue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";
import { skillTitle } from "./OASHeatMapVue";

type ShowOption = "showEmptySkillRows" | "showEmptyTopStages" | "showAwarded" | "showNotStarted" | "showAnswered" | "breakByPatrol";

type ShowSelectItem = { value: ShowOption; text: string } | { header: string } | { divider: true };

const SHOW_OPTIONS: Array<{ value: ShowOption; text: string }> = [
  // Label only: the field is still showEmptySkillRows.
  { value: "showEmptySkillRows", text: "Not Started" },
  { value: "showEmptyTopStages", text: "Empty top stages" },
  { value: "showAwarded", text: "Awarded" },
  { value: "showNotStarted", text: "Not started" },
  { value: "showAnswered", text: "Answered" },
  { value: "breakByPatrol", text: "Break by patrol" },
];

const MAX_STAGE = 9;
const STAGE_OPTIONS = Array.from({ length: MAX_STAGE }, (_, i) => i + 1);
const SORT_OPTIONS: Array<{ value: OASProgressionVueFilterState["sortBy"]; text: string }> = [
  { value: "firstName", text: "First Name" },
  { value: "lastName", text: "Last Name" },
  { value: "stageProgress", text: "Stage" },
];

const GROUP_BY_OPTIONS: Array<{ value: OASProgressionVueFilterState["groupBy"]; text: string }> = [
  { value: "skill", text: "Skill" },
  { value: "member", text: "Member" },
];

export default defineComponent({
  name: "OASProgressionFiltersVue",
  components: { NameFormatSelect },
  props: {
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      skillOptions: OAS_SKILLS.map((skill) => ({ value: skill, text: skillTitle(skill) })),
      stageOptions: STAGE_OPTIONS,
      groupByOptions: GROUP_BY_OPTIONS,
    };
  },
  computed: {
    /** "Stage" has no meaning per member, so it's removed when grouped by member. */
    sortOptions(): Array<{ value: OASProgressionVueFilterState["sortBy"]; text: string }> {
      return this.filters.groupBy === "member" ? SORT_OPTIONS.filter((o) => o.value !== "stageProgress") : SORT_OPTIONS;
    },
    showOptions(): ShowSelectItem[] {
      const bySkill = SHOW_OPTIONS.filter((o) => o.value === "showEmptySkillRows" || o.value === "showEmptyTopStages");
      const byIStatement = SHOW_OPTIONS.filter((o) => o.value === "showAwarded" || o.value === "showNotStarted" || o.value === "showAnswered");
      const items: ShowSelectItem[] = [{ header: "Skills" }, ...bySkill, { divider: true }, { header: "I Statements" }, ...byIStatement];
      if (this.availablePatrols.length > 0 && this.filters.groupBy !== "member") {
        items.push({ divider: true }, { header: "Grouping" }, { value: "breakByPatrol", text: "Break by patrol" });
      }
      return items;
    },
    /** Gotcha: derived from showOptions, not SHOW_OPTIONS. A selected value missing from `items` desyncs Vuetify's display. */
    showSelection(): ShowOption[] {
      const selectableValues = this.showOptions.filter((item): item is { value: ShowOption; text: string } => "value" in item).map((item) => item.value);
      return selectableValues.filter((key) => this.filters[key]);
    },
  },
  methods: {
    patch(partial: Partial<OASProgressionVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    onGroupByChange(groupBy: OASProgressionVueFilterState["groupBy"]) {
      const partial: Partial<OASProgressionVueFilterState> = { groupBy };
      if (groupBy === "member" && this.filters.sortBy === "stageProgress") {
        partial.sortBy = "firstName";
      }
      this.patch(partial);
    },
    onShowChange(selected: ShowOption[]) {
      const partial: Partial<OASProgressionVueFilterState> = {};
      SHOW_OPTIONS.forEach((o) => {
        partial[o.value] = selected.includes(o.value);
      });
      this.patch(partial);
    },
    resetFilters() {
      this.$emit("reset");
    },
  },
});
