<!-- <template>
  <div>
    <div>Component Awesome</div>
    <div>
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class MyComponent extends Vue {
  get message() {
    console.log("getting message: " + this);
    return window.$nuxt.$store.state.Summit.message;
  }
  updateMessage(newMessage: string) {
    // Commit a mutation to update the message in the store
    window.$nuxt.$store.commit("Summit/updateMessage", newMessage);
  }
}
</script>

<style scoped>
/* Your component-specific styles here */
</style> -->

<template>
  <div>
    <div>Component Awesome</div>
    <div>
      {{ localMessage }}
      <!-- Display the local message -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Local data property to store the message
      localMessage: "Initial Value",
    };
  },
  computed: {
    // Computed property to get the message from Vuex
    computedMessage() {
      return this.$store.getters["Summit/getMessage"];
    },
  },
  watch: {
    // Watch for changes in Vuex state
    "$store.state.Summit.message": function (newVal) {
      this.localMessage = newVal;
    },
  },
  mounted() {
    // Initialize local message from Vuex store
    this.localMessage = this.$store.state.Summit.message;
  },
  // Include other methods as needed...
};
</script>

<style scoped>
/* Your component-specific styles here */
</style>
