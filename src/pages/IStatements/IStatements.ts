import Vue from "vue";
import { defineComponent } from "vue";
import IStatementsContent from "./components/IStatementsContent.vue";
import { buildIStatementMatrix, type IStatementMatrix } from "./services/buildIStatementMatrix";
import { OAS_STREAMS } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { clearCache, createLogger } from "@/helpers";
import { TerrainRootState } from "@/types/terrainState";

const logger = createLogger("IStatements");

/**
 * Mirrors OasProgressionVue.ts: the content component is mounted as a second, independent
 * Vue instance built from Summit's own Vuetify-registered `vue`, because Terrain's Vue
 * constructor (which renders this outer SFC) has no Vuetify components registered on it.
 * See that file, and .claude/OASProgression/PLAN_VUE.md, for the full reasoning.
 */
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
    // Mount before loading: loadMatrix() starts reporting progress as soon as the (fast,
    // often cached) tree fetches resolve, and renderContent() silently no-ops until the
    // content instance exists — so loading first leaves the page blank until it finishes.
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
          // Total is only known once the trees resolve; until then the bar stays
          // indeterminate rather than sitting at 0% or jumping as the denominator grows.
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
      // `any` here sidesteps TS2589 ("type instantiation is excessively deep") from
      // Vue.extend's inferred type — same workaround, and same reason, as OasProgressionVue.ts.
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
