import { defineComponent } from "vue";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";

type ViewMode = OASProgressVueFilterState["viewMode"];

export interface AboutTabLine {
  viewMode: Exclude<ViewMode, "about">;
  name: string;
  question: string;
  detail: string;
}

export const ABOUT_TAB_LINES: AboutTabLine[] = [
  {
    viewMode: "summary",
    name: "Summary",
    question: "Where is everyone up to?",
    detail: "One row per member, showing their current stage in every skill and stream. Click a column heading to sort by it. Untick Show > Expand Streams for one number per skill.",
  },
  {
    viewMode: "peakAward",
    name: "Peak Award",
    question: "Who is on track for their Peak Award, and what's missing?",
    detail: "Each member against your section's OAS requirements: core skills, total progressions and, for Venturers and Rovers, higher-stage progressions. Hover a box for the award and its date.",
  },
  {
    viewMode: "heatmap",
    name: "Heatmap",
    question: "What's been done, in detail?",
    detail: "Every I-statement for every member, coloured by awarded, answered or not started. Narrow it down by skill, stage and patrol.",
  },
  {
    viewMode: "nextSteps",
    name: "Next Steps",
    question: "What does this member still need to do?",
    detail: "Pick a member, skill and stage to list the I-statements they have left, grouped into Plan, Do and Review. Handy to print and hand to the member.",
  },
  {
    viewMode: "stageGrid",
    name: "Stage Grid",
    question: "Who's done what in one stage?",
    detail: "Pick a skill and stage to see every member against its I-statements. Print it as a sign-off sheet when running an activity.",
  },
];

export default defineComponent({
  name: "OASAboutTabsVue",
  data() {
    return { lines: ABOUT_TAB_LINES };
  },
  methods: {
    onTabClick(viewMode: AboutTabLine["viewMode"]) {
      this.$emit("select-tab", viewMode);
    },
  },
});
