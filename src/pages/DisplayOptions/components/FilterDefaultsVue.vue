<template>
  <div class="summit-filter-defaults">
    <h3>Filter defaults</h3>
    <p>Report tabs start with these filters, and go back to them when you click <strong>Reset filters</strong>. Patrol filters always start at All Patrols.</p>

    <div class="summit-filter-defaults__fields">
      <v-select
        :value="defaults.nameFormat"
        :items="nameFormatOptions"
        item-text="text"
        item-value="value"
        label="Name format"
        hint="OAS Progress: every tab"
        persistent-hint
        dense
        @change="update({ nameFormat: $event })"
      ></v-select>
      <v-select
        :value="defaults.sortBy"
        :items="sortOptions"
        item-text="text"
        item-value="value"
        label="Sort by"
        hint="OAS Progress: Summary, Peak Award, Heat Map, Stage Grid"
        persistent-hint
        dense
        @change="update({ sortBy: $event })"
      ></v-select>
      <v-switch
        v-for="item in switches"
        :key="item.key"
        :input-value="defaults[item.key]"
        :label="item.label"
        :hint="item.usedOn"
        persistent-hint
        dense
        inset
        @change="update({ [item.key]: !!$event })"
      ></v-switch>
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
  max-width: 560px;
  margin-top: calc(var(--summit-space-lg) * 1.5);
}

.summit-filter-defaults__fields {
  display: flex;
  flex-direction: column;
  gap: var(--summit-space-md);
}

.summit-filter-defaults__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--summit-space-md);
  margin-top: calc(var(--summit-space-lg) * 1.5);
}
</style>
