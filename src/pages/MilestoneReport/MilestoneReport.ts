import React from "react";
import { Root, createRoot } from "react-dom/client";
import { defineComponent } from "vue";
import { TerrainAchievements } from "@/types/terrainTypes";
import { fetchUnitAchievementsFilterd } from "@/services";
import { TerrainRootState } from "@/types/terrainState";
import MilestoneReportTable from "./components/MilestoneReport";
import MilestonePlanningItem from "./models/MilestonePlanningItem";

function data() {
  return {
    items: [] as MilestonePlanningItem[],
    root: undefined as Root | undefined,
  };
}

export default defineComponent({
  name: "MilestoneReport",
  data,
  watch: {
    items(newItems) {
      this.renderReactComponent(newItems);
    },
  },
  mounted() {
    this.getMilestoneData();
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
        text: "Milestone Report",
        disabled: true,
        to: "/summit/reports/milestone",
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    async getMilestoneData() {
      const currentSection = (window.$nuxt.$store.state as TerrainRootState).me.currentUnit.section;
      const achievements = (await fetchUnitAchievementsFilterd(`type=milestone&section=${currentSection}`)) as TerrainAchievements[];
      const filteredAchievements = achievements.sort((a, b) => (a.achievement_meta?.stage ?? 0) - (b.achievement_meta?.stage ?? 0)).filter((a) => a.milestone_requirement_status === "incomplete" && a.status !== "awarded");
      this.items = (window.$nuxt.$store.state as TerrainRootState).me.unitMembersData
        .filter((m) => m.unit.duty !== "adult_leader")
        .map(
          (m) =>
            new MilestonePlanningItem(
              filteredAchievements.find((a) => a.member_id === m.id),
              m,
            ),
        );
    },
    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      this.renderReactComponent(this.items);
    },
    renderReactComponent(items: MilestonePlanningItem[]) {
      const reactElement = React.createElement(MilestoneReportTable, {
        items,
        onUpdate: this.handleUpdate,
      });
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      if (this.root) this.root.unmount();
      this.root = undefined;
    },
    handleUpdate(updatedItems: MilestonePlanningItem[]) {
      // Handle the updates here
      this.items = updatedItems; // Update your Vue component's state
    },
  },
});
