<template>
  <div>
    <h2>OAS Progression (legacy)</h2>
    <div class="oas-legacy-banner">
      This is the original, retired version of OAS Progression, kept as a reference. Use
      <router-link to="/summit/reports/oasprogression">OAS Progression</router-link> for the current version.
    </div>
    A heat-map view of each member's progress through the Outdoor Adventure Skill streams, down to individual i-statement detail.<br>
    <div ref="reactRoot"></div>
  </div>
</template>

<script lang="ts" src="./OasProgression.ts">
</script>

<style scoped>
.oas-legacy-banner {
  background-color: #fff4e5;
  border: 1px solid #f0ad4e;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
</style>
