import React from "react";
import { createRoot, Root } from "react-dom/client";
import { defineComponent } from "vue";
import { TerrainAchievements } from "@/types/terrainTypes";
import { fetchUnitAchievementsFilterd, fetchUnitMembers } from "@/services";
import { TerrainRootState } from "@/types/terrainState";
import MilestoneReportTable from "./components/MilestoneReport";
import MilestonePlanningItem from "./models/MilestonePlanningItem";
import { TerrainState } from "@/helpers";

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
    /**
     * Retrieves milestone data for the current section.
     *
     * @async
     * @function getMilestoneData
     * @returns {Promise<void>} - Resolves when the milestone data has been retrieved and processed.
     */
    getMilestoneData: async function () {
      const currentSection = TerrainState.getSectionName();
      const achievements = (await fetchUnitAchievementsFilterd(`type=milestone&section=${currentSection}`)) as TerrainAchievements[];
      const sortedAchievements = achievements.sort((a, b) => (a.achievement_meta?.stage ?? 0) - (b.achievement_meta?.stage ?? 0));
      // Filter by Achievements that are incomplete and not awarded, include "Not Required" for skipped milestones
      const filteredAchievements = sortedAchievements.filter((a) => a.milestone_requirement_status === "incomplete" && a.status !== "awarded" && a.status != "not_required");
      this.items = (await fetchUnitMembers())
        .filter((m) => m.unit.duty !== "adult_leader")
        .map(
          (m) =>
            new MilestonePlanningItem(
              filteredAchievements.find((a) => a.member_id === m.id),
              m,
            ),
        );
      console.log(this.items);
      this.renderReactComponent(this.items);
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
