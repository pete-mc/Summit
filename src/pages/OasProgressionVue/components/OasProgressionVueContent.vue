<template>
  <v-app>
    <div class="oas-vue-content">
      <v-progress-circular v-if="loadingStreams.size > 0" indeterminate color="primary"></v-progress-circular>
      <span v-if="loadingStreams.size > 0">Loading {{ loadingStreams.size }} stream(s)...</span>

      <OASHeatMapVue
        :items="items"
        :trunk-stage-counts="trunkStageCounts"
        :members="members"
        :visible-streams="visibleStreams"
        :stage-range="stageRange"
        :sort-by="sortBy"
      />
    </div>
  </v-app>
</template>

<script lang="ts" src="./OasProgressionVueContent.ts">
</script>

<style scoped>
.oas-vue-content {
  padding: 8px 0;
}
</style>
