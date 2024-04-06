import { TerrainRootState } from "@/types/terrainState";
import { defineComponent } from "vue";
import { createRoot, Root } from "react-dom/client";
import React from "react";
import TermPlannerTable from "@/pages/TermPlanner/components/TermPlanner";
import { TerrainState } from "@/helpers";
function data() {
  // Initialize items and root
  return {
    items: [] as Record<string, object>[],
    root: undefined as Root | undefined,
  };
}

export default defineComponent({
  name: "TermPlanner",
  data,
  watch: {
    // Watch for changes in the items
    items(newItems) {
      // Rerender React.js component if items change
      this.renderReactComponent(newItems);
    },
  },
  mounted() {
    this.getSchoolTerm();
    // Initialize breadcrumbs on mount
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      {
        // breadcrumbs to display route hierarchy
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
        text: "Term Planner",
        disabled: true,
        to: "/summit/tools/TermPlanner",
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    // Clean up before destroy to avoid memory leaks
    this.unmountReactComponent();
  },
  methods: {
    getSchoolTerm(): void {
      const state = TerrainState.getMemberState();
      const schoolTerms = TerrainState.getSchoolTerms(state);
      console.log(schoolTerms);
    },
    mountReactComponent() {
      // Mounting React.js component to defined root
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      // Apply items to the React.js component
      this.renderReactComponent(this.items);
    },
    renderReactComponent(items: []) {
      // Rendering React.js component with items as props
      const reactElement = React.createElement(TermPlannerTable, {
        items,
        onUpdate: this.handleUpdate,
      });
      // React component rendered by virtual DOM root
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      // Unmounting React.js component before the component is destroyed
      if (this.root) this.root.unmount();
      this.root = undefined;
    },
    handleUpdate(updatedItems: Record<string, object>[]) {
      // Updated items will be received here and set to items array
      this.items = updatedItems;
    },
  },
});
