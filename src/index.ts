import "./styles/index.css";
import summitModule from "@/modules/summitModule";
import SummitRouter from "@/router/SummitRouter";
import $ from "jquery";

setTimeout(() => {
  window.$ = $;
  window.$nuxt.$store.registerModule("Summit", summitModule);
  window.$nuxt.$store.dispatch("Summit/initialize");
  SummitRouter.getInstance();
}, 1000);

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
