import { defineComponent, type PropType } from "vue";

/**
 * The one loading/error display for Summit's Vue pages.
 *
 * Takes NORMALISED props rather than any page's own state shape. The three pages describe
 * progress differently — I Statements has a four-value loadState, Present Awards a three-value
 * one, OAS Progression a Set of in-flight stream names — and teaching this component all three
 * vocabularies would make it grow a branch per page. Each page maps onto `state` instead.
 *
 * Counts are optional: omit them and the bar is indeterminate, supply them and it fills. That is
 * what lets one component cover both of I Statements' phases.
 */
export default defineComponent({
  name: "SummitLoadingState",
  props: {
    state: { type: String as PropType<"loading" | "ready" | "error">, default: "loading" },
    /** Items finished. Omit (with `total`) for an indeterminate bar. */
    done: { type: Number, default: undefined },
    /** Items expected. */
    total: { type: Number, default: undefined },
    errorMessage: { type: String, default: "Something went wrong loading this page." },
    /** Omit to render no Retry button — for a page with nothing useful to retry. */
    onRetry: { type: Function as PropType<(() => void) | undefined>, default: undefined },
  },
  computed: {
    /**
     * A total of 0 counts as "no counts": it means the page has not worked out how much work
     * there is yet, and dividing by it would peg the bar at 0% rather than showing motion.
     */
    hasCounts(): boolean {
      return typeof this.done === "number" && typeof this.total === "number" && this.total > 0;
    },
    percent(): number {
      if (!this.hasCounts) return 0;
      return ((this.done as number) / (this.total as number)) * 100;
    },
  },
});
