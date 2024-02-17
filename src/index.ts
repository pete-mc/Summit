import summitModule from "@/modules/summitModule";
import SummitRouter from "@/router/SummitRouter";

setTimeout(() => {
  window.$nuxt.$store.registerModule("Summit", summitModule);
  window.$nuxt.$store.dispatch("Summit/initialize");
  SummitRouter.getInstance();
}, 1000);
