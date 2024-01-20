<template>
  <div id="uiEnhancementsDiv">
    <h2 id="uiEnhancements">Display Options</h2>
    <p>Here you can configure how terrain looks and feels. Please make the changes as required. Please note the settings will be saved for this browser but will not sync between devices.</p>
    <div id="uiChanges" class="row no-gutters justify-end">
      <div class="ui toggle checkbox">
        <label for="helpbutton">Show the floating Terrain help button</label>
        <input type="checkbox" name="helpbutton" id="helpbutton" :checked="helpbutton" @change="updateHelpButton">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Local data property to store the message
      helpbutton: this.$store.state.Summit.helpButton,
    };
  },
  methods: {
    updateHelpButton() {
      this.$store.dispatch('Summit/toggleHelpButton', this.helpbutton);
      //window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World 2");
      console.log("Help button updated to " + this.helpbutton);
    }
  },
   
  computed: {
    // Computed property to get the message from Vuex
    computedMessage() {
      return this.$store.getters['Summit/getHelpButton'];
    },
  },
  watch: {
    // Watch for changes in Vuex state
    "$store.state.Summit.helpButton": function (newVal) {
      this.helpbutton = newVal;
    },
  },
  mounted() {
    // Initialize local message from Vuex store
    this.helpbutton = this.$store.state.Summit.helpButton;
  },
  created() {

  },
  // Include other methods as needed...
}
</script>

<style scoped>
/* Your component-specific styles here */
</style>
