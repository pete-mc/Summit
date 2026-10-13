import moment from "moment";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { PeakAwardBox, PeakAwardMemberRow } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";
import { getMemberDisplayName } from "@/pages/OasProgression/services/getMemberDisplayName";
import type { NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";
import { formatStream } from "./OASHeatMapVue";

const SKILL_TITLES: Record<string, string> = {
  bushcraft: "Bushcraft",
  bushwalking: "Bushwalking",
  camping: "Camping",
  aquatics: "Aquatics",
  boating: "Boating",
  paddling: "Paddling",
  alpine: "Alpine",
  cycling: "Cycling",
  vertical: "Vertical",
};

export function skillTitle(skill: string): string {
  return SKILL_TITLES[skill] ?? skill;
}

const CORE_SKILL_TITLES: Record<string, string> = {
  bushcraft: "Bushcraft",
  bushwalking: "Bushwalking",
  camping: "Camping",
};

/**
 * dd/mm/yyyy — the date formats actually stored on OASProgressionRow.date are a mix of ISO
 * yyyy-mm-dd slices, full ISO timestamps (status_updated), and raw imported strings (see
 * buildOASProgressionRows.ts's own four assignment sites), so this accepts any moment-parseable
 * input rather than assuming one shape. Returns the raw string unchanged if it can't be parsed,
 * rather than hiding a real (if oddly-formatted) date from the tooltip.
 */
export function formatAwardDate(date: string | null): string {
  if (!date) return "";
  const parsed = moment(date);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : date;
}

function sectionTitle(section: string | null): string {
  return section ? section.charAt(0).toUpperCase() + section.slice(1) : "";
}

/**
 * "{Stream} - Stage {x} - {Date dd/mm/yyyy} as a {Section}" — the one shared tooltip format for
 * every box (Core Skills/Progressions/Special) and for the collapsed bar that replaces a fully-met
 * cell, per the user's own spec (2026-10-09). `stream` is deliberately the award's own BRANCH, not
 * its parent stream — for a forked skill (e.g. bushcraft's "pioneering" vs "survival-skills") the
 * branch is the specific, accurate name; for an unforked trunk stage, branch === stream, so this
 * is a no-op there. `stage` is passed separately rather than always read from `award.stage`
 * because the collapsed bar's tooltip describes the group as a whole (its box count / highest
 * stage reached), not any one individual award within it.
 */
export function awardTooltip(award: PeakAwardBox["award"], stage: number): string | null {
  if (!award) return null;
  return `${formatStream(award.branch)} - Stage ${stage} - ${formatAwardDate(award.date)} as a ${sectionTitle(award.section)}`;
}

/**
 * How one group of boxes (Core Skills skill, Progressions, or Special) should render: every box
 * individually (none or some met) or collapsed into one wide bar spanning the same width (every
 * box met) — matching the heat map's own bar-complete/squares split (OASHeatMapVue.ts's
 * buildStageCellView). Per the user's own request (2026-10-08): a single met box is purple like
 * an "answered" heat map square; once the WHOLE cell is met, it collapses into one green bar.
 */
export interface BoxGroupView {
  kind: "bar" | "boxes";
  /** How many boxes this group has — needed even in "bar" mode (boxes is empty there) so the bar can be sized to match. */
  boxCount: number;
  barTitle?: string;
  boxes: Array<{ met: boolean; title: string | null }>;
}

/**
 * `boxes[i].award.stage` drives each individual box's own tooltip; the collapsed bar instead
 * describes the group as a whole, so its tooltip uses the LAST box's award but `boxes.length` as
 * the stage number (the highest stage reached = how many boxes got filled), not that award's own
 * (possibly lower, e.g. for Progressions/Special where "stage" isn't 1:1 with box position) stage.
 */
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
  /** "X of Y" — overall progress across every condition box on this row, per the user's own spec (2026-10-09). */
  progressText: string;
  /** "Z%" — in its own column under the same Progress header (user, 2026-10-13). */
  progressPercentText: string;
  progressions: ProgressionsCellView;
  special: SpecialCellView | null;
}

function buildCoreSkillCellView(coreSkill: PeakAwardMemberRow["coreSkills"][number]): CoreSkillCellView {
  return {
    title: CORE_SKILL_TITLES[coreSkill.skill] ?? coreSkill.skill,
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

/**
 * The Summary tab: a flat, one-row-per-member table showing progress toward the unit's current
 * section's Peak Award. Built on the same v-data-table shell and square styling as OASHeatMapVue
 * (per DEV_NOTES.md: "Uses the exact same style of table as the heatmap, including coloured
 * squares") rather than a new visual language. See
 * .claude/OASProgression/PLAN_PEAK_AWARD_SUMMARY.md.
 */
export default defineComponent({
  name: "OASPeakAwardSummaryVue",
  props: {
    rows: { type: Array as PropType<PeakAwardMemberRow[]>, required: true },
    nameFormat: { type: String as PropType<NameFormat>, default: "full" },
    /** Whether the active section has a Special condition — gates the whole Special column,
     *  per the user's own choice to omit it entirely for Joey/Cub/Scout rather than show a dash. */
    hasSpecial: { type: Boolean, required: true },
    /** The active section's own Special condition text (e.g. "4 above Stage 3"), shown below the
     *  "Special" header the same way Core Skills shows its skill names below its own header. */
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
        ...["bushcraft", "bushwalking", "camping"].map((skill) => ({ text: SKILL_TITLES[skill], value: skill, sortable: false })),
        { text: "Progressions", value: "progressions", sortable: false },
      ];
      if (this.hasSpecial) {
        headers.push({ text: "Special", value: "special", sortable: false });
      }
      return headers;
    },
  },
  methods: {
    /**
     * Pixel width for a collapsed "all met" bar, sized to exactly match `count` individual boxes
     * laid out side by side — same box width/gap as .oas-heatmap-square/.oas-heatmap-squares in
     * src/styles/index.css (18px square, 1px gap), so the bar neither over- nor under-shoots the
     * row of boxes it replaces and every cell in the column still lines up.
     */
    barWidthPx(count: number): string {
      const BOX_WIDTH = 18;
      const BOX_GAP = 1;
      const width = count * BOX_WIDTH + Math.max(0, count - 1) * BOX_GAP;
      return `${width}px`;
    },
    /**
     * The <table> element summit-print clones for the Summary printout — same contract as
     * OASHeatMapVue's own getExportTable(): a method rather than a ref read directly, since a ref
     * on a v-data-table resolves to the Vue component instance, not an element.
     */
    getExportTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector("table") ?? undefined;
    },
  },
});
