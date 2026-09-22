import { type NuxtApp } from "@nuxt/types/app";
import type VuetifyType from "vuetify";

declare global {
  interface Window {
    $nuxt: NuxtApp;
    $: JQueryStatic;
    /** Vuetify instance installed against Summit's own bundled Vue — see src/vuetifySetup.ts. */
    summitVuetify: VuetifyType;
  }
  interface JQuery {
    xpath(expr: string): JQuery<Node[]>;
  }
}
