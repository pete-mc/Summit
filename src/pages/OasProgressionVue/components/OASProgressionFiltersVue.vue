<template>
  <div class="oas-vue-filter-panel">
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
        dense
        hide-details
        style="max-width: 220px"
        @change="patch({ visibleStreams: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ filters.visibleStreams.length }} selected</span>
        </template>
      </v-select>

      <v-select
        v-if="availablePatrols.length > 0"
        :value="selectedPatrolsForDisplay"
        :items="availablePatrols"
        label="Patrol"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        @change="patch({ selectedPatrols: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ selectedPatrolsForDisplay.length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.stageRange[0]"
        :items="stageOptions"
        label="Stage from"
        dense
        hide-details
        style="max-width: 100px"
        @change="onStageMinChange"
      ></v-select>
      <v-select
        :value="filters.stageRange[1]"
        :items="stageOptions"
        label="Stage to"
        dense
        hide-details
        style="max-width: 100px"
        @change="onStageMaxChange"
      ></v-select>

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

      <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
    </div>

    <div class="oas-vue-selected-skills">
      <v-chip v-for="skill in filters.visibleStreams" :key="skill" close small class="oas-vue-skill-chip" @click:close="patch({ visibleStreams: filters.visibleStreams.filter((s) => s !== skill) })">
        {{ (skillOptions.find((o) => o.value === skill) || {}).text || skill }}
      </v-chip>
    </div>

    <fieldset class="oas-field oas-heatmap-display-group">
      <legend class="oas-heatmap-filter-label">Display</legend>
      <v-checkbox :input-value="filters.useCodenames" label="Use codenames" dense hide-details @change="onUseCodenamesChange"></v-checkbox>
      <v-checkbox :input-value="filters.hideLastName" :disabled="filters.useCodenames" label="Hide last name" dense hide-details @change="patch({ hideLastName: $event })"></v-checkbox>
      <v-checkbox v-if="availablePatrols.length > 0" :input-value="filters.breakByPatrol" label="Break by patrol" dense hide-details @change="patch({ breakByPatrol: $event })"></v-checkbox>
      <v-checkbox v-if="hasAnyEmptySections" :input-value="filters.hideEmptyStreams" label="Hide empty streams" dense hide-details @change="patch({ hideEmptyStreams: $event })"></v-checkbox>
      <v-checkbox :input-value="filters.hideEmptyTopColumns" label="Hide empty top columns" dense hide-details @change="patch({ hideEmptyTopColumns: $event })"></v-checkbox>
      <v-checkbox :input-value="filters.onlyInProgress" label="Only show in-progress" dense hide-details @change="patch({ onlyInProgress: $event })"></v-checkbox>
    </fieldset>
  </div>
</template>

<script lang="ts" src="./OASProgressionFiltersVue.ts">
</script>

<style scoped>
.oas-vue-filter-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.oas-vue-select-summary {
  color: rgba(0, 0, 0, 0.6);
}

.oas-vue-selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.oas-vue-skill-chip {
  margin: 0;
}
</style>
