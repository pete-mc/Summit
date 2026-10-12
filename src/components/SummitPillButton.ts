import { defineComponent } from "vue";
import type { PropType } from "vue";

export type PillVariant = "minor" | "major";

/** Terrain's own colour tokens for each variant, with fallbacks if a page ever loads without them. */
export const PILL_COLOURS: Record<PillVariant, string> = {
  minor: "var(--color-base-blue, #1070ca)",
  major: "var(--color-scouts-medium-blue, #00348d)",
};

/**
 * Summit's one rounded "pill" button, replacing four scoped copies of `.oas-vue-pill-btn`
 * (.claude/Print/PLAN_STAGE_5.md §E; DESIGN.md "A shared component beats a shared class").
 *
 * It reproduces Terrain's own pill button, read live from its DevTools on 2026-10-12:
 *   .medium  — font-size 14px, font-weight 600, height 35px, min-width 80px, padding 0 18px
 *   button   — border-radius 25px
 *   .minor   — white background, 1px --color-base-blue border, --color-base-blue text (outlined)
 *   .major   — --color-scouts-medium-blue background, --color-white text (filled)
 * Terrain's rules are scoped to its own Button component (`.major[data-v-ac713568]`), so its
 * class names can't be reused on Summit's buttons; the values are copied instead.
 *
 * Wraps v-btn, so loading/disabled/icon behaviour is unchanged. Everything else passes straight
 * through ($attrs/$listeners); a class from the parent lands on the button itself, so a page's own
 * scoped rule (e.g. Present Awards' green Save) still applies.
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
    /** Passed to v-btn's color prop, which accepts CSS variables (Vuetify isCssColor). */
    colour(): string {
      return PILL_COLOURS[this.isMinor ? "minor" : "major"];
    },
  },
});
