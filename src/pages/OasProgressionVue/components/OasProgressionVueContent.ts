import { defineComponent } from "vue";
import type { PropType } from "vue";
import OASHeatMapVue from "./OASHeatMapVue.vue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const MAX_STAGE = 9;

export default defineComponent({
  name: "OasProgressionVueContent",
  components: { OASHeatMapVue },
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    trunkStageCounts: { type: Object as PropType<Record<string, number>>, required: true },
    members: { type: Array as PropType<TerrainUnitMember[]>, required: true },
    loadingStreams: { type: Object as PropType<Set<string>>, required: true },
    onReloadAll: { type: Function as PropType<() => void>, required: true },
    onReloadStream: { type: Function as PropType<(stream: string) => void>, required: true },
  },
  data() {
    return {
      // Placeholder "everything visible" defaults until VueStage 3 adds real filter controls —
      // matches OasProgression.tsx's DEFAULT_FILTERS shape/values.
      visibleStreams: OAS_SKILLS,
      stageRange: [1, MAX_STAGE] as [number, number],
      sortBy: "firstName" as const,
    };
  },
});
