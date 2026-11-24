import { defineComponent } from "vue";
import type { PropType } from "vue";

export interface NextStepsFilterOption<T = string> {
  text: string;
  value: T;
}

export default defineComponent({
  name: "OASNextStepsFiltersVue",
  props: {
    memberId: { type: String, required: true },
    memberOptions: { type: Array as PropType<NextStepsFilterOption[]>, required: true },
    skillStream: { type: String, required: true },
    skillStreamOptions: { type: Array as PropType<NextStepsFilterOption[]>, required: true },
    stage: { type: Number as PropType<number | null>, default: null },
    stageOptions: { type: Array as PropType<number[]>, required: true },
  },
  methods: {
    /** Gotcha: v-autocomplete emits null while its text is cleared; ignore it so a member is always chosen. */
    onMemberChange(memberId: string | null) {
      if (memberId) {
        this.$emit("update:memberId", memberId);
      }
    },
  },
});
