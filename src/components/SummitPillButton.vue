<template>
  <v-btn v-bind="$attrs" :outlined="isMinor" :depressed="!isMinor" :dark="!isMinor" :color="colour" :class="['summit-pill-btn', `summit-pill-btn--${isMinor ? 'minor' : 'major'}`]" v-on="$listeners">
    <slot />
  </v-btn>
</template>

<script lang="ts" src="./SummitPillButton.ts"></script>

<style scoped>
/* Gotcha: height needs !important, because Vuetify's size rule ties and wins on a cold load. */
.summit-pill-btn.v-btn {
  font-size: 14px;
  font-weight: 600;
  height: 35px !important;
  min-width: 80px;
  padding: 0 18px;
  border-radius: 25px;
  text-transform: none;
  letter-spacing: normal;
}

.summit-pill-btn--minor.v-btn {
  background-color: var(--color-white, #fff);
}
</style>
