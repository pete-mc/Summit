<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
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
        :value="filters.worksheetStageRange[0]"
        :items="stageOptions"
        label="Stage from"
        dense
        hide-details
        style="max-width: 100px"
        class="oas-vue-filter-select"
        @change="onStageMinChange"
      ></v-select>
      <v-select
        :value="filters.worksheetStageRange[1]"
        :items="stageOptions"
        label="Stage to"
        dense
        hide-details
        style="max-width: 100px"
        class="oas-vue-filter-select"
        @change="onStageMaxChange"
      ></v-select>

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

      <fieldset class="oas-heatmap-display-group">
        <legend class="oas-heatmap-filter-label oas-vue-filter-heading-match">Display</legend>
        <v-checkbox :input-value="filters.worksheetUseCodenames" label="Use codenames" dense hide-details @change="onUseCodenamesChange"></v-checkbox>
        <v-checkbox
          :input-value="filters.worksheetHideLastName"
          :disabled="filters.worksheetUseCodenames"
          label="Hide last name"
          dense
          hide-details
          @change="patch({ worksheetHideLastName: $event })"
        ></v-checkbox>
        <!-- Hidden when there is nothing to group by — matches OASProgressionFiltersVue's own
             "Break by patrol" visibility rule. -->
        <v-checkbox v-if="availablePatrols.length > 0" :input-value="filters.worksheetBreakByPatrol" label="Break by patrol" dense hide-details @change="patch({ worksheetBreakByPatrol: $event })"></v-checkbox>
        <v-checkbox :input-value="filters.worksheetHideCompleted" label="Hide completed" dense hide-details @change="patch({ worksheetHideCompleted: $event })"></v-checkbox>
      </fieldset>

      <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
    </div>

    <div class="oas-vue-selected-skills">
      <v-chip
        v-for="skill in filters.worksheetVisibleSkills"
        :key="skill"
        close
        small
        class="oas-vue-skill-chip"
        @click:close="patch({ worksheetVisibleSkills: filters.worksheetVisibleSkills.filter((s) => s !== skill) })"
      >
        {{ (skillOptions.find((o) => o.value === skill) || {}).text || skill }}
      </v-chip>
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

.oas-vue-selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.oas-vue-skill-chip {
  margin: 0;
}

.oas-heatmap-display-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 20px;
  row-gap: 4px;
  border: none;
  padding: 0;
  margin: 0;
}

.oas-heatmap-display-group ::v-deep .v-input--checkbox {
  margin-top: 0;
  padding-top: 0;
  flex: 0 0 auto;
}

.oas-heatmap-display-group ::v-deep .v-input--selection-controls__input {
  margin-right: 12px !important;
}

/*
 * Same shared heading values as OASProgressionFiltersVue's identical rule — see that file's long
 * comment for the full "why" (measured live off Terrain's Skills label, not re-derived from
 * Vuetify's scale factor). Kept as its own copy here rather than factored out, matching how
 * PresentAwardsFiltersVue also carries its own copy — each filter bar is a separate component by
 * design (PLAN_STAGE_3.md §3), and this specific rule set has already drifted once when assumed
 * "the same" without being stated explicitly in each place.
 */
.oas-vue-filter-heading-match {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
  padding: 0;
  border: 0;
}

.oas-heatmap-display-group legend.oas-vue-filter-heading-match {
  font-size: 15px !important;
  display: inline-block !important;
  width: auto !important;
}

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
