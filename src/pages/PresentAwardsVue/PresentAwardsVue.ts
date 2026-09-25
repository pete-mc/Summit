import Vue from "vue";
import { defineComponent } from "vue";
import PresentAwardsVueContent from "./components/PresentAwardsVueContent.vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { loadPresentedAwards } from "@/pages/PresentAwards/services/awardStorageEvent";
import type { TerrainEvent } from "@/types/terrainTypes";
import { createLogger } from "@/helpers";
import { TerrainRootState } from "@/types/terrainState";

const logger = createLogger("PresentAwardsVue");

/**
 * Mirrors OasProgressionVue.ts / IStatements.ts: the content component is mounted as a second,
 * independent Vue instance built from Summit's own Vuetify-registered `vue`, because Terrain's Vue
 * constructor (which renders this outer SFC) has no Vuetify components registered on it.
 * See .claude/OASProgression/PLAN_VUE.md for the full reasoning.
 */
interface ContentInstance {
  items: SummitAchievement[];
  loadState: string;
  $mount(el: HTMLElement): void;
  $destroy(): void;
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
    // Mount before loading: renderContent() silently no-ops until the content instance exists,
    // so loading first would leave the page blank for the whole fetch.
    this.mountContentComponent();
    this.loadAwards();
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      { text: "Summit", disabled: false, to: "/summit/home", exact: true },
      { text: "Tools", disabled: true, to: "/summit/tools", exact: true },
      { text: "Present Awards (Vue)", disabled: true, to: "/summit/tools/presentawards-vue", exact: true },
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
    mountContentComponent() {
      // `any` here sidesteps TS2589 ("type instantiation is excessively deep") from Vue.extend's
      // inferred type — same workaround, and same reason, as OasProgressionVue.ts / IStatements.ts.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ContentApp: any = Vue.extend(PresentAwardsVueContent);
      this.contentInstance = new ContentApp({
        vuetify: window.summitVuetify,
        propsData: {
          items: this.items,
          loadState: this.loadState,
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
