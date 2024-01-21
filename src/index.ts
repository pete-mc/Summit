import summitModule from "./modules/summitModule";
import { initPages } from "./router";
import "./styles/datatables.min.css";
import "./styles/summit.css";
import $ from "jquery";

window.$ = $;
const Vue = window.$nuxt.$root && window.$nuxt.$root.constructor;
window.Vue = Vue as never;

window.$nuxt.$store.registerModule("Summit", summitModule);

window.$nuxt.$nextTick(() => {
  initPages();
});
