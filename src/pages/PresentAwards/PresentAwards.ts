import React from "react";
import { Root, createRoot } from "react-dom/client";
import { TerrainEvent } from "@/types/terrainTypes";
import { TerrainRootState } from "@/types/terrainState";
import { defineComponent } from "vue";
import AwardsTable from "./components/PresentAwards";
import SummitAchievement from "./models/SummitAchievement";
import { loadPresentedAwards, savePresentedAwards } from "./services/awardStorageEvent";

function data() {
  return {
    items: [] as SummitAchievement[],
    root: undefined as Root | undefined,
    storeEvent: undefined as TerrainEvent | undefined,
  };
}

export default defineComponent({
  name: "PresentAwards",
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
        text: "Summit",
        disabled: false,
        to: "/summit/home",
        exact: true,
      },
      {
        text: "Tools",
        disabled: true,
        to: "/summit/tools",
        exact: true,
      },
      {
        text: "Present Awards",
        disabled: true,
        to: "/summit/tools/presentawards",
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    async getAwardData() {
      const { storeEvent, items } = await loadPresentedAwards();
      this.storeEvent = storeEvent;
      this.items = items;
      this.renderReactComponent(this.items as SummitAchievement[]);
    },
    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      this.renderReactComponent(this.items as SummitAchievement[]);
    },
    renderReactComponent(items: SummitAchievement[]) {
      const reactElement = React.createElement(AwardsTable, {
        items,
        onUpdate: this.handleUpdate,
      });
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      if (this.root) this.root.unmount();
      this.root = undefined;
    },

    //update process from react component when save button is clicked
    handleUpdate(newItems: SummitAchievement[]) {
      // Deliberately not awaited, and the SaveEventResult deliberately discarded: this page has
      // always saved fire-and-forget, and reporting the outcome here would be a UX change beyond
      // the scope of the service extraction. The Vue replica does await it — see
      // src/pages/PresentAwardsVue/.
      void savePresentedAwards(this.storeEvent, newItems);

      // this.items.forEach((item) => {
      //   const newItem = newItems.find((i) => i.id === item.id);
      //   if (newItem) {
      //     item.presented = newItem.presented;
      //   }
      // });
      this.renderReactComponent(this.items);
    },
  },
});
