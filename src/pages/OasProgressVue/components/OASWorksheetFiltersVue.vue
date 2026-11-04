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
        :value="skillStream"
        :items="skillStreamOptions"
        item-text="text"
        item-value="value"
        label="Skill"
        dense
        hide-details
        style="max-width: 280px"
        class="oas-vue-filter-select"
        @change="patch({ worksheetSkillStream: $event })"
      >
        <template #item="{ item, attrs, on }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-action>
              <v-icon :color="attrs.inputValue ? 'primary' : undefined">{{ attrs.inputValue ? "mdi-radiobox-marked" : "mdi-radiobox-blank" }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
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
/* Gotcha: same as OASProgressFiltersVue.vue. The slot bypasses .v-select__selection sizing. */
.oas-vue-select-summary {
  color: rgba(0, 0, 0, 0.6);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Gotcha: kept in sync by hand with OASProgressFiltersVue.vue. It has drifted before. */
.oas-vue-filter-select ::v-deep .v-label {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}

.oas-heatmap-controls ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}
</style>
