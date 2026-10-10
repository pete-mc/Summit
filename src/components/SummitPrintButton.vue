<template>
  <span class="summit-print-button">
    <v-btn outlined color="primary" class="oas-vue-pill-btn" :disabled="busy" @click="open = true">{{ label }}</v-btn>

    <v-dialog v-model="open" max-width="380">
      <v-card>
        <v-card-title class="text-subtitle-1">Print or save as PDF</v-card-title>
        <v-card-text>
          <v-select v-model="settings.pageSize" :items="pageSizes" label="Page size" dense outlined hide-details class="mb-4" />
          <!--
            Radios, not a v-btn-toggle: on Terrain the toggle's buttons rendered as dark rounded
            pills (seen live 2026-10-10) — outside Summit's own styles, since the dialog is detached
            to the app root. Plain radios match the Layout choice below and leave nothing to restyle.
          -->
          <v-radio-group v-model="settings.orientation" row dense hide-details class="mt-0 mb-4">
            <v-radio value="portrait" label="Portrait" />
            <v-radio value="landscape" label="Landscape" />
          </v-radio-group>
          <v-select v-model="settings.margins" :items="marginItems" label="Margins" dense outlined hide-details class="mb-4" />
          <v-radio-group v-model="settings.layout" dense hide-details class="mt-0">
            <v-radio value="fit" label="Fit to page width" />
            <v-radio value="split" label="Keep full size, split across pages" />
          </v-radio-group>
          <p class="text-caption mt-4 mb-0">
            In the next dialog choose a printer, or <strong>Save as PDF</strong>. Leave paper size and scale at their defaults, and untick
            <strong>Headers and footers</strong>.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="open = false">Cancel</v-btn>
          <v-btn color="primary" depressed :loading="busy" @click="go">Continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="warn" timeout="6000" color="warning">{{ warnText }}</v-snackbar>
  </span>
</template>

<script lang="ts" src="./SummitPrintButton.ts"></script>

<style scoped>
/*
 * Same pill look as the page toolbars' other buttons. A scoped .oas-vue-pill-btn rule in a parent
 * page can't reach a v-btn rendered inside this component, so the rule is restated here. NOTE:
 * this is now the fourth copy (OasProgressionVueContent, PresentAwardsVueContent,
 * IStatementsContent each declare their own) — consolidating them is a separate follow-up, see
 * .claude/Print/PLAN_STAGE_1.md.
 */
.oas-vue-pill-btn.v-btn {
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
