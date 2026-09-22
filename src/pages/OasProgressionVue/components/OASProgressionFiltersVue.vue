<template>
  <div class="oas-heatmap-controls">
    <v-text-field
      :value="filters.memberFilter"
      label="Member"
      placeholder="Name"
      prepend-inner-icon="mdi-magnify"
      dense
      hide-details
      clearable
      style="max-width: 220px"
      @input="patch({ memberFilter: $event || '' })"
    ></v-text-field>

    <v-select
      :value="filters.visibleStreams"
      :items="skillOptions"
      item-text="text"
      item-value="value"
      label="Skills"
      multiple
      chips
      deletable-chips
      dense
      hide-details
      style="max-width: 260px"
      @change="patch({ visibleStreams: $event })"
    ></v-select>

    <v-select
      v-if="availablePatrols.length > 0"
      :value="selectedPatrolsForDisplay"
      :items="availablePatrols"
      label="Patrol"
      multiple
      chips
      deletable-chips
      dense
      hide-details
      style="max-width: 260px"
      @change="patch({ selectedPatrols: $event })"
    ></v-select>

    <div class="oas-field" data-oas-stage-range="true">
      <label class="oas-heatmap-filter-label">Stage</label>
      <div class="oas-stage-range-controls">
        <v-select :value="filters.stageRange[0]" :items="stageOptions" dense hide-details style="max-width: 80px" @change="onStageMinChange"></v-select>
        <span>to</span>
        <v-select :value="filters.stageRange[1]" :items="stageOptions" dense hide-details style="max-width: 80px" @change="onStageMaxChange"></v-select>
      </div>
    </div>

    <v-select
      :value="filters.sortBy"
      :items="sortOptions"
      item-text="text"
      item-value="value"
      label="Sort by"
      dense
      hide-details
      style="max-width: 180px"
      @change="patch({ sortBy: $event })"
    ></v-select>

    <fieldset class="oas-field oas-heatmap-display-group">
      <legend class="oas-heatmap-filter-label">Display</legend>
      <v-checkbox :input-value="filters.useCodenames" label="Use codenames" dense hide-details @change="onUseCodenamesChange"></v-checkbox>
      <v-checkbox :input-value="filters.hideLastName" :disabled="filters.useCodenames" label="Hide last name" dense hide-details @change="patch({ hideLastName: $event })"></v-checkbox>
      <v-checkbox v-if="availablePatrols.length > 0" :input-value="filters.breakByPatrol" label="Break by patrol" dense hide-details @change="patch({ breakByPatrol: $event })"></v-checkbox>
      <v-checkbox v-if="hasAnyEmptySections" :input-value="filters.hideEmptyStreams" label="Hide empty streams" dense hide-details @change="patch({ hideEmptyStreams: $event })"></v-checkbox>
      <v-checkbox :input-value="filters.hideEmptyTopColumns" label="Hide empty top columns" dense hide-details @change="patch({ hideEmptyTopColumns: $event })"></v-checkbox>
      <v-checkbox :input-value="filters.onlyInProgress" label="Only show in-progress" dense hide-details @change="patch({ onlyInProgress: $event })"></v-checkbox>
    </fieldset>

    <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
  </div>
</template>

<script lang="ts" src="./OASProgressionFiltersVue.ts">
</script>
