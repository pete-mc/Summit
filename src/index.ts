import "./styles/index.css";
import "vuetify/dist/vuetify.css";
import Vue from "vue";
import Vuetify from "vuetify";
import summitModule from "@/modules/summitModule";
import SummitRouter from "@/router/SummitRouter";
import $ from "jquery";
window.$ = $;

/**
 * Spike: registers Vuetify's components (v-select, v-btn, etc.) on Summit's OWN bundled Vue
 * module — the one vue-loader compiles Summit's .vue SFCs against — not Terrain's Vue instance.
 * Reaching Terrain's live $vuetify service (window.$nuxt.$root.$vuetify) alone was proven
 * insufficient: it gives the theme/service singleton but not usable components, since component
 * registration and the service instance are separate parts of Vuetify's install process. See the
 * OAS Progression Vuetify investigation notes for the full reasoning.
 */
Vue.use(Vuetify);
window.summitVuetify = new Vuetify();

$(function () {
  window.$nuxt.$store.registerModule("Summit", summitModule);
  window.$nuxt.$store.dispatch("Summit/initialize");
  SummitRouter.getInstance().finaliseSetup();
  const TerrainVue = window.$nuxt.$root && window.$nuxt.$root.constructor;
  window.Vue = TerrainVue as never;
});

$.fn.xpath = function (expr) {
  const found = [];
  const context = this[0];
  const result = document.evaluate(expr, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  let node;
  while ((node = result.iterateNext())) {
    found.push(node);
  }
  return $(found);
};
