<template>
  <div class="summit-filter-defaults">
    <p class="summit-filter-defaults__intro">Report tabs start with these default filter settings, and go back to them when 'Reset Filters' is pressed. The Patrol selection defaults to All Patrols.</p>

    <div class="summit-filter-defaults__controls">
      <NameFormatSelect :value="defaults.nameFormat" @input="update({ nameFormat: $event })" />
      <v-select
        :value="defaults.sortBy"
        :items="sortOptions"
        item-text="text"
        item-value="value"
        label="Sort by"
        dense
        hide-details
        style="max-width: 160px"
        class="oas-vue-filter-select"
        @change="update({ sortBy: $event })"
      ></v-select>
    </div>

    <div class="summit-filter-defaults__heading">Show</div>
    <div v-for="option in showOptions" :key="option.key" class="summit-filter-defaults__switch-row">
      <label :for="'summit-filter-default-' + option.key">{{ option.label }}</label>
      <v-switch :id="'summit-filter-default-' + option.key" :input-value="defaults[option.key]" inset dense hide-details class="ma-0 pa-0" @change="update({ [option.key]: !!$event })"></v-switch>
    </div>

    <div class="summit-filter-defaults__actions">
      <SummitPillButton @click="resetToSystemDefaults">Reset to system defaults</SummitPillButton>
      <SummitPillButton variant="major" @click="confirmApplyOpen = true">Apply defaults to all pages</SummitPillButton>
    </div>

    <v-dialog v-model="confirmApplyOpen" max-width="420">
      <v-card>
        <v-card-title class="text-subtitle-1">Apply defaults to all pages?</v-card-title>
        <v-card-text>This replaces the name format, sort, patrol and show settings on every report tab with these defaults. Other filters are kept.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="confirmApplyOpen = false">Cancel</v-btn>
          <v-btn text color="primary" @click="applyToAllPages">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" src="./FilterDefaultsVue.ts"></script>

<style scoped>
.summit-filter-defaults {
  padding: var(--summit-space-lg) 0;
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
}

.summit-filter-defaults__intro {
  margin-bottom: var(--summit-space-lg);
}

.summit-filter-defaults__controls {
  display: flex;
  flex-direction: column;
  gap: var(--summit-space-lg);
}

/* Kept in sync by hand with the OAS Progress filter panels: scoped styles can't be shared. */
.summit-filter-defaults ::v-deep .oas-vue-filter-select .v-label {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}

.summit-filter-defaults ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

/* Matches the tab names on the OAS Progress About tab (OASAboutTabsVue.vue). */
.summit-filter-defaults__heading {
  margin: calc(var(--summit-space-lg) * 1.5) 0 var(--summit-space-sm);
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
  font-weight: var(--summit-font-weight-semibold, 600);
  color: var(--color-scouts-medium-blue, #00348d);
}

.summit-filter-defaults__switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 280px;
  min-height: 36px;
}

.summit-filter-defaults__switch-row label {
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
  cursor: pointer;
}

.summit-filter-defaults__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--summit-space-md);
  margin-top: var(--summit-space-lg);
}
</style>
