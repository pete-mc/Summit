<template>
  <div class="summit-loading-state">
    <!--
      Indeterminate until the page can count something, determinate once it can. I Statements'
      two phases ("Loading skill trees..." then "Loading templates 47/180...") are the reference
      case: the first cannot know its total, the second can.
    -->
    <v-progress-linear
      v-if="state === 'loading'"
      :indeterminate="!hasCounts"
      :value="percent"
      color="primary"
      class="summit-loading-bar"
    ></v-progress-linear>

    <div v-else-if="state === 'error'" class="summit-loading-error">
      <p>{{ errorMessage }}</p>
      <v-btn v-if="onRetry" outlined color="primary" class="summit-loading-retry" @click="onRetry">Retry</v-btn>
    </div>
  </div>
</template>

<script lang="ts" src="./SummitLoadingState.ts">
</script>

<style scoped>
/*
 * Scoped rather than in index.css, deliberately. DESIGN.md says a shared *class* belongs in the
 * global sheet — but this is a shared *component*, so its styles travel with it and cannot be
 * redeclared per page. That is strictly stronger than a shared class: .oas-vue-filter-panel
 * ended up declared by two of three pages with different gaps precisely because a class can be
 * copied. A component cannot.
 */
.summit-loading-state {
  font-family: var(--oas-vue-font-family, NunitoSans-regular, arial, sans-serif);
  font-size: var(--oas-vue-font-size-body, 14px);
}

/*
 * The pages set --oas-vue-* on their own root, and custom properties inherit through the DOM
 * regardless of scoped-CSS boundaries, so this picks up each page's scale automatically. The
 * fallbacks cover a page that has not declared them.
 */
.summit-loading-bar {
  margin: var(--summit-space-sm, 8px) 0;
}

.summit-loading-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--summit-space-sm, 8px);
  padding: var(--summit-space-sm, 8px) 0;
  color: var(--summit-color-text-danger);
}

.summit-loading-error p {
  margin: 0;
}

/* Matches the pill buttons the three pages already use in their header rows. */
.summit-loading-retry.v-btn {
  font-size: 14px;
  font-weight: 600;
  height: 35px !important;
  min-width: 80px;
  padding: 0 18px;
  border-radius: 25px;
  text-transform: none;
  letter-spacing: normal;
}
</style>
