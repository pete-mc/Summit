import "vuetify/dist/vuetify.css";
import Vue from "vue";
import Vuetify from "vuetify";

/**
 * Registers Vuetify's components (v-select, v-btn, etc.) on Summit's OWN bundled Vue module — the
 * one vue-loader compiles Summit's .vue SFCs against — not Terrain's Vue instance.
 *
 * IMPORTANT: this alone is NOT enough to use Vuetify components inside a .vue SFC like
 * OasProgression.vue — those are rendered by TERRAIN's own Vue instance/router (registered on
 * window.$nuxt.$router), which resolves component tags against Terrain's OWN
 * Vue.options.components — a completely different registry from Summit's, even though both are
 * "Vue 2.7". Confirmed directly: window.$nuxt.$root.constructor.options.components["v-select"] is
 * undefined even after this file's Vue.use(Vuetify) succeeds. To actually use a Vuetify component,
 * mount a SEPARATE Vue instance built from Summit's own Vue (see OasProgression.ts's
 * mountVuetifyComponent) into its own div — this setup module just makes that possible by
 * registering Vuetify's components on Summit's own Vue and exposing a shared theme/service
 * instance (window.summitVuetify) for those separate instances to use.
 *
 * This file has NO other local imports, so it's imported first (before SummitRouter and its .vue
 * import chain) in src/index.ts, guaranteeing Vue.use(Vuetify) and window.summitVuetify exist
 * before any other module reads them. A plain source-order import of this same code inside
 * index.ts does NOT guarantee this — ES module imports are all evaluated before the importing
 * file's own top-level code runs, regardless of where the import line sits. Also listed in
 * package.json's "sideEffects" array — without that, webpack tree-shakes this whole file away
 * since it has no exports (confirmed: silently dropped ~5MB of Vuetify from the bundle).
 */
Vue.use(Vuetify);
window.summitVuetify = new Vuetify();
