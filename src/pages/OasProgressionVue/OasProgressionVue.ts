import Vue from "vue";
import { defineComponent } from "vue";
import OasProgressionVueContent from "./components/OasProgressionVueContent.vue";
import { fetchAllOASProgression, fetchOASProgressionForStream, isOASCacheKeyForStream, type OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { fetchUnitMembers } from "@/services";
import { TerrainState, clearCache, createLogger } from "@/helpers";
import { TerrainRootState } from "@/types/terrainState";
import type { TerrainUnitMember } from "@/types/terrainTypes";
import type { TerrainAchievementsSection } from "@/shared";

const logger = createLogger("OasProgressionVue");
const CONCURRENCY = 6;

const ALL_STREAMS = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];

/**
 * Gotcha: mounted as a second Vue instance from Summit's Vuetify-registered `vue` (src/vuetifySetup.ts), not as a child component.
 * Terrain's router renders this outer file with Terrain's own Vue, which has no Vuetify components.
 */
/** Gotcha: not `extends Vue`, which triggers TS2589 "type instantiation is excessively deep". */
interface ContentInstance {
  items: OASProgressionRow[];
  trunkStageCounts: Record<string, number>;
  members: TerrainUnitMember[];
  section: TerrainAchievementsSection | undefined;
  loadingStreams: Set<string>;
  loadError: boolean;
  $mount(el: HTMLElement): void;
  $destroy(): void;
}

function data() {
  return {
    items: [] as OASProgressionRow[],
    contentInstance: undefined as ContentInstance | undefined,
    loadingStreams: new Set<string>(),
    loadError: false,
    trunkStageCounts: {} as Record<string, number>,
    members: [] as TerrainUnitMember[],
    /** A Terrain unit is one section. Undefined until Terrain resolves it. */
    section: undefined as TerrainAchievementsSection | undefined,
  };
}

export default defineComponent({
  name: "OasProgressionVue",
  data,
  watch: {
    items(newItems: OASProgressionRow[]) {
      this.renderContent(newItems);
    },
    loadingStreams() {
      this.renderContent(this.items);
    },
    loadError() {
      this.renderContent(this.items);
    },
    members() {
      this.renderContent(this.items);
    },
  },
  mounted() {
    this.loadOasProgressionData();
    this.mountContentComponent();
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      {
        text: "Summit",
        disabled: false,
        to: "/summit/home",
        exact: true,
      },
      {
        text: "Reports",
        disabled: true,
        to: "/summit/reports",
        exact: true,
      },
      {
        text: "OAS Progression",
        disabled: true,
        to: "/summit/reports/oasprogression",
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    this.unmountContentComponent();
  },
  methods: {
    async loadOasProgressionData() {
      try {
        this.loadError = false;
        const unitId = TerrainState.getUnitID();
        this.section = TerrainState.getSectionName() as TerrainAchievementsSection | undefined;
        const members = (await fetchUnitMembers()).filter((m) => m.unit.duty != "adult_leader");
        this.members = members;

        this.items = [];
        this.trunkStageCounts = {};
        this.loadingStreams = new Set(ALL_STREAMS);

        await fetchAllOASProgression(unitId, members, CONCURRENCY, (stream, result) => {
          this.items = [...this.items, ...result.rows];
          this.trunkStageCounts = { ...this.trunkStageCounts, [stream]: result.trunkStageCount };
          const remaining = new Set(this.loadingStreams);
          remaining.delete(stream);
          this.loadingStreams = remaining;
        });
      } catch (e) {
        logger.error("failed to load OAS progression data:", e);
        // Otherwise a stuck progress bar shows instead of the error.
        this.loadingStreams = new Set<string>();
        this.loadError = true;
      }
    },
    async reloadAll() {
      clearCache();
      await this.loadOasProgressionData();
    },
    async reloadStream(stream: string) {
      try {
        clearCache(isOASCacheKeyForStream(stream));
        const unitId = TerrainState.getUnitID();
        const members = (await fetchUnitMembers()).filter((m) => m.unit.duty != "adult_leader");
        this.members = members;

        const remaining = new Set(this.loadingStreams);
        remaining.add(stream);
        this.loadingStreams = remaining;

        this.items = this.items.filter((row) => row.stream !== stream);

        const result = await fetchOASProgressionForStream(unitId, stream, members);
        this.items = [...this.items, ...result.rows];
        this.trunkStageCounts = { ...this.trunkStageCounts, [stream]: result.trunkStageCount };
        const updated = new Set(this.loadingStreams);
        updated.delete(stream);
        this.loadingStreams = updated;
      } catch (e) {
        logger.error("failed to reload stream", stream, ":", e);
      }
    },
    mountContentComponent() {
      // Gotcha: `new` on Vue.extend's inferred type hits TS2589. `any` here; ContentInstance restores typing.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ContentApp: any = Vue.extend(OasProgressionVueContent);
      this.contentInstance = new ContentApp({
        vuetify: window.summitVuetify,
        propsData: {
          items: this.items,
          trunkStageCounts: this.trunkStageCounts,
          members: this.members,
          section: this.section,
          loadingStreams: this.loadingStreams,
          loadError: this.loadError,
          totalStreams: ALL_STREAMS.length,
          onReloadAll: this.reloadAll,
          onReloadStream: this.reloadStream,
        },
      }) as ContentInstance;
      this.contentInstance.$mount(this.$refs.vuetifyRoot as HTMLElement);
    },
    renderContent(items: OASProgressionRow[]) {
      if (!this.contentInstance) return;
      this.contentInstance.items = items;
      this.contentInstance.trunkStageCounts = this.trunkStageCounts;
      this.contentInstance.members = this.members;
      this.contentInstance.section = this.section;
      this.contentInstance.loadingStreams = this.loadingStreams;
      this.contentInstance.loadError = this.loadError;
    },
    unmountContentComponent() {
      this.contentInstance?.$destroy();
      this.contentInstance = undefined;
    },
  },
});
