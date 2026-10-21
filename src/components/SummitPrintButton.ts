import { defineComponent } from "vue";
import type { PropType } from "vue";
import { getPrintProfile, printTable, PAGE_SIZES, type MetaEntry, type PageSettings, type PrintFooter, type PrintHeader } from "@/print/summitPrint";
import { getTerrainPrintContext } from "@/print/printContext";
import { loadPrintSettings, savePrintSettings } from "@/print/printSettings";
import { browserLacksFooterSupport } from "@/print/printSupport";
import { createLogger } from "@/helpers/Logger";
import SummitPillButton from "@/components/SummitPillButton.vue";

const logger = createLogger("SummitPrintButton");

export const SPLIT_FALLBACK_MESSAGE = (bands: number) => `Too wide for one page even when shrunk, so it was split into ${bands} parts.`;
export const OVERFLOW_MESSAGE = "This table is too wide for the chosen page. Try landscape or A3.";

export function initialPrintSettings(profile: string): PageSettings {
  return { ...getPrintProfile(profile).defaults, ...loadPrintSettings(profile) };
}

/** Adds unit, group, section and logo from Terrain, so a page usually only passes `meta` for its filters. */
export default defineComponent({
  name: "SummitPrintButton",
  components: { SummitPillButton },
  props: {
    profile: { type: String, required: true },
    /** A function, so it's read at click time after Vuetify has rendered. */
    target: { type: Function as PropType<() => Element | null | undefined>, required: true },
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    meta: { type: Array as PropType<MetaEntry[]>, default: undefined },
    header: { type: Object as PropType<PrintHeader>, default: undefined },
    footer: { type: [Object, String] as PropType<PrintFooter | string>, default: undefined },
    vars: { type: Object as PropType<Record<string, string>>, default: undefined },
    label: { type: String, default: "Print / PDF" },
    /** Prepares the table (only rendered rows print) and returns a restore function, which always runs. */
    prepare: { type: Function as PropType<() => Promise<(() => void) | void>>, default: undefined },
  },
  data() {
    return {
      open: false,
      busy: false,
      warn: false,
      warnText: "",
      settings: initialPrintSettings(this.profile),
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
      let restore: (() => void) | void = undefined;
      try {
        savePrintSettings(this.profile, this.settings);
        this.open = false;
        await this.$nextTick();
        if (this.prepare) restore = await this.prepare();

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
        if (restore) {
          try {
            restore();
          } catch (err) {
            logger.error("Could not restore the table after printing:", err);
          }
        }
        this.busy = false;
      }
    },
    showWarning(text: string) {
      this.warnText = text;
      this.warn = true;
    },
  },
});
