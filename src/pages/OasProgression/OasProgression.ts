import React from "react";
import { Root, createRoot } from "react-dom/client";
import Vue, { defineComponent } from "vue";
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
 * Spike: a real Vuetify <v-select>, proving out real Vuetify components in Summit. Earlier
 * attempts tried using <v-select> directly in THIS component's own template (OasProgression.vue)
 * — that can't work: this component is rendered by TERRAIN's own Vue instance/router (registered
 * via window.$nuxt.$router in SummitRouter.ts), so component tags in its template resolve against
 * Terrain's Vue.options.components, which never has Vuetify registered on it (confirmed directly:
 * window.$nuxt.$root.constructor.options.components["v-select"] is undefined, even after
 * Vue.use(Vuetify) succeeds against Summit's own separately-bundled Vue in vuetifySetup.ts).
 *
 * Fix: mount a SECOND, independent Vue 2 instance — built from Summit's own Vue import, which DOES
 * have Vuetify registered — into its own plain <div ref="vuetifyRoot">, the same way React is
 * mounted into reactRoot below. This keeps Terrain's own Vue/router completely untouched.
 */
const VuetifySkillsSelect = Vue.extend({
  vuetify: window.summitVuetify,
  props: {
    items: { type: Array as () => Array<{ value: string; label: string }>, required: true },
    value: { type: Array as () => string[], required: true },
  },
  template: `
    <v-select
      :items="items"
      :value="value"
      item-text="label"
      item-value="value"
      label="Skills"
      multiple
      chips
      deletable-chips
      dense
      style="max-width: 480px"
      data-oas-vuetify-skills="true"
      @change="$emit('change', $event)"
    ></v-select>
  `,
});

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

interface VuetifySkillsSelectInstance {
  value: string[];
  $destroy(): void;
}

function data() {
  return {
    items: [] as OASProgressionRow[],
    root: undefined as Root | undefined,
    vuetifyRootInstance: undefined as VuetifySkillsSelectInstance | undefined,
    loadingStreams: new Set<string>(),
    trunkStageCounts: {} as Record<string, number>,
    members: [] as TerrainUnitMember[],
    visibleStreams: loadVisibleStreams(),
    skillOptions: OAS_SKILLS.map((value) => ({ value, label: OAS_SKILL_TITLES[value] ?? value })),
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
    visibleStreams(newStreams: string[]) {
      saveVisibleStreams(newStreams);
      this.renderReactComponent(this.items);
      if (this.vuetifyRootInstance) {
        this.vuetifyRootInstance.value = newStreams;
      }
    },
  },
  mounted() {
    this.loadOasProgressionData();
    this.mountReactComponent();
    this.mountVuetifyComponent();
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
    this.unmountVuetifyComponent();
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
    mountVuetifyComponent() {
      const instance = new VuetifySkillsSelect({
        propsData: {
          items: this.skillOptions,
          value: this.visibleStreams,
        },
      });
      instance.$on("change", (newValue: string[]) => {
        this.visibleStreams = newValue;
      });
      instance.$mount(this.$refs.vuetifyRoot as HTMLElement);
      this.vuetifyRootInstance = instance;
    },
    unmountVuetifyComponent() {
      if (this.vuetifyRootInstance) this.vuetifyRootInstance.$destroy();
      this.vuetifyRootInstance = undefined;
    },
  },
});
