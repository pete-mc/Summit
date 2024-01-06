import MyComponent from "./components/MyComponent.vue";
import summitModule from "./modules/summitModule";

window.$nuxt.$store.registerModule("Summit", summitModule);

//wait for module to register
setTimeout(() => {
  window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World");
}, 2000);

const router = window.$nuxt.$router;
router.addRoute({ path: "/my-new-component", component: MyComponent });
router.push("/my-new-component");

setTimeout(() => {
  window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World 2");
}, 4000);
