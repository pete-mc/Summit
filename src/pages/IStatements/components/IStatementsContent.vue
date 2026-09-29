<template>
  <v-app>
    <div class="oas-vue-content istatement-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadState === 'loading-trees'">Loading skill trees...</span>
        <span v-else-if="loadState === 'loading-templates'">Loading templates {{ progressDone }}/{{ progressTotal }}...</span>
        <span v-else-if="loadState === 'ready'">{{ summaryText }}</span>
        <v-spacer></v-spacer>
        <v-btn icon title="Refresh data" :loading="isLoading" :disabled="isLoading" @click="onReload"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <!--
        This page's two loading phases map onto the shared component's optional counts: trees
        have no knowable total, templates do. See src/components/SummitLoadingState.ts.
      -->
      <SummitLoadingState
        :state="sharedLoadState"
        :done="loadState === 'loading-templates' ? progressDone : undefined"
        :total="loadState === 'loading-templates' ? progressTotal : undefined"
        error-message="Could not load i-statement data."
        :on-retry="onReload"
      />

      <template v-if="loadState === 'ready' && matrix">
        <p v-if="matrix.failedTemplates > 0" role="status" class="istatement-warning">
          {{ matrix.failedTemplates }} of {{ progressTotal }} templates could not be loaded — some squares may be missing.
        </p>

        <IStatementFilters :filters="filters" @update:filters="onFiltersUpdate" @reset="onResetFilters" />

        <IStatementHeatMap :rows="filtered.rows" :groups="filtered.groups" />
      </template>
    </div>
  </v-app>
</template>

<script lang="ts" src="./IStatementsContent.ts">
</script>

<style scoped>
/*
 * Deliberately the same --oas-vue-* scale as OasProgressionVueContent.vue rather than a
 * parallel --istatement-* one: these two pages are visual siblings, and .claude/DESIGN.md
 * records that the scale exists precisely to stop near-identical elements drifting apart.
 */
.oas-vue-content {
  --oas-vue-font-size-heading: 18px;
  --oas-vue-font-size-body: 14px;
  --oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
  padding: 8px 0;
}

.oas-vue-pill-btn.v-btn {
  font-size: 14px;
  font-weight: 600;
  height: 35px !important;
  min-width: 80px;
  padding: 0 18px;
  border-radius: 25px;
  text-transform: none;
  letter-spacing: normal;
}

/* .istatement-error went with the error markup — that now lives in SummitLoadingState.vue. */
.istatement-warning {
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
  padding: 8px 0;
}

.istatement-warning {
  color: var(--summit-color-text-danger);
}
</style>
