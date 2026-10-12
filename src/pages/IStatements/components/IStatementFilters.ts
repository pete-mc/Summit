import { defineComponent, type PropType } from "vue";
import { OAS_STREAMS } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { ALL_STAGES, type IStatementFilters } from "../services/filterIStatementMatrix";
import { titleCaseSegment } from "../services/buildIStatementMatrix";
import SummitPillButton from "@/components/SummitPillButton.vue";

export default defineComponent({
  name: "IStatementFilters",
  components: { SummitPillButton },
  props: {
    filters: { type: Object as PropType<IStatementFilters>, required: true },
  },
  computed: {
    skillOptions(): Array<{ text: string; value: string }> {
      return OAS_STREAMS.map((skill) => ({ text: titleCaseSegment(skill), value: skill }));
    },
    stageOptions(): number[] {
      return ALL_STAGES;
    },
  },
  methods: {
    patch(partial: Partial<IStatementFilters>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    // Dragging one end of the range past the other pushes the other end along, rather
    // than leaving an inverted range that silently renders an empty table.
    onStageFromChange(stageFrom: number) {
      this.patch({ stageFrom, stageTo: Math.max(stageFrom, this.filters.stageTo) });
    },
    onStageToChange(stageTo: number) {
      this.patch({ stageTo, stageFrom: Math.min(stageTo, this.filters.stageFrom) });
    },
  },
});
