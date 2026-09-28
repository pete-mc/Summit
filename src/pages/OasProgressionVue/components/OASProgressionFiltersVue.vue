<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <v-text-field
        :value="filters.memberFilter"
        label="Member"
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
        class="oas-vue-filter-select"
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
        class="oas-vue-filter-select"
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
        class="oas-vue-filter-select"
        @change="onStageMinChange"
      ></v-select>
      <v-select
        :value="filters.stageRange[1]"
        :items="stageOptions"
        label="Stage to"
        dense
        hide-details
        style="max-width: 100px"
        class="oas-vue-filter-select"
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
        class="oas-vue-filter-select"
        @change="patch({ sortBy: $event })"
      ></v-select>

      <fieldset class="oas-heatmap-display-group">
        <legend class="oas-heatmap-filter-label oas-vue-filter-heading-match">Display</legend>
        <v-checkbox :input-value="filters.useCodenames" label="Use codenames" dense hide-details @change="onUseCodenamesChange"></v-checkbox>
        <v-checkbox :input-value="filters.hideLastName" :disabled="filters.useCodenames" label="Hide last name" dense hide-details @change="patch({ hideLastName: $event })"></v-checkbox>
        <v-checkbox v-if="availablePatrols.length > 0" :input-value="filters.breakByPatrol" label="Break by patrol" dense hide-details @change="patch({ breakByPatrol: $event })"></v-checkbox>
        <v-checkbox :input-value="filters.hideEmptyStreams" label="Hide empty skills" dense hide-details @change="patch({ hideEmptyStreams: $event })"></v-checkbox>
        <v-checkbox :input-value="filters.hideEmptyTopColumns" label="Hide empty top stages" dense hide-details @change="patch({ hideEmptyTopColumns: $event })"></v-checkbox>
        <v-checkbox :input-value="filters.onlyInProgress" label="Hide complete/not started" dense hide-details @change="patch({ onlyInProgress: $event })"></v-checkbox>
        <v-checkbox :input-value="filters.hideAnswered" label="Hide answered" dense hide-details @change="patch({ hideAnswered: $event })"></v-checkbox>
      </fieldset>

      <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
    </div>

    <div class="oas-vue-selected-skills">
      <v-chip v-for="skill in filters.visibleStreams" :key="skill" close small class="oas-vue-skill-chip" @click:close="patch({ visibleStreams: filters.visibleStreams.filter((s) => s !== skill) })">
        {{ (skillOptions.find((o) => o.value === skill) || {}).text || skill }}
      </v-chip>
    </div>
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

/*
 * This is a custom <span> in the v-select's own #selection slot template, not Vuetify's native
 * .v-select__selection element the ::v-deep rule below targets — it renders instead of that
 * element (this slot replaces it), so it never picked up that rule's body size/family and was
 * left at whatever size it inherits ambiently. Sized explicitly to match, via the shared scale
 * defined on .oas-vue-content (see OasProgressionVueContent.vue).
 */
.oas-vue-select-summary {
  color: rgba(0, 0, 0, 0.6);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

.oas-vue-selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.oas-vue-skill-chip {
  margin: 0;
}

.oas-heatmap-display-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 20px;
  row-gap: 4px;
  /* A bare <fieldset> carries the browser's own default border/padding/margin (renders as a
     stray line around the checkbox row) — reset explicitly rather than relying on nothing
     overriding it. */
  border: none;
  padding: 0;
  margin: 0;
}

/* Vuetify's v-checkbox reserves generous default spacing around each control (a 16px top
   margin plus its own click-ripple padding) meant for a vertical list of checkboxes, not a
   dense inline row — tighten both here so the label sits close to its own circle rather than
   drifting toward the next one. */
.oas-heatmap-display-group ::v-deep .v-input--checkbox {
  margin-top: 0;
  padding-top: 0;
  flex: 0 0 auto;
}

/*
 * Terrain's own page-level CSS restyles every checkbox into a custom pill/circle look and, as
 * part of that, sets its own margin-right: 24px — confirmed via live DevTools as the actual
 * winning rule: `.v-application.theme--light .v-input--checkbox .v-input--selection-controls__input`.
 * That selector's specificity (3 classes) ties with ours below (class + attribute + class), so
 * cascade order alone wasn't reliably deciding the winner — !important guarantees ours does.
 */
.oas-heatmap-display-group ::v-deep .v-input--selection-controls__input {
  margin-right: 12px !important;
}

/*
 * ONE shared set of values — Skills' own label styling, exactly as read off its live Computed
 * panel — applied identically to every filter heading on this row (Member, Display, and every
 * v-select label via .oas-vue-filter-select below), via the shared --oas-vue-font-size-heading/
 * --oas-vue-font-family scale defined once on .oas-vue-content (OasProgressionVueContent.vue) so
 * every heading references the same source of truth instead of each carrying its own hardcoded
 * copy of the number. Deliberately NOT per-element "native" values: an earlier attempt replicated
 * each element's own distinct underlying Terrain rule (Member's v-text-field rule differs from a
 * v-select rule in font-weight/font-family), which produced visibly different-looking headings
 * even though each individually matched its own "correct" source rule — not what was asked for.
 * An earlier version of this comment also claimed Skills/Patrol/Stage/Sort-by's OWN native labels
 * already rendered at these values "for free" and so didn't need the class applied — that
 * assumption was wrong (Skills' native label actually measured ~20px live), which is why those
 * v-selects now carry .oas-vue-filter-select explicitly rather than relying on an unverified
 * match. The user wants ALL of them to look the same, full stop:
 *   color: #00348d (--color-scouts-medium-blue)
 *   font-weight: normal (Skills' own rule is `inherit`, which resolves to normal weight here)
 *   letter-spacing: -0.01em
 */
