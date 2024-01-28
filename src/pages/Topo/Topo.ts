import { TerrainRootState } from '@/types/terrainState';
import { defineComponent } from 'vue';
export default defineComponent({
  mounted() {
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      {
        text: "Summit",
        disabled: false,
        to: "/summit/home",
        exact: true,
      },
      {
        text: "Reports",
        disabled: true,
        to: "/summit/reports",
        exact: true,
      }
      ,
      {
        text: "Topo",
        disabled: true,
        to: "/summit/reports/Topo",
        exact: true,
      },
    ];
  },
});