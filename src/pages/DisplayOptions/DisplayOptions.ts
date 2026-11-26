import Vue, { defineComponent } from "vue";
import { TerrainRootState } from "@/types/terrainState";
import DisplayOptionsTabsVue from "./components/DisplayOptionsTabsVue.vue";

interface MountedInstance {
  $mount(el: HTMLElement): void;
  $destroy(): void;
}

export default defineComponent({
  data() {
    return {
      contentInstance: undefined as MountedInstance | undefined,
    };
  },
  mounted() {
    this.mountContent();
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      { text: "Summit", disabled: false, to: "/summit/home", exact: true },
      { text: "Tools", disabled: true, to: "/summit/tools", exact: true },
      { text: "Display Options", disabled: true, to: "/summit/tools/DisplayOptions", exact: true },
    ];
  },
  beforeDestroy() {
    this.contentInstance?.$destroy();
    this.contentInstance = undefined;
  },
  methods: {
    /** Gotcha: Vuetify components only resolve on Summit's own Vue (src/vuetifySetup.ts), so the content is a second Vue instance. */
    mountContent() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ContentApp: any = Vue.extend(DisplayOptionsTabsVue);
      this.contentInstance = new ContentApp({ vuetify: window.summitVuetify }) as MountedInstance;
      this.contentInstance.$mount(this.$refs.vuetifyRoot as HTMLElement);
    },
  },
});
