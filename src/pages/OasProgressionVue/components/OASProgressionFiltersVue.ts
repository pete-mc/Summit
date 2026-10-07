import { defineComponent } from "vue";
import type { PropType } from "vue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";

/**
 * "Show" dropdown — positive-selection framing (all on by default) replacing the original
 * "Hide" dropdown's double negative; see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
 * "breakByPatrol" is included here as a 6th selectable item (its own "Grouping" subheader) since
 * it was the sole remaining item in the old Display fieldset once Names/Show absorbed the rest.
 */
type ShowOption = "showEmptySkillRows" | "showEmptyTopStages" | "showAwarded" | "showNotStarted" | "showAnswered" | "breakByPatrol";

type ShowSelectItem = { value: ShowOption; text: string } | { header: string } | { divider: true };

const SHOW_OPTIONS: Array<{ value: ShowOption; text: string }> = [
  // Label text only — DEV_NOTES.md: "Change text: Show > Empty Skills to Show > Not Started"
  // (the Skills-section item, not the I-Statement "Not started" state option below; the
  // underlying field, showEmptySkillRows, is unchanged).
  { value: "showEmptySkillRows", text: "Not Started" },
  { value: "showEmptyTopStages", text: "Empty top stages" },
  { value: "showAwarded", text: "Awarded" },
  { value: "showNotStarted", text: "Not started" },
  { value: "showAnswered", text: "Answered" },
  { value: "breakByPatrol", text: "Break by patrol" },
];

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
 * Heat-map only: the table view's own grouping was built and then removed, because how it should
 * behave alongside that view's sorting and per-column filters needs more thought than it had.
 */
const GROUP_BY_OPTIONS: Array<{ value: OASProgressionVueFilterState["groupBy"]; text: string }> = [
  { value: "skill", text: "Skill" },
  { value: "member", text: "Member" },
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
  components: { NameFormatSelect },
  props: {
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
    /**
     * The Patrol filter dropdown's own item list — named patrols plus "Unassigned" when at
     * least one member has no patrol. Deliberately not the same as availablePatrols (used
     * elsewhere for "is there anything to group by" checks, where a synthetic "Unassigned"
     * entry would be wrong) — see OasProgressionVueContent.ts's own comment on this split.
     */
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    /**
     * Whether the Patrol filter control has any real choice to offer — false when
     * patrolFilterOptions has at most one entry (nothing to narrow between). Gates the Patrol
     * v-select's own visibility; see canFilterByPatrol in OasProgressionVueContent.ts and
     * .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
     */
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      skillOptions: OAS_SKILLS.map((skill) => ({ value: skill, text: SKILL_TITLES[skill] ?? skill })),
      stageOptions: STAGE_OPTIONS,
      groupByOptions: GROUP_BY_OPTIONS,
    };
  },
  computed: {
    /**
     * "Stage" has no single-member meaning when grouped by member (a person has one stage per
     * skill, not one overall), so it's omitted from the options entirely rather than shown
     * disabled — see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
     */
    sortOptions(): Array<{ value: OASProgressionVueFilterState["sortBy"]; text: string }> {
      return this.filters.groupBy === "member" ? SORT_OPTIONS.filter((o) => o.value !== "stageProgress") : SORT_OPTIONS;
    },
    /**
     * The "Show" dropdown's items, with Vuetify subheader/divider entries grouping the five
     * boolean options under "Skills"/"I Statements", plus "Break by patrol" under its own
     * "Grouping" subheader — included only when there's something to group by, matching the old
     * Display fieldset's own v-if gating.
     */
    showOptions(): ShowSelectItem[] {
      const bySkill = SHOW_OPTIONS.filter((o) => o.value === "showEmptySkillRows" || o.value === "showEmptyTopStages");
      const byIStatement = SHOW_OPTIONS.filter((o) => o.value === "showAwarded" || o.value === "showNotStarted" || o.value === "showAnswered");
      const items: ShowSelectItem[] = [{ header: "Skills" }, ...bySkill, { divider: true }, { header: "I Statements" }, ...byIStatement];
      if (this.availablePatrols.length > 0 && this.filters.groupBy !== "member") {
        items.push({ divider: true }, { header: "Grouping" }, { value: "breakByPatrol", text: "Break by patrol" });
      }
      return items;
    },
    /**
     * The "Show" multi-select's own value: which of the currently-offered options are on. Derived
     * from `showOptions` (not the static SHOW_OPTIONS list) so a selection never includes
     * "breakByPatrol" while that item isn't actually present in the dropdown (no patrols, or
     * grouped by member) — an item value absent from `items` would otherwise desync Vuetify's
     * displayed selection from what the dropdown can actually show.
     */
    showSelection(): ShowOption[] {
      const selectableValues = this.showOptions.filter((item): item is { value: ShowOption; text: string } => "value" in item).map((item) => item.value);
      return selectableValues.filter((key) => this.filters[key]);
    },
  },
  methods: {
    patch(partial: Partial<OASProgressionVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    /**
     * Switching to "member" while sorted by Stage would leave sortBy pointing at an option the
     * dropdown no longer offers (sortOptions above) — reset it to firstName so the UI and the
     * actual sort stay in sync, rather than showing a blank/stale selection.
     */
    onGroupByChange(groupBy: OASProgressionVueFilterState["groupBy"]) {
      const partial: Partial<OASProgressionVueFilterState> = { groupBy };
      if (groupBy === "member" && this.filters.sortBy === "stageProgress") {
        partial.sortBy = "firstName";
      }
      this.patch(partial);
    },
    /** Maps the multi-select's array value back onto the independent booleans it represents. */
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
