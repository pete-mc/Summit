import Summit from "../services/summit";
import { NuxtAppOptions } from "@nuxt/types";

interface MyNuxtApp extends NuxtAppOptions {
  // add your own properties and methods here
}

export {};

declare global {
  interface Window {
    Summit: Summit;
  }
}
