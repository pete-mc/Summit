import { defineComponent } from "vue";
import type { PropType } from "vue";
import { NAME_FORMAT_OPTIONS, type NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";

/**
 * Shared "Names" display-format dropdown — single-select, replaces the old pair of
 * "Use codenames" / "Hide last name" checkboxes wherever member names are shown. One
 * definition in src/components/ so new pages can reuse it rather than copying the control,
 * per .claude/DESIGN.md's "a shared component beats a shared class" (see SummitLoadingState.vue).
 *
 * Owns no state: receives the current NameFormat as `value` (v-model) and emits `input`.
 */
export default defineComponent({
  name: "NameFormatSelect",
  props: {
    value: { type: String as PropType<NameFormat>, required: true },
  },
  data() {
    return {
      options: NAME_FORMAT_OPTIONS,
    };
  },
});
