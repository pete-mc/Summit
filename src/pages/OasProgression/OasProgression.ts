import React from "react";
import { Root, createRoot } from "react-dom/client";
import { defineComponent } from "vue";
import { fetchAllOASProgression, fetchOASProgressionForStream, isOASCacheKeyForStream, type OASProgressionRow } from "./services/buildOASProgressionRows";
import { OasProgressionTable } from "./components/OasProgression";
import { fetchUnitMembers } from "@/services";
import { TerrainState, clearCache, createLogger } from "@/helpers";
import { TerrainRootState } from "@/types/terrainState";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const logger = createLogger("OasProgression");
const CONCURRENCY = 6;

function data() {
  return {
    items: [] as OASProgressionRow[],
    root: undefined as Root | undefined,
    loadingStreams: new Set<string>(),
    trunkStageCounts: {} as Record<string, number>,
    members: [] as TerrainUnitMember[],
  };
}

export default defineComponent({
  name: "OasProgression",
  data,
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
        text: "OAS Progression (legacy)",
        disabled: true,
        to: "/summit/reports/oasprogression-legacy",
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
