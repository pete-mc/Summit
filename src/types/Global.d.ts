import { type NuxtApp } from "@nuxt/types/app";
declare global {
  interface Window {
    $nuxt: NuxtApp;
    $: JQueryStatic;
  }
  interface JQuery {
    xpath(expr: string): JQuery<Node[]>;
  }
}
