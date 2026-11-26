<template>
  <div class="summit-display-options">
    <!-- Gotcha: v-tab's identity prop is `tab-value`, NOT `value`. -->
    <v-tabs v-model="tab" height="40" color="primary" background-color="grey lighten-5">
      <v-tab tab-value="filters">Filters</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item value="filters">
        <FilterDefaultsVue />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts" src="./DisplayOptionsTabsVue.ts"></script>

<style scoped>
/* Same type scale as OAS Progress (OasProgressVueContent.vue), so the controls match its filter panels. */
.summit-display-options {
  --oas-vue-font-size-heading: 18px;
  --oas-vue-font-size-body: 14px;
  --oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
  padding: 8px 0;
}

.summit-display-options ::v-deep .v-tab {
  text-transform: none;
  letter-spacing: normal;
}
</style>
