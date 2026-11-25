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
    detail: "Shows one row per member, with their current stage in every skill and stream. Click a column heading to sort by it. Untick Show > Expand Streams for a simplified one number per skill.",
  },
  {
    viewMode: "peakAward",
    name: "Peak Award",
    question: "Who is on track for their Peak Award, and what's missing?",
    detail: "Shows each member against your section's OAS requirements: core skills, total progressions and, for Venturers and Rovers, higher-stage progressions. Hover over a box to see the award and its date.",
  },
  {
    viewMode: "heatmap",
    name: "Heatmap",
    question: "What's been done, in detail?",
    detail: "Shows every I-statement for every member, coloured as awarded, answered or not started. Narrow it down by skill, stage and patrol.",
  },
  {
    viewMode: "nextSteps",
    name: "Next Steps",
    question: "What does this member still need to do?",
    detail: "Pick a member, skill and stage to list the I-statements they have left, grouped into Plan, Do and Review. It's handy to print and give to the member.",
  },
  {
    viewMode: "stageGrid",
    name: "Stage Grid",
    question: "Who's done what in one stage?",
    detail: "Pick a skill and stage to see every member against its I-statements. Print it as a sign-off sheet when running an activity.",
  },
];

export const ABOUT_GENERAL_POINTS: string[] = [
  "Every tab can be printed or exported to Excel.",
  "Each tab remembers its own filters.",
  "Click through from one table to another to dive into what's needed for a skill, member, patrol or group. Anything you can click is outlined or underlined when you hover over it. Names and headings show a small ▾ menu instead, listing the tabs they can open.",
  "The tab you land on keeps the patrol and member filters you were using.",
  'A "Back to …" bar at the top of the page takes you back to where you were.',
];

export default defineComponent({
  name: "OASAboutTabsVue",
  data() {
    return { lines: ABOUT_TAB_LINES, generalPoints: ABOUT_GENERAL_POINTS };
  },
  methods: {
    onTabClick(viewMode: AboutTabLine["viewMode"]) {
      this.$emit("select-tab", viewMode);
    },
  },
});
