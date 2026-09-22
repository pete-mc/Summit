import "vuetify/dist/vuetify.css";
import Vue from "vue";
import Vuetify from "vuetify";

/**
 * Registers Vuetify's components (v-select, v-btn, etc.) on Summit's OWN bundled Vue module — the
 * one vue-loader compiles Summit's .vue SFCs against — not Terrain's Vue instance. Reaching
 * Terrain's live $vuetify (window.$nuxt.$root.$vuetify) alone is insufficient: it gives the
 * theme/service singleton but not usable components, since component registration and the
 * service instance are separate parts of Vuetify's install process. Confirmed directly via
 * DevTools: window.$nuxt.$root.constructor.options.components["v-select"] is undefined even
 * after installing Vuetify against Summit's own vue import — the two are different Vue module
 * instances with separate component registries, despite both being "Vue 2.7".
 *
 * This file has NO other local imports, so it's imported first (before SummitRouter and its .vue
 * import chain) in src/index.ts, guaranteeing Vue.use(Vuetify) and window.summitVuetify exist
 * before any .vue component module reads them. A plain source-order import of this same code
 * inside index.ts does NOT guarantee this — ES module imports are all evaluated before the
 * importing file's own top-level code runs, regardless of where the import line sits.
 *
 * Also: this file must be listed in package.json's "sideEffects" array. It has zero exports, so
 * without that entry webpack tree-shakes the whole module out of the production bundle.
 */
Vue.use(Vuetify);
window.summitVuetify = new Vuetify();