.oas-vue-filter-heading-match {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
  padding: 0;
  border: 0;
}

/*
 * THE ANSWER to "why does Display look bigger than Member/Skills/Stage from, when every rule says
 * they are the same size?" — after several failed attempts that all assumed it was a font problem.
 *
 * It is not a font problem. Those rules ARE identical (see above and .oas-vue-filter-select
 * below): same size, family, weight, letter-spacing. The difference is that Vuetify floats its
 * input labels by SCALING them after layout:
 *
 *   .v-text-field .v-label--active { transform: translateY(-18px) scale(0.75); }
 *
 * So a v-label declared at 18px does not paint at 18px, while a <legend> does. Both report
 * font-size: 18px in DevTools' Computed panel, because the shrink happens in the transform, after
 * computed styles are resolved — which is exactly why inspecting them side by side kept showing a
 * match while the pixels plainly differed.
 *
 * The value below is MEASURED, not computed. An initial attempt set it to 18 × 0.75 = 13.5px
 * straight from the scale factor and came out a pixel too small (9px against the labels' 10px),
 * because scale() shrinks glyphs that were laid out and hinted at 18px — which is not the same as
 * rendering natively at the scaled size — and the labels' own line-height is in play too. The
 * labels themselves measure 10px from a declared 18px, a 0.556 ratio, not the 0.75 the transform
 * alone would suggest.
 *
 * Calibrated against the user's own on-screen measurements of rendered cap height:
 *   legend at 18px   → 12px    (0.667 measured per declared px)
 *   legend at 13.5px →  9px    (same ratio, confirming it is linear)
 *   target           → 10px    → 10 ÷ 0.667 ≈ 15px
 *
 * Do not "tidy" this back to var(--oas-vue-font-size-heading), and do not re-derive it from
 * Vuetify's 0.75 — that is the mistake this comment exists to prevent. If it ever needs
 * revisiting, measure the rendered text again rather than recomputing it.
 *
 * Not solved with a matching transform on the legend: a transform changes the painted size but
 * not the layout box, which would reintroduce the alignment problem described next.
 *
 * There were TWO causes stacked on top of each other, which is why this took several passes.
 * The second, found earlier and fixed by the width/display rules here: the UA stylesheet sets
 * `legend { display: block }`, and the shared `.oas-heatmap-display-group legend` rule in
 * src/styles/index.css (written for the REACT heat-map page, where Display sits alone on its own
 * row above the checkboxes) adds `width: 100%`. On this Vue page Display sits inline among the
 * checkboxes, so that stretched it into an oversized box. `display: inline` alone did NOT win
 * against the UA and shared rules, hence !important. That fix was necessary but not sufficient —
 * the note claiming it was "the real cause" was premature, since the scale(0.75) difference
 * remained underneath it.
 */
.oas-heatmap-display-group legend.oas-vue-filter-heading-match {
  font-size: 15px !important;
  display: inline-block !important;
  width: auto !important;
}

/*
 * Applies the exact same shared heading values as .oas-vue-filter-heading-match to every
 * v-select's own native label (Skills/Patrol/Stage from/Stage to/Sort by) — see that class's
 * comment for why this is now explicit rather than assumed. Vuetify renders both the "resting"
 * (unfocused, no value) and "floated" (.v-label--active) label states as .v-label, so one rule
 * covers both; ::v-deep is required since .v-label is Vuetify-internal render output this
 * template doesn't write directly.
 */
.oas-vue-filter-select ::v-deep .v-label {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}

/*
 * Same global-rule override as OASProgressionTableVue.vue's own filter boxes (see that file's
 * comment for the full DevTools-confirmed root cause): Vuetify/Terrain's page-level CSS forces
 * v-text-field's <input> and v-select's selected-value text to 20px regardless of `dense`. Both
 * views' filter/table text is deliberately kept at the one shared body size/family (see the
 * --oas-vue-font-size-body scale on .oas-vue-content) rather than each view picking its own value.
 * ::v-deep is required — these are Vuetify-internal elements this template doesn't directly
 * write, so Vue's scoped data-v-* attribute never reaches them.
 */
.oas-heatmap-controls ::v-deep .v-text-field input,
.oas-heatmap-controls ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

/*
 * Member's label (empty field, "resting" inside the box) looked visually different from
 * Skills/Stage from/Stage to/Sort by's labels (already floated above the box, since those fields
 * already hold a value) — Vuetify only applies its `.v-label--active` class once a field has
 * focus/a value, so Member's label sits in its default resting position/style until then. Force
 * the same floated position always, and apply the SAME shared `.oas-vue-filter-heading-match`
 * values as Display (see above) rather than Member's own distinct native Terrain rule — matching
 * what was actually asked for (all headings identical), not each element's own "correct" source.
 */
.oas-heatmap-controls ::v-deep .v-text-field .v-label {
  max-width: 133%;
  transform: translateY(-18px) scale(0.75);
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}
</style>
