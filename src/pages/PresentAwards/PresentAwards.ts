import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { TerrainEvent } from '@/types/terrainTypes';
import { fetchMemberEvents, fetchUnitAchievements, fetchActivity, updateEvent, createNewEvent } from '@/services';
import { TerrainRootState, UnitMember } from '@/types/terrainState';
import { defineComponent } from 'vue';
import { TerrainState } from '@/helpers';
import AwardsTable from './components/PresentAwards';
import SummitAchievement from './models/SummitAchievement';

function data() {
  return {
    items: [] as SummitAchievement[],
    root: undefined as Root | undefined,
    storeEvent: undefined as TerrainEvent | undefined,
  };
}

export default defineComponent({
  name: 'PresentAwards',
  data,
  watch: {
    items(newItems: SummitAchievement[]) {
      this.renderReactComponent(newItems);
    },
  },
  mounted() {
    this.getAwardData();
    this.mountReactComponent();
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      {
        text: 'Summit',
        disabled: false,
        to: '/summit/home',
        exact: true,
      },
      {
        text: 'Tools',
        disabled: true,
        to: '/summit/tools',
        exact: true,
      },
      {
        text: 'Present Awards',
        disabled: true,
        to: '/summit/tools/presentawards',
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    async getAwardData() {
      this.storeEvent = await fetchActivity(
        (await fetchMemberEvents('2100-01-01T00:00:00', '2100-01-30T00:00:00')).find(
          (event) => event.title === 'Summit Award Storage - Please Ignore' && event.invitee_id === TerrainState.getUnitID(),
        )?.id,
      );
      this.items = (await fetchUnitAchievements())
        .sort((a, b) => (a.achievement_meta?.stage ?? 0) - (b.achievement_meta?.stage ?? 0))
        .filter((a) => a.status === 'awarded')
        .map((a) => new SummitAchievement(a, TerrainState.getUnitMembers().find((member) => member.id === a.member_id) as UnitMember, this.storeEvent));
      this.renderReactComponent(this.items as SummitAchievement[]);
    },
    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      this.renderReactComponent(this.items as SummitAchievement[]);
    },
    renderReactComponent(items: SummitAchievement[]) {
      const reactElement = React.createElement(AwardsTable as any, {
        items,
        onUpdate: this.handleUpdate,
      });
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      if (this.root) this.root.unmount();
      this.root = undefined;
    },
    handleUpdate(storeEvent: TerrainEvent) {
      const eventId = this.storeEvent?.id;
      this.storeEvent = storeEvent;
      if (eventId) {
        updateEvent(eventId, JSON.stringify(this.storeEvent));
      } else {
        createNewEvent(JSON.stringify(this.storeEvent));
      }
    },
  },
});
