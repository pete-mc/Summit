import { defineComponent } from "vue";
import type { PropType } from "vue";
import { getPrintProfile, printTable, PAGE_SIZES, type MetaEntry, type PageSettings, type PrintFooter, type PrintHeader } from "@/print/summitPrint";
import { getTerrainPrintContext } from "@/print/printContext";
import { loadPrintSettings, savePrintSettings } from "@/print/printSettings";
import { browserLacksFooterSupport } from "@/print/printSupport";
import { createLogger } from "@/helpers/Logger";

const logger = createLogger("SummitPrintButton");

export const SPLIT_FALLBACK_MESSAGE = (bands: number) => `Too wide for one page even when shrunk, so it was split into ${bands} parts.`;
export const OVERFLOW_MESSAGE = "This table is too wide for the chosen page. Try landscape or A3.";

/** Starting dialog values: the profile's defaults, overridden by this user's last choices for it. */
export function initialPrintSettings(profile: string): PageSettings {
  return { ...getPrintProfile(profile).defaults, ...loadPrintSettings(profile) };
}

/**
 * Print / PDF button + page-setup dialog, shared by every page that prints a table
 * (.claude/Print/PLAN.md). The user picks page size, orientation, margins and layout; the table is
 * re-laid out for that page and Edge's print dialog opens, where they print or "Save as PDF".
 *
 * Fixed wording lives in the profile (src/print/profiles/). Unit, group, section and the section
 * logo are added here from Terrain's active profile, so a page only passes what is specific to it
 * — usually just `meta` describing its filters.
 */
export default defineComponent({
  name: "SummitPrintButton",
  props: {
    /** Registered profile name, see src/print/profiles/. */
    profile: { type: String, required: true },
    /** () => the element containing the table — a function so it is read at click time, after Vuetify has rendered. */
    target: { type: Function as PropType<() => Element | null | undefined>, required: true },
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    /** Merged into the header's meta line by label, e.g. the filters in effect. */
    meta: { type: Array as PropType<MetaEntry[]>, default: undefined },
    header: { type: Object as PropType<PrintHeader>, default: undefined },
    footer: { type: [Object, String] as PropType<PrintFooter | string>, default: undefined },
    /** Extra placeholder values; override the Terrain-derived {unit}/{group}/{section} if given. */
    vars: { type: Object as PropType<Record<string, string>>, default: undefined },
    label: { type: String, default: "Print / PDF" },
  },
  data() {
    return {
      open: false,
      busy: false,
      warn: false,
      warnText: "",
      settings: initialPrintSettings(this.profile),
      // Only a genuinely older browser — not the DevTools test switch (.claude/Print/PLAN_STAGE_3.md).
      lacksFooterSupport: browserLacksFooterSupport(),
      pageSizes: Object.keys(PAGE_SIZES),
      marginItems: [
        { text: "Normal", value: "normal" },
        { text: "Narrow", value: "narrow" },
      ],
    };
  },
  methods: {
    async go() {
      this.busy = true;
      try {
        savePrintSettings(this.profile, this.settings);
        this.open = false;
        await this.$nextTick(); // let the dialog close before the print preview opens

        const source = this.target();
        if (!source) throw new Error("there is nothing to print yet");
        const context = getTerrainPrintContext();
        const result = await printTable({
          source,
          profile: this.profile,
          title: this.title,
          subtitle: this.subtitle,
          meta: this.meta,
          header: this.header,
          footer: this.footer,
          vars: { ...context.vars, ...(this.vars || {}) },
          logo: context.logo,
          ...this.settings,
        });
        if (result.bands > 1 && this.settings.layout === "fit") {
          this.showWarning(SPLIT_FALLBACK_MESSAGE(result.bands));
        } else if (result.overflow) {
          this.showWarning(OVERFLOW_MESSAGE);
        }
      } catch (err) {
        logger.error("Print failed:", err);
        this.showWarning(`Could not prepare the printout: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        this.busy = false;
      }
    },
    showWarning(text: string) {
      this.warnText = text;
      this.warn = true;
    },
  },
});
