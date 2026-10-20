<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <v-select
        :value="filters.skills"
        :items="skillOptions"
        item-text="text"
        item-value="value"
        label="Skills"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        @change="patch({ skills: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ filters.skills.length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.stageFrom"
        :items="stageOptions"
        label="Stage from"
        dense
        hide-details
        style="max-width: 100px"
        class="oas-vue-filter-select"
        @change="onStageFromChange"
      ></v-select>

      <v-select
        :value="filters.stageTo"
        :items="stageOptions"
        label="Stage to"
        dense
        hide-details
        style="max-width: 100px"
        class="oas-vue-filter-select"
        @change="onStageToChange"
      ></v-select>

      <fieldset class="istatement-display-group">
        <legend class="istatement-display-legend">Display</legend>
        <v-checkbox
          :input-value="filters.hideEmptyRows"
          label="Hide empty statements"
          dense
          hide-details
          class="istatement-display-check"
          @change="patch({ hideEmptyRows: !!$event })"
        ></v-checkbox>
        <v-checkbox
          :input-value="filters.hideEmptyStages"
          label="Hide empty stages"
          dense
          hide-details
          class="istatement-display-check"
          @change="patch({ hideEmptyStages: !!$event })"
        ></v-checkbox>
        <v-checkbox
          :input-value="filters.hideEmptyGroups"
          label="Hide empty streams"
          dense
          hide-details
          class="istatement-display-check"
          @change="patch({ hideEmptyGroups: !!$event })"
        ></v-checkbox>
      </fieldset>

      <v-spacer></v-spacer>
      <SummitPillButton @click="$emit('reset')">Reset</SummitPillButton>
    </div>
  </div>
</template>

<script lang="ts" src="./IStatementFilters.ts">
</script>

<style scoped>
.istatement-display-group {
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  padding: 0;
  margin: 0;
}

/* Gotcha: a page-level rule gives <legend> width: 100%. */
.istatement-display-legend {
  width: auto;
  font-size: var(--oas-vue-font-size-heading);
  padding-right: 4px;
}

.istatement-display-check {
  margin-top: 0;
  padding-top: 0;
  font-size: var(--oas-vue-font-size-body);
}
</style>
