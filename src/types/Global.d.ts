import { type NuxtApp } from "@nuxt/types/app";
import type VuetifyType from "vuetify";

declare global {
  interface Window {
    $nuxt: NuxtApp;
    $: JQueryStatic;
    /** Spike: Vuetify instance installed against Summit's own bundled Vue — see src/index.ts. */
    summitVuetify: VuetifyType;
  }
  interface JQuery {
    xpath(expr: string): JQuery<Node[]>;
  }
}
