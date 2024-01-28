import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import OasReportItem from './models/OasReportItem';
import { TerrainAchievements } from '@/types/terrainTypes';
import { fetchUnitAchievementsFilterd } from '@/services';
import { Store } from 'vuex/types/index';
import { TerrainRootState } from '@/types/terrainState';
import { OasReportTable } from './components/OasReport';
import { defineComponent } from 'vue';

function data() {
  return {
    items: [] as OasReportItem[],
    root: undefined as Root | undefined,
  };
}

export default defineComponent({
  name: 'OasReport',
  data,
  watch: {
    items(newItems: OasReportItem[]) {
      this.renderReactComponent(newItems);
    },
  },
  mounted() {
    this.getOasData();
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
      }
      ,
      {
        text: "OAS Report",
        disabled: true,
        to: "/summit/reports/oas",
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    async getOasData(){  
      const achievements = await fetchUnitAchievementsFilterd("type=outdoor_adventure_skill") as TerrainAchievements[];
      const filteredAchievements = achievements.sort((a, b) => (a.achievement_meta?.stage ?? 0) - (b.achievement_meta?.stage ?? 0)).filter((a) => a.status === "awarded",)
      this.items = (this.$store as Store<TerrainRootState>).state.me.unitMembersData
      .filter((m) => m.unit.duty != "adult_leader")
      .map((m)=> {
        return new OasReportItem(filteredAchievements.filter(a => a.member_id === m.id), m);
      });
    },
    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      this.renderReactComponent(this.items);
    },
    renderReactComponent(items: OasReportItem[]) {
      const reactElement = React.createElement(OasReportTable as any, {
        items,
        onUpdate: this.handleUpdate,
      });    
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      if (this.root) this.root.unmount();
      this.root = undefined;
    },
    handleUpdate(updatedItems: OasReportItem[]) {
      // Handle the updates here
      this.items = updatedItems; // Update your Vue component's state
    },
  },
});

