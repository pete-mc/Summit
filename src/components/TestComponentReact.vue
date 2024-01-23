<template>
  <div ref="reactRoot"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import React from 'react';
import ReactDOM from 'react-dom';
import { Root, createRoot } from 'react-dom/client';
import { ReactTable } from './ReactTable';
import { Item } from '../classes/Item';

export default Vue.extend({
  name: 'ReactInVue',
  data() {
    return {
      items: [
        new Item('Item 1', 1, "p1"),
        new Item('Item 2', 2, "p2"),
        new Item('Item 3', 3, "p3"),
      ] as Item[],
      root: undefined as Root | undefined,
     };
  },
  mounted() {
    this.mountReactComponent();
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      const reactElement = React.createElement(ReactTable as any, {
        items: this.items,
        onUpdate: this.handleUpdate,
      });
      
      this.root.render(reactElement);
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
});
</script>
