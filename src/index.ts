import TestComponent from "./components/TestComponent.vue";
import summitModule from "./modules/summitModule";

window.$nuxt.$store.registerModule("Summit", summitModule);

//wait for module to register
setTimeout(() => {
  window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World");
}, 2000);

const router = window.$nuxt.$router;
router.addRoute({ path: "/TestComponent", component: TestComponent });
router.push("/TestComponent");

setTimeout(() => {
  window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World 2");
}, 4000);
