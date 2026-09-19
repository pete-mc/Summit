<template>
  <div>
    <h2>OAS Progression</h2>
    A heat-map view of each member's progress through the Outdoor Adventure Skill streams, down to individual i-statement detail.<br>
    <v-select
      v-if="vuetifyInstance"
      v-model="visibleStreams"
      :items="skillOptions"
      item-text="label"
      item-value="value"
      label="Skills"
      multiple
      chips
      deletable-chips
      dense
      style="max-width: 480px"
      data-oas-vuetify-skills="true"
    ></v-select>
    <div ref="reactRoot"></div>
  </div>
</template>

<script lang="ts" src="./OasProgression.ts">
</script>

<style scoped>

</style>
