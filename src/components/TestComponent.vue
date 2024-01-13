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
