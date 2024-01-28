import { type NuxtApp } from '@nuxt/types/app'
declare global {
  interface Window {
    $nuxt: NuxtApp
  }
}
