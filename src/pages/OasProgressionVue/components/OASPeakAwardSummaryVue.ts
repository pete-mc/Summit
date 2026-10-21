import moment from "moment";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { PeakAwardBox, PeakAwardMemberRow } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";
import { getMemberDisplayName } from "@/pages/OasProgression/services/getMemberDisplayName";
import type { NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";
import { formatStream, skillTitle } from "./OASHeatMapVue";

export { skillTitle };

/** Row dates come in several shapes. Unparseable ones are shown as-is. */
export function formatAwardDate(date: string | null): string {
  if (!date) return "";
  const parsed = moment(date);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : date;
}

/** Gotcha: must match .oas-heatmap-square / .oas-heatmap-squares in src/styles/index.css, so a collapsed bar lines up with the boxes. */
const HEATMAP_SQUARE_WIDTH_PX = 18;
const HEATMAP_SQUARE_GAP_PX = 1;

function sectionTitle(section: string | null): string {
  return section ? section.charAt(0).toUpperCase() + section.slice(1) : "";
}

/** Uses the award's branch (e.g. "pioneering"), which is more specific than the parent stream. */
export function awardTooltip(award: PeakAwardBox["award"], stage: number): string | null {
  if (!award) return null;
  return `${formatStream(award.branch)} - Stage ${stage} - ${formatAwardDate(award.date)} as a ${sectionTitle(award.section)}`;
}

/** Every box met → one green bar (like the heat map); otherwise individual boxes. */
export interface BoxGroupView {
  kind: "bar" | "boxes";
  /** Needed in "bar" mode too, to size the bar. */
  boxCount: number;
  barTitle?: string;
  boxes: Array<{ met: boolean; title: string | null }>;
}

/** Gotcha: the bar's stage is boxes.length (the highest reached), not the last award's own stage. */
export function buildBoxGroupView(boxes: PeakAwardBox[]): BoxGroupView {
  const allMet = boxes.length > 0 && boxes.every((b) => b.met);
  if (allMet) {
    const lastAward = boxes[boxes.length - 1]?.award ?? null;
    return { kind: "bar", boxCount: boxes.length, barTitle: awardTooltip(lastAward, boxes.length) ?? undefined, boxes: [] };
  }
  return { kind: "boxes", boxCount: boxes.length, boxes: boxes.map((b) => ({ met: b.met, title: awardTooltip(b.award, b.award?.stage ?? 0) })) };
}

interface CoreSkillCellView extends BoxGroupView {
  title: string;
}

interface SpecialCellView extends BoxGroupView {
  text: string;
}

interface ProgressionsCellView extends BoxGroupView {
  text: string;
}

interface SummaryRowView {
  memberId: string;
  displayName: string;
  coreSkills: CoreSkillCellView[];
  progressText: string;
  progressPercentText: string;
  progressions: ProgressionsCellView;
  special: SpecialCellView | null;
}

function buildCoreSkillCellView(coreSkill: PeakAwardMemberRow["coreSkills"][number]): CoreSkillCellView {
  return {
    title: skillTitle(coreSkill.skill),
    ...buildBoxGroupView(coreSkill.boxes),
  };
}

export function buildRowView(row: PeakAwardMemberRow, nameFormat: NameFormat): SummaryRowView {
  const progressions: ProgressionsCellView = {
    text: `${row.totalProgressions} of ${row.requiredProgressions}`,
    ...buildBoxGroupView(row.progressionBoxes),
  };

  let special: SpecialCellView | null = null;
  if (row.special) {
    special = {
      text: `${row.special.count} of ${row.special.required}`,
      ...buildBoxGroupView(row.special.boxes),
    };
  }

  return {
    memberId: row.memberId,
    displayName: getMemberDisplayName(row.firstName, row.lastName, row.memberId, nameFormat),
    coreSkills: row.coreSkills.map(buildCoreSkillCellView),
    progressText: `${row.progressScore} of ${row.progressTotal}`,
    progressPercentText: `${row.progressPercent}%`,
    progressions,
    special,
  };
}

export default defineComponent({
  name: "OASPeakAwardSummaryVue",
  props: {
    rows: { type: Array as PropType<PeakAwardMemberRow[]>, required: true },
    nameFormat: { type: String as PropType<NameFormat>, default: "full" },
    /** False for Joey/Cub/Scout: the Special column is left out entirely. */
    hasSpecial: { type: Boolean, required: true },
    specialConditionText: { type: String, default: "" },
  },
  computed: {
    rowViews(): SummaryRowView[] {
      return this.rows.map((row) => buildRowView(row, this.nameFormat));
    },
    dataTableHeaders(): Array<{ text: string; value: string; sortable: boolean }> {
      const headers = [
        { text: "Member", value: "member", sortable: false },
        { text: "Progress", value: "progress", sortable: false },
        { text: "", value: "progressPercent", sortable: false },
        ...["bushcraft", "bushwalking", "camping"].map((skill) => ({ text: skillTitle(skill), value: skill, sortable: false })),
        { text: "Progressions", value: "progressions", sortable: false },
      ];
      if (this.hasSpecial) {
        headers.push({ text: "Special", value: "special", sortable: false });
      }
      return headers;
    },
  },
  methods: {
    barWidthPx(count: number): string {
      const width = count * HEATMAP_SQUARE_WIDTH_PX + Math.max(0, count - 1) * HEATMAP_SQUARE_GAP_PX;
      return `${width}px`;
    },
    /** Gotcha: a ref on v-data-table is the component, not the <table>. */
    getExportTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector("table") ?? undefined;
    },
  },
});
