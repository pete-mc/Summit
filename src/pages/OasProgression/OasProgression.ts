import React from "react";
import { Root, createRoot } from "react-dom/client";
import { defineComponent } from "vue";
import { fetchAllOASProgression, fetchOASProgressionForStream, type OASProgressionRow } from "./services/buildOASProgressionRows";
import { OasProgressionTable } from "./components/OasProgression";
import { OAS_SKILLS } from "./services/filterHeatMapSections";
import { fetchUnitMembers } from "@/services";
import { TerrainState, clearCache, createLogger } from "@/helpers";
import { TerrainRootState } from "@/types/terrainState";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const logger = createLogger("OasProgression");
const CONCURRENCY = 6;

const OAS_SKILL_TITLES: Record<string, string> = {
  bushcraft: "Bushcraft",
  bushwalking: "Bushwalking",
  camping: "Camping",
  aquatics: "Aquatics",
  boating: "Boating",
  paddling: "Paddling",
  alpine: "Alpine",
  cycling: "Cycling",
  vertical: "Vertical",
};

const VISIBLE_STREAMS_KEY = "summit.oasProgression.visibleStreams";

/**
 * Spike: this dropdown is deliberately built as a real Vuetify <v-select> in the Vue layer
 * (rather than a React component) to prove out reusing Terrain's own live $vuetify instance —
 * see .claude/DESIGN.md and the OAS Progression Vuetify investigation for why. If it proves out,
 * more filters can follow the same pattern.
 */
function loadVisibleStreams(): string[] {
  try {
    const stored = window.localStorage.getItem(VISIBLE_STREAMS_KEY);
    if (!stored) return [...OAS_SKILLS];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [...OAS_SKILLS];
  } catch {
    return [...OAS_SKILLS];
  }
}

function saveVisibleStreams(streams: string[]) {
  try {
    window.localStorage.setItem(VISIBLE_STREAMS_KEY, JSON.stringify(streams));
  } catch {
    // local storage is best-effort only
  }
}

function data() {
  return {
    items: [] as OASProgressionRow[],
    root: undefined as Root | undefined,
    loadingStreams: new Set<string>(),
    trunkStageCounts: {} as Record<string, number>,
    members: [] as TerrainUnitMember[],
    visibleStreams: loadVisibleStreams(),
    skillOptions: OAS_SKILLS.map((value) => ({ value, label: OAS_SKILL_TITLES[value] ?? value })),
  };
}

export default defineComponent({
  name: "OasProgression",
  // Registers this component against Summit's OWN Vuetify instance (installed via Vue.use(Vuetify)
  // in src/index.ts against Summit's own bundled Vue) — needed for `this.$vuetify` and the
  // <v-select> in OasProgression.vue to resolve to a real, working Vuetify component rather than
  // an unregistered custom element. See the OAS Progression Vuetify investigation notes: reaching
  // Terrain's own live $vuetify service alone was proven insufficient for actual components.
  vuetify: window.summitVuetify,
  data,
  computed: {
    vuetifyInstance() {
      return this.$vuetify;
    },
  },
  watch: {
    items(newItems: OASProgressionRow[]) {
      this.renderReactComponent(newItems);
    },
    loadingStreams() {
      this.renderReactComponent(this.items);
    },
    members() {
      this.renderReactComponent(this.items);
    },
    visibleStreams(newStreams: string[]) {
      saveVisibleStreams(newStreams);
      this.renderReactComponent(this.items);
    },
  },
  mounted() {
    this.loadOasProgressionData();
    this.mountReactComponent();
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
    this.unmountReactComponent();
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
    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      this.renderReactComponent(this.items);
    },
    renderReactComponent(items: OASProgressionRow[]) {
      const reactElement = React.createElement(OasProgressionTable, {
        items,
        trunkStageCounts: this.trunkStageCounts,
        members: this.members,
        loadingStreams: this.loadingStreams,
        visibleStreams: this.visibleStreams,
        onReloadAll: this.reloadAll,
        onReloadStream: this.reloadStream,
      });
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      if (this.root) this.root.unmount();
      this.root = undefined;
    },
  },
});
