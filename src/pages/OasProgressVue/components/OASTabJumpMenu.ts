import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { TabJump } from "@/pages/OasProgressVue/services/tabJumps";

export default defineComponent({
  name: "OASTabJumpMenu",
  props: {
    jumps: { type: Array as PropType<TabJump[]>, required: true },
    label: { type: String, default: "Open in another tab" },
  },
  methods: {
    onSelect(jump: TabJump) {
      this.$emit("jump", jump);
    },
  },
});
