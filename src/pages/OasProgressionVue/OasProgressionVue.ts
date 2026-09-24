import Vue from "vue";
import { defineComponent } from "vue";
import OasProgressionVueContent from "./components/OasProgressionVueContent.vue";
import { fetchAllOASProgression, fetchOASProgressionForStream, type OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { fetchUnitMembers } from "@/services";
import { TerrainState, clearCache, createLogger } from "@/helpers";
import { TerrainRootState } from "@/types/terrainState";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const logger = createLogger("OasProgressionVue");
const CONCURRENCY = 6;

/**
 * OasProgressionVueContent is mounted as a second, independent Vue instance built from
 * Summit's own Vuetify-registered `vue` (see src/vuetifySetup.ts) — NOT registered as a child
 * component in this SFC's own template. Terrain's router renders this outer .vue file against
 * Terrain's own Vue constructor, which has no Vuetify components registered on it; only a
 * separately-constructed Vue instance sees them. This mirrors OasProgression.ts's React mount
 * (mountReactComponent/renderReactComponent) but with Vue.extend(...).$mount(...) in place of
 * React's createRoot(...).render(...).
 */
/**
 * Deliberately NOT `extends Vue` — pulling in Vue's own inferred instance type here causes
 * TS2589 "type instantiation is excessively deep" (hit and fixed the same way in a prior spike
 * on this page). This is just the minimal structural shape actually used below.
 */
interface ContentInstance {
  items: OASProgressionRow[];
  trunkStageCounts: Record<string, number>;
  members: TerrainUnitMember[];
  loadingStreams: Set<string>;
  $mount(el: HTMLElement): void;
  $destroy(): void;
}

function data() {
  return {
    items: [] as OASProgressionRow[],
    contentInstance: undefined as ContentInstance | undefined,
    loadingStreams: new Set<string>(),
    trunkStageCounts: {} as Record<string, number>,
    members: [] as TerrainUnitMember[],
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
        const unitId = TerrainState.getUnitID();
        const members = (await fetchUnitMembers()).filter((m) => m.unit.duty != "adult_leader");
        this.members = members;

        this.items = [];
        this.trunkStageCounts = {};
        this.loadingStreams = new Set(["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"]);

        await fetchAllOASProgression(unitId, members, CONCURRENCY, (stream, result) => {
          this.items = [...this.items, ...result.rows];
          this.trunkStageCounts = { ...this.trunkStageCounts, [stream]: result.trunkStageCount };
          const remaining = new Set(this.loadingStreams);
          remaining.delete(stream);
          this.loadingStreams = remaining;
        });
      } catch (e) {
        logger.error("failed to load OAS progression data:", e);
      }
    },
    async reloadAll() {
      clearCache();
      await this.loadOasProgressionData();
    },
    async reloadStream(stream: string) {
      try {
        clearCache(stream);
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
      // Vue.extend(...)'s inferred return type, called with `new`, sends TS into
      // "type instantiation is excessively deep" (TS2589) — the same issue hit in a prior spike
      // on this page. Routing the construction through an `any`-typed local sidesteps the deep
      // generic resolution; ContentInstance (a small structural interface, not Vue's own complex
      // inferred instance type) restores real typing for everything used afterward.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ContentApp: any = Vue.extend(OasProgressionVueContent);
      this.contentInstance = new ContentApp({
        vuetify: window.summitVuetify,
        propsData: {
          items: this.items,
          trunkStageCounts: this.trunkStageCounts,
          members: this.members,
          loadingStreams: this.loadingStreams,
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
      this.contentInstance.loadingStreams = this.loadingStreams;
    },
    unmountContentComponent() {
      this.contentInstance?.$destroy();
      this.contentInstance = undefined;
    },
  },
});
