import summitModule from "./modules/summitModule";
import { initPages } from "./router";

const Vue = window.$nuxt.$root && window.$nuxt.$root.constructor;
window.Vue = Vue as never;

window.$nuxt.$store.registerModule("Summit", summitModule);

window.$nuxt.$nextTick(() => {
  initPages();
});
