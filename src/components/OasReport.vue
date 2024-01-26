<template>
  <div>
    <h2>OAS Summary</h2>
    This report will show all of the currently held OAS levels for each member of the section.<br>
    <div ref="reactRoot"></div>
  </div>
</template>

<!-- The rest of your script and style tags remain the same -->
<script lang="ts">
import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { OasReportItem } from '../classes/OasReportItem';
import { TerrainAchievements } from '../types/terrainTypes';
import { fetchUnitAchievementsFilterd } from '../services/terrainCalls';
import { Store } from 'vuex/types/index';
import { TerrainRootState } from '../types/terrainState';
import { MilestoneReportTable } from './MilestoneReport';

export default {
  name: 'ReactInVue',
  data() {
    return {
      items: [] as OasReportItem[],
      root: undefined as Root | undefined,
     };
  },
  watch: {
    items(newItems) {
      this.renderReactComponent(newItems);
    },
  },
  mounted() {
    this.getMilestoneData();
    this.mountReactComponent();
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    async getMilestoneData(){  
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
      const reactElement = React.createElement(MilestoneReportTable as any, {
        items,
        onUpdate: this.handleUpdate,
      });    
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      if (this.root) this.root.unmount();
      this.root = undefined;
    },
    handleUpdate(updatedItems: any) {
      // Handle the updates here
      this.items = updatedItems; // Update your Vue component's state
    },
  },
};

</script>

<style scoped>

</style>