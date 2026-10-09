<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <v-text-field
        :value="filters.summaryMemberFilter"
        label="Member"
        prepend-inner-icon="mdi-magnify"
        dense
        hide-details
        clearable
        style="max-width: 220px"
        @input="patch({ summaryMemberFilter: $event || '' })"
      ></v-text-field>

      <v-select
        v-if="canFilterByPatrol"
        :value="filters.summarySelectedPatrols || []"
        :items="patrolFilterOptions"
        label="Patrol"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        @change="patch({ summarySelectedPatrols: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ (filters.summarySelectedPatrols || []).length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.summarySortBy"
        :items="sortOptions"
        item-text="text"
        item-value="value"
        label="Sort by"
        dense
        hide-details
        style="max-width: 180px"
        class="oas-vue-filter-select"
        @change="patch({ summarySortBy: $event })"
      ></v-select>

      <NameFormatSelect :value="filters.summaryNameFormat" @input="patch({ summaryNameFormat: $event })" />

      <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
    </div>
  </div>
</template>

<script lang="ts" src="./OASPeakAwardSummaryFiltersVue.ts">
</script>

<style scoped>
/* Same shared label styling as OASProgressionFiltersVue.vue's own filter row — see that file's
   own comment for the full DevTools-confirmed rationale. Duplicated here (not extracted) since
   Vue SFC `scoped` styles don't cross component files. */
.oas-vue-select-summary {
  color: rgba(0, 0, 0, 0.6);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

.oas-vue-filter-select ::v-deep .v-label {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}

.oas-heatmap-controls ::v-deep .v-text-field input,
.oas-heatmap-controls ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

.oas-heatmap-controls ::v-deep .v-text-field .v-label {
  max-width: 133%;
  transform: translateY(-18px) scale(0.75);
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}
</style>
