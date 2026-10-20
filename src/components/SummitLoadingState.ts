import { defineComponent, type PropType } from "vue";

/** Takes normalised props; each page maps its own load state onto `state`. Without counts the bar is indeterminate. */
export default defineComponent({
  name: "SummitLoadingState",
  props: {
    state: { type: String as PropType<"loading" | "ready" | "error">, default: "loading" },
    done: { type: Number, default: undefined },
    total: { type: Number, default: undefined },
    errorMessage: { type: String, default: "Something went wrong loading this page." },
    onRetry: { type: Function as PropType<(() => void) | undefined>, default: undefined },
  },
  computed: {
    /** A total of 0 means "not known yet", so the bar moves instead of sitting at 0%. */
    hasCounts(): boolean {
      return typeof this.done === "number" && typeof this.total === "number" && this.total > 0;
    },
    percent(): number {
      if (!this.hasCounts) return 0;
      return ((this.done as number) / (this.total as number)) * 100;
    },
  },
});
