import React from "react";
import { Root, createRoot } from "react-dom/client";
import SummitCalendarItem from "./models/SummitCalendarItems";
import { TerrainRootState } from "@/types/terrainState";
import { defineComponent } from "vue";
import { SummitCalendarComponent } from "./components/SummitCalendar";

function data() {
  return {
    items: [] as SummitCalendarItem[],
    root: undefined as Root | undefined,
  };
}

export default defineComponent({
  name: "BulkCalendar",
  data,
  watch: {
    items(newItems: SummitCalendarItem[]) {
      this.renderReactComponent(newItems);
    },
  },
  mounted() {
    this.getCalendarData();
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
        text: "Summit Calendar",
        disabled: true,
        to: "/summit/tools/SummitCalendar",
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    async getCalendarData() {},
    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      this.renderReactComponent(this.items);
    },
    renderReactComponent(items: SummitCalendarItem[]) {
      const reactElement = React.createElement(SummitCalendarComponent, {
        items,
        onUpdate: this.handleUpdate,
      });
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      if (this.root) this.root.unmount();
      this.root = undefined;
    },
    handleUpdate(updatedItems: SummitCalendarItem[]) {
      // Handle the updates here
      this.items = updatedItems; // Update your Vue component's state
    },
  },
});
