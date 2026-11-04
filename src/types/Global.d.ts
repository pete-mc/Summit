import { type NuxtApp } from "@nuxt/types/app";
import type VuetifyType from "vuetify";

declare global {
  interface Window {
    $nuxt: NuxtApp;
    $: JQueryStatic;
    summitVuetify: VuetifyType;
  }
  interface JQuery {
    xpath(expr: string): JQuery<Node[]>;
  }
}
