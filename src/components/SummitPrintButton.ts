import { defineComponent } from "vue";
import type { PropType } from "vue";
import { getPrintProfile, printTable, printTables, PAGE_SIZES, type LayoutResult, type MetaEntry, type Orientation, type PageSettings, type PrintFooter, type PrintHeader, type PrintLayout } from "@/print/summitPrint";
import { getTerrainPrintContext } from "@/print/printContext";
import { loadPrintSettings, savePrintSettings } from "@/print/printSettings";
import { browserLacksFooterSupport } from "@/print/printSupport";
import { createLogger } from "@/helpers/Logger";
import { showTerrainToast } from "@/helpers/TerrainToast";
import SummitPillButton from "@/components/SummitPillButton.vue";

const logger = createLogger("SummitPrintButton");

export const SPLIT_FALLBACK_MESSAGE = (bands: number) => `Too wide for one page even when shrunk, so it was split into ${bands} parts.`;
export const OVERFLOW_MESSAGE = "This table is too wide for the chosen page. Try landscape or A3.";

export function initialPrintSettings(profile: string): PageSettings {
  return { ...getPrintProfile(profile).defaults, ...loadPrintSettings(profile) };
}

export interface PrintButtonPart {
  label: string;
  profile: string;
  target: () => Element | null | undefined;
  prepare?: () => Promise<(() => void) | void>;
}

/** Gotcha: one page setup for every table, landscape if any prefers it. Edge prints every page at the first page's size. */
export function initialMultiPartSettings(settingsKey: string, parts: PrintButtonPart[]): PageSettings {
  const orientation: Orientation = parts.some((p) => getPrintProfile(p.profile).defaults.orientation === "landscape") ? "landscape" : "portrait";
  return { ...getPrintProfile(parts[0]?.profile).defaults, orientation, ...loadPrintSettings(settingsKey) };
}

/** Adds unit, group, section and logo from Terrain, so a page usually only passes `meta` for its filters. */
export default defineComponent({
  name: "SummitPrintButton",
  components: { SummitPillButton },
  props: {
    profile: { type: String, default: "" },
    /** A function, so it's read at click time after Vuetify has rendered. */
    target: { type: Function as PropType<() => Element | null | undefined>, default: undefined },
    /** Replaces profile/target/prepare to print several tables as one printout. */
    parts: { type: Array as PropType<PrintButtonPart[]>, default: undefined },
    settingsKey: { type: String, default: "" },
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
      settings: this.parts?.length ? initialMultiPartSettings(this.settingsKey, this.parts) : initialPrintSettings(this.profile),
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
      const restores: Array<() => void> = [];
      try {
        this.open = false;
        await this.$nextTick();
        if (this.parts?.length) {
          await this.printParts(restores);
        } else {
          await this.printSingle(restores);
        }
      } catch (err) {
        logger.error("Print failed:", err);
        showTerrainToast(`Could not prepare the printout: ${err instanceof Error ? err.message : String(err)}`, "error");
      } finally {
        restores.forEach((restore) => {
          try {
            restore();
          } catch (err) {
            logger.error("Could not restore the table after printing:", err);
          }
        });
        this.busy = false;
      }
    },
    async printSingle(restores: Array<() => void>) {
      savePrintSettings(this.profile, this.settings);
      if (this.prepare) {
        const restore = await this.prepare();
        if (restore) restores.push(restore);
      }
      const source = this.target?.();
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
      this.warnAboutLayout([result], [this.settings.layout]);
    },
    async printParts(restores: Array<() => void>) {
      const parts = this.parts ?? [];
      savePrintSettings(this.settingsKey, this.settings);
      for (const part of parts) {
        const restore = part.prepare ? await part.prepare() : undefined;
        if (restore) restores.push(restore);
      }
      const sources = parts.map((p) => p.target());
      if (sources.some((s) => !s)) throw new Error("there is nothing to print yet");

      const context = getTerrainPrintContext();
      const results = await printTables({
        parts: parts.map((p, i) => ({ source: sources[i] as Element, profile: p.profile })),
        meta: this.meta,
        footer: this.footer,
        vars: { ...context.vars, ...(this.vars || {}) },
        logo: context.logo,
        ...this.settings,
      });
      this.warnAboutLayout(
        results,
        parts.map(() => this.settings.layout),
        parts.map((p) => p.label),
      );
    },
    warnAboutLayout(results: LayoutResult[], layouts: PrintLayout[], labels: string[] = []) {
      const named = (i: number, text: string) => (labels[i] ? `${labels[i]}: ${text}` : text);
      const messages = results
        .map((result, i) => {
          if (result.bands > 1 && layouts[i] === "fit") return named(i, SPLIT_FALLBACK_MESSAGE(result.bands));
          if (result.overflow) return named(i, OVERFLOW_MESSAGE);
          return "";
        })
        .filter((m) => m !== "");
      if (messages.length) showTerrainToast(messages.join(" "), "info");
    },
  },
});
