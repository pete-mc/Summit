import { NuxtApp } from "@nuxt/types/app";

export {};

declare global {
  interface Window {
    $nuxt: NuxtApp;
  }
}
