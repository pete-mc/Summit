<template>
  <v-btn v-bind="$attrs" :outlined="isMinor" :depressed="!isMinor" :dark="!isMinor" :color="colour" :class="['summit-pill-btn', `summit-pill-btn--${isMinor ? 'minor' : 'major'}`]" v-on="$listeners">
    <slot />
  </v-btn>
</template>

<script lang="ts" src="./SummitPillButton.ts"></script>

<style scoped>
/*
 * Terrain's .medium + button rules (see the .ts). The same declarations the four page-level
 * copies had, which were confirmed live against Terrain's buttons — height keeps its !important
 * because Vuetify's own size rule ties on specificity and otherwise wins on a cold load (DESIGN.md
 * "Summit's CSS loses cascade ties").
 */
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

/* Terrain's .minor: outlined, on white rather than Vuetify's transparent. */
.summit-pill-btn--minor.v-btn {
  background-color: var(--color-white, #fff);
}
</style>
