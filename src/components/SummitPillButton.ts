import { defineComponent } from "vue";
import type { PropType } from "vue";

export type PillVariant = "minor" | "major";

export const PILL_COLOURS: Record<PillVariant, string> = {
  minor: "var(--color-base-blue, #1070ca)",
  major: "var(--color-scouts-medium-blue, #00348d)",
};

/**
 * Copies Terrain's pill button values (read live). Gotcha: Terrain's classes are scoped to its own component
 * (`.major[data-v-ac713568]`), so they can't be reused. Attrs and listeners pass through to v-btn.
 */
export default defineComponent({
  name: "SummitPillButton",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<PillVariant>, default: "minor" },
  },
  computed: {
    isMinor(): boolean {
      return this.variant !== "major";
    },
    colour(): string {
      return PILL_COLOURS[this.isMinor ? "minor" : "major"];
    },
  },
});
