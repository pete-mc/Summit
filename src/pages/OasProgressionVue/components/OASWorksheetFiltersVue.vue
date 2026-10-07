<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <v-select
        v-if="canFilterByPatrol"
        :value="filters.worksheetSelectedPatrols || []"
        :items="patrolFilterOptions"
        label="Patrol"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        @change="patch({ worksheetSelectedPatrols: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ (filters.worksheetSelectedPatrols || []).length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.worksheetVisibleSkills"
        :items="skillOptions"
        item-text="text"
        item-value="value"
        label="Skills"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        @change="patch({ worksheetVisibleSkills: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ filters.worksheetVisibleSkills.length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.worksheetVisibleStages"
        :items="stageOptions"
        label="Stages"
        multiple
        dense
        hide-details
        style="max-width: 140px"
        class="oas-vue-filter-select"
        @change="patch({ worksheetVisibleStages: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ filters.worksheetVisibleStages.length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.worksheetLayout"
        :items="layoutOptions"
        item-text="text"
        item-value="value"
        label="Layout"
        dense
        hide-details
        style="max-width: 190px"
        class="oas-vue-filter-select"
        @change="patch({ worksheetLayout: $event })"
      ></v-select>

      <NameFormatSelect :value="filters.worksheetNameFormat" @input="patch({ worksheetNameFormat: $event })" />

      <v-select
        :value="showSelection"
        :items="showOptions"
        item-text="text"
        item-value="value"
        label="Show"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        :menu-props="{ contentClass: 'oas-vue-show-menu' }"
        @change="onShowChange"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ showSelection.length }} selected</span>
        </template>
      </v-select>

      <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
    </div>
  </div>
</template>

<script lang="ts" src="./OASWorksheetFiltersVue.ts">
</script>

<style scoped>
/*
 * Copied from OASProgressionFiltersVue.vue's own identical block — see that file's comment for
 * the full rationale (the slot replaces Vuetify's native .v-select__selection element entirely,
 * so it needs its own explicit sizing rather than inheriting the ::v-deep rule below).
 */
.oas-vue-select-summary {
  color: rgba(0, 0, 0, 0.6);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/*
 * Same shared heading values as OASProgressionFiltersVue's identical rule — see that file's long
 * comment for the full "why" (measured live off Terrain's Skills label, not re-derived from
 * Vuetify's scale factor). Kept as its own copy here rather than factored out, matching how
 * PresentAwardsFiltersVue also carries its own copy — each filter bar is a separate component by
 * design (PLAN_STAGE_3.md §3), and this specific rule set has already drifted once when assumed
 * "the same" without being stated explicitly in each place.
 */
.oas-vue-filter-select ::v-deep .v-label {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}

/*
 * Unlike OASProgressionFiltersVue this bar has no v-text-field (no Member search — a worksheet is
 * organised by skill/stage/patrol, not searched by name), so only v-select's own selected-value
 * text needs the shared body size/family override.
 */
.oas-heatmap-controls ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}
</style>
