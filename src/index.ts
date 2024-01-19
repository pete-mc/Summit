import TestComponent from "./components/TestComponent.vue";
import { findComponent } from "./helpers/findComponent";
import summitModule from "./modules/summitModule";
import { NavMenuComponent } from "./types/NavMenu";

const Vue = window.$nuxt.$root && window.$nuxt.$root.constructor; // Add Vue object.
window.Vue = Vue as never; // Add to window object.

const VueInstance = window.$nuxt.$root;

window.$nuxt.$store.registerModule("Summit", summitModule);

// add route to page
const router = window.$nuxt.$router;
router.addRoute({ path: "/TestComponent", component: TestComponent });

// add the route to the menu
window.$nuxt.$nextTick(() => {
  const navMenuComponent: NavMenuComponent = findComponent("NavMenu", VueInstance) as NavMenuComponent;
  if (navMenuComponent) {
    navMenuComponent.items.push({ title: "Test", to: "/TestComponent", items: [], locked: false, roles: [true, false] });
    navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer; //flip this back and forth to force a re-render
    navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer;
  }
});

//wait for module to register and change the value of the state
setTimeout(() => {
  window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World");
}, 2000);

//change the value of the state again afte a bit longer
setTimeout(() => {
  window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World 2");
}, 4000);
