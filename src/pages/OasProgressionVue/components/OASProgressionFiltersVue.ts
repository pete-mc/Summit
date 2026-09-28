import { defineComponent } from "vue";
import type { PropType } from "vue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

const SKILL_TITLES: Record<string, string> = {
  bushcraft: "Bushcraft",
  bushwalking: "Bushwalking",
  camping: "Camping",
  aquatics: "Aquatics",
  boating: "Boating",
  paddling: "Paddling",
  alpine: "Alpine",
  cycling: "Cycling",
  vertical: "Vertical",
};

const MAX_STAGE = 9;
const STAGE_OPTIONS = Array.from({ length: MAX_STAGE }, (_, i) => i + 1);
const SORT_OPTIONS: Array<{ value: OASProgressionVueFilterState["sortBy"]; text: string }> = [
  { value: "firstName", text: "First Name" },
  { value: "lastName", text: "Last Name" },
  { value: "stageProgress", text: "Stage" },
];

/**
 * Exclusive, so a select rather than a checkbox — see PLAN_GROUP_BY_MEMBER.md.
 *
 * "None" only affects the table view; a heat map is always grouped by something and reads it as
 * Skill. Offered on both rather than swapping the control between views, so the setting stays one
 * shared thing and switching views keeps the same organisation.
 */
const GROUP_BY_OPTIONS: Array<{ value: OASProgressionVueFilterState["groupBy"]; text: string }> = [
  { value: "skill", text: "Skill" },
  { value: "member", text: "Member" },
  { value: "none", text: "None (table only)" },
];

/**
 * Filter bar for OasProgressionVueContent's heat-map, using real Vuetify controls
 * (v-text-field/v-select/v-checkbox) in place of the React page's hand-rolled equivalents —
 * see PLAN_VUESTAGE_3.md for the full feature list and rationale. Owns no state of its own:
 * receives `filters` as a prop and emits `update:filters` with the patched object, so
 * OasProgressionVueContent.vue stays the single source of truth (and the one place that
 * persists to localStorage) — same one-Vue-tree, no-cross-framework-wiring approach VueStage 1
 * established.
 */
export default defineComponent({
  name: "OASProgressionFiltersVue",
  props: {
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
  },
  data() {
    return {
      skillOptions: OAS_SKILLS.map((skill) => ({ value: skill, text: SKILL_TITLES[skill] ?? skill })),
      stageOptions: STAGE_OPTIONS,
      sortOptions: SORT_OPTIONS,
      groupByOptions: GROUP_BY_OPTIONS,
    };
  },
  computed: {
    selectedPatrolsForDisplay(): string[] {
      // Empty selection means "no filter / show all" (see filterMembersByPatrol) — the v-select
      // shows every patrol checked in that state, matching the React page's own DropdownMultiSelect
      // behavior. Unchecking one patrol expands from the full list, not from empty (see
      // onPatrolsChange), so the first click doesn't wrongly narrow to just the other patrols.
      return this.filters.selectedPatrols.length === 0 ? this.availablePatrols : this.filters.selectedPatrols;
    },
  },
  methods: {
    patch(partial: Partial<OASProgressionVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    onStageMinChange(value: number) {
      this.patch({ stageRange: [Math.min(value, this.filters.stageRange[1]), this.filters.stageRange[1]] });
    },
    onStageMaxChange(value: number) {
      this.patch({ stageRange: [this.filters.stageRange[0], Math.max(value, this.filters.stageRange[0])] });
    },
    onUseCodenamesChange(value: boolean) {
      this.patch({ useCodenames: value });
    },
    resetFilters() {
      this.$emit("reset");
    },
  },
});
