import React from "react";
import { Root, createRoot } from "react-dom/client";
import { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";
import { defineComponent } from "vue";
import { fetchUnitAchievementsFilterd, fetchUnitMembers } from "@/services";
import { TerrainRootState } from "@/types/terrainState";
import MilestoneReportTable from "./components/PeakAward";
import PeakAwardItem from "./models/PeakAwardItem";
import { TerrainAchievementsType } from "@/shared";
import { TerrainState } from "@/helpers";

function data() {
  return {
    items: [] as PeakAwardItem[],
    root: undefined as Root | undefined,
  };
}

export default defineComponent({
  name: "PeakAward",
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
        text: "Peak Award Report",
        disabled: true,
        to: "/summit/reports/peakaward",
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    async getMilestoneData() {
      const currentSection = TerrainState.getSectionName();
      const fetchPromises = Object.values(TerrainAchievementsType).map((type) => fetchUnitAchievementsFilterd(`type=${type}`));
      const membersMap = (await fetchUnitMembers())
        .filter((m) => m.unit.duty !== "adult_leader")
        .reduce(
          (map, member) => {
            map[member.id] = member;
            return map;
          },
          {} as { [id: string]: TerrainUnitMember },
        );
      const awardsByMember = (await Promise.all(fetchPromises)).flat().reduce(
        (result, item: TerrainAchievements) => {
          if (!membersMap[item.member_id]) {
            return result;
          }
          if (!result[item.member_id]) {
            result[item.member_id] = [];
          }
          result[item.member_id].push(item);
          return result;
        },
        {} as { [id: string]: TerrainAchievements[] },
      );
      console.log(membersMap);
      console.log(awardsByMember);
      this.items = Object.entries(awardsByMember).map(([memberId, awards]) => {
        const member = membersMap[memberId];
        return new PeakAwardItem(awards, currentSection, member);
      });
      console.log(this.items);

      console.timeStamp(" Got all items");
      console.log(this.items);
      this.renderReactComponent(this.items);
    },

    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      this.renderReactComponent(this.items);
    },

    renderReactComponent(items: PeakAwardItem[]) {
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

    handleUpdate(updatedItems: PeakAwardItem[]) {
      // Handle the updates here
      this.items = updatedItems; // Update your Vue component's state
    },
  },
});
