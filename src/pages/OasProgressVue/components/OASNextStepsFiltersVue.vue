<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <v-autocomplete :value="memberId" :items="memberOptions" item-text="text" item-value="value" label="Member" dense hide-details style="max-width: 240px" class="oas-vue-filter-select" @change="onMemberChange"></v-autocomplete>

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
        @change="$emit('update:skillStream', $event)"
      ></v-select>

      <v-select :value="stage" :items="stageOptions" label="Stage" dense hide-details style="max-width: 100px" class="oas-vue-filter-select" @change="$emit('update:stage', $event)"></v-select>

      <NameFormatSelect :value="nameFormat" @input="$emit('update:nameFormat', $event)" />

      <v-btn text color="primary" @click="$emit('reset')">Reset filters</v-btn>
    </div>
  </div>
</template>

<script lang="ts" src="./OASNextStepsFiltersVue.ts"></script>

<style scoped>
/* Kept in sync by hand with OASSummaryTabFiltersVue.vue: scoped styles can't be shared. */
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
</style>
