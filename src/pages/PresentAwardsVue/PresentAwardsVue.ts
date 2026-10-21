import Vue from "vue";
import { defineComponent } from "vue";
import PresentAwardsVueContent from "./components/PresentAwardsVueContent.vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { loadPresentedAwards, savePresentedAwards } from "@/pages/PresentAwards/services/awardStorageEvent";
import type { TerrainEvent } from "@/types/terrainTypes";
import { createLogger } from "@/helpers";
import { TerrainRootState } from "@/types/terrainState";

const logger = createLogger("PresentAwardsVue");

/** Gotcha: content mounts as a second Vue instance, because Terrain's Vue has no Vuetify components (see OasProgressionVue.ts). */
interface ContentInstance {
  items: SummitAchievement[];
  loadState: string;
  $mount(el: HTMLElement): void;
  $destroy(): void;
}

export interface PresentAwardsSaveOutcome {
  error?: string;
  mergeNotice?: string;
}

function data() {
  return {
    items: [] as SummitAchievement[],
    storeEvent: undefined as TerrainEvent | undefined,
    contentInstance: undefined as ContentInstance | undefined,
    loadState: "loading" as string,
  };
}

export default defineComponent({
  name: "PresentAwardsVue",
  data,
  watch: {
    items() {
      this.renderContent();
    },
    loadState() {
      this.renderContent();
    },
  },
  mounted() {
    // Gotcha: mount before loading. renderContent() no-ops until the instance exists, so the page would stay blank.
    this.mountContentComponent();
    this.loadAwards();
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      { text: "Summit", disabled: false, to: "/summit/home", exact: true },
      { text: "Tools", disabled: true, to: "/summit/tools", exact: true },
      { text: "Present Awards", disabled: true, to: "/summit/tools/PresentAwards", exact: true },
    ];
  },
  beforeDestroy() {
    this.unmountContentComponent();
  },
  methods: {
    async loadAwards() {
      try {
        this.loadState = "loading";
        const { storeEvent, items } = await loadPresentedAwards();
        this.storeEvent = storeEvent;
        this.items = items;
        this.loadState = "ready";
      } catch (e) {
        logger.error("failed to load presented awards:", e);
        this.loadState = "error";
      }
    },
    /** Returns an error, a merge notice, or null for a plain save. */
    async saveAwards(presentedItems: SummitAchievement[]): Promise<PresentAwardsSaveOutcome> {
      try {
        const result = await savePresentedAwards(this.storeEvent, presentedItems);
        if (!result.ok) {
          logger.error("failed to save presented awards:", result.rawMessage);
          return { error: result.topLevelMessages.join(" ") };
        }
        // Reload so the edit state matches what is now stored.
        await this.loadAwards();

        if (result.mergedWith !== undefined) {
          const at = result.mergedWith ? ` at ${result.mergedWith.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "";
          return { mergeNotice: `Saved. Someone else had also made changes${at}; both sets have been kept.` };
        }
        return {};
      } catch (e) {
        logger.error("failed to save presented awards:", e);
        return { error: e instanceof Error ? e.message : String(e) };
      }
    },
    mountContentComponent() {
      // Gotcha: `any` avoids TS2589 from Vue.extend's inferred type.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ContentApp: any = Vue.extend(PresentAwardsVueContent);
      this.contentInstance = new ContentApp({
        vuetify: window.summitVuetify,
        propsData: {
          items: this.items,
          loadState: this.loadState,
          onSave: this.saveAwards,
          onReload: this.loadAwards,
        },
      }) as ContentInstance;
      this.contentInstance.$mount(this.$refs.vuetifyRoot as HTMLElement);
    },
    renderContent() {
      if (!this.contentInstance) return;
      this.contentInstance.items = this.items as SummitAchievement[];
      this.contentInstance.loadState = this.loadState;
    },
    unmountContentComponent() {
      this.contentInstance?.$destroy();
      this.contentInstance = undefined;
    },
  },
});
