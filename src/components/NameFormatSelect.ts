import { defineComponent } from "vue";
import type { PropType } from "vue";
import { NAME_FORMAT_OPTIONS, type NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";

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
