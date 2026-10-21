import Vue from "vue";
import { defineComponent } from "vue";
import IStatementsContent from "./components/IStatementsContent.vue";
import { buildIStatementMatrix, type IStatementMatrix } from "./services/buildIStatementMatrix";
import { OAS_STREAMS } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { clearCache, createLogger } from "@/helpers";
import { TerrainRootState } from "@/types/terrainState";

const logger = createLogger("IStatements");

/** Gotcha: content mounts as a second Vue instance, because Terrain's Vue has no Vuetify components (see OasProgressionVue.ts). */
interface ContentInstance {
  matrix: IStatementMatrix | undefined;
  loadState: string;
  progressDone: number;
  progressTotal: number;
  $mount(el: HTMLElement): void;
  $destroy(): void;
}

function data() {
  return {
    matrix: undefined as IStatementMatrix | undefined,
    contentInstance: undefined as ContentInstance | undefined,
    loadState: "loading-trees" as string,
    progressDone: 0,
    progressTotal: 0,
  };
}

export default defineComponent({
  name: "IStatements",
  data,
  watch: {
    matrix() {
      this.renderContent();
    },
    loadState() {
      this.renderContent();
    },
    progressDone() {
      this.renderContent();
    },
  },
  mounted() {
    // Gotcha: mount before loading. renderContent() no-ops until the instance exists.
    this.mountContentComponent();
    this.loadMatrix();
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      { text: "Summit", disabled: false, to: "/summit/home", exact: true },
      { text: "Reports", disabled: true, to: "/summit/reports", exact: true },
      { text: "I Statements", disabled: true, to: "/summit/reports/istatements", exact: true },
    ];
  },
  beforeDestroy() {
    this.unmountContentComponent();
  },
  methods: {
    async loadMatrix() {
      try {
        this.loadState = "loading-trees";
        this.progressDone = 0;
        this.progressTotal = 0;

        const matrix = await buildIStatementMatrix(OAS_STREAMS, (done, total) => {
          this.loadState = "loading-templates";
          this.progressDone = done;
          this.progressTotal = total;
        });

        this.matrix = matrix;
        this.loadState = "ready";
      } catch (e) {
        logger.error("failed to build i-statement matrix:", e);
        this.loadState = "error";
      }
    },
    async reload() {
      clearCache();
      await this.loadMatrix();
    },
    mountContentComponent() {
      // Gotcha: `any` avoids TS2589 from Vue.extend's inferred type.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ContentApp: any = Vue.extend(IStatementsContent);
      this.contentInstance = new ContentApp({
        vuetify: window.summitVuetify,
        propsData: {
          matrix: this.matrix,
          loadState: this.loadState,
          progressDone: this.progressDone,
          progressTotal: this.progressTotal,
          onReload: this.reload,
        },
      }) as ContentInstance;
      this.contentInstance.$mount(this.$refs.vuetifyRoot as HTMLElement);
    },
    renderContent() {
      if (!this.contentInstance) return;
      this.contentInstance.matrix = this.matrix;
      this.contentInstance.loadState = this.loadState;
      this.contentInstance.progressDone = this.progressDone;
      this.contentInstance.progressTotal = this.progressTotal;
    },
    unmountContentComponent() {
      this.contentInstance?.$destroy();
      this.contentInstance = undefined;
    },
  },
});
