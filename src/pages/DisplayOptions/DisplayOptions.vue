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

<script type="ts" src="./DisplayOptions.ts"></script>

<style scoped>
/* Your component-specific styles here */
</style>
