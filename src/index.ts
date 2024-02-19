import "./styles/index.css";
import summitModule from "@/modules/summitModule";
import SummitRouter from "@/router/SummitRouter";
import $ from "jquery";

$(function () {
  window.$ = $;
  window.$nuxt.$store.registerModule("Summit", summitModule);
  window.$nuxt.$store.dispatch("Summit/initialize");
  SummitRouter.getInstance();
  const Vue = window.$nuxt.$root && window.$nuxt.$root.constructor;
  window.Vue = Vue as never;
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
