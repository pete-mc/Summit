<template>
  <span class="summit-print-button">
    <SummitPillButton :disabled="busy" @click="open = true">{{ label }}</SummitPillButton>

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
          <p v-if="lacksFooterSupport" class="text-caption mt-2 mb-0">This browser can't print page numbers — update Edge to version 131 or later for full footers.</p>
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

