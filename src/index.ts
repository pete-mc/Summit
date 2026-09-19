// Must be the first import: registers Vuetify against Summit's own Vue before any .vue module
// (pulled in via SummitRouter below) is evaluated. See src/vuetifySetup.ts for why this ordering
// matters and can't be achieved by just placing Vue.use(Vuetify) here in source order.
import "./vuetifySetup";
import "./styles/index.css";
import summitModule from "@/modules/summitModule";
import SummitRouter from "@/router/SummitRouter";
import $ from "jquery";
window.$ = $;

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
