import "vuetify/dist/vuetify.css";
import Vue from "vue";
import Vuetify from "vuetify";

/**
 * Learning: registers Vuetify on Summit's OWN bundled Vue, not Terrain's. Terrain's $vuetify gives the theme service
 * but no components; the two Vue copies have separate component registries.
 * Gotcha: index.ts imports this first, before anything that loads a .vue file. It must stay free of other local
 * imports, and be listed in package.json "sideEffects" or webpack drops it (it has no exports).
 * Theme primary = Terrain's --color-base-blue (#1070ca); otherwise Vuetify's indigo default shows.
 */
Vue.use(Vuetify);
window.summitVuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#1070ca",
      },
    },
  },
});
