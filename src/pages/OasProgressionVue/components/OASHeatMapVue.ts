import { defineComponent } from "vue";
import type { PropType } from "vue";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import type { HeatMapSection, HeatMapStage, SectionMemberRow } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { filterMembersByPatrol, groupMembersByPatrol, sliceStagesToRange, formatStageProgress, sortMembers } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { PatrolGroup } from "@/pages/OasProgression/services/filterHeatMapSections";
import { getSkillIconUrl } from "@/pages/OasProgression/services/getSkillIconUrl";
import { getCodename } from "@/pages/OasProgression/services/getCodename";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

/**
 * Vue+Vuetify port of OASHeatMap.tsx (see that file for the original React version and
 * PLAN_VUESTAGE_2.md for the porting rationale). This stage only wires the props VueStage 1
 * already has (items/trunkStageCounts/members) — filter-driven props (memberFilter,
 * selectedPatrols, breakByPatrol, hideLastName, useCodenames, onlyInProgress,
 * hideEmptyTopColumns) default to their "show everything" values here and get real controls in
 * VueStage 3, matching this page's own staged build order.
 */

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

const CORE_SKILLS = ["bushwalking", "bushcraft", "camping"];
const MIN_VISIBLE_STAGE = 4;

function skillTitle(skill: string): string {
  return SKILL_TITLES[skill] ?? skill;
}

function formatStream(stream: string): string {
  return stream
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function sectionTitle(section: HeatMapSection): string {
  const base = skillTitle(section.skill);
  return section.stream ? `${base} — ${formatStream(section.stream)}` : base;
}

function orderSkills(skills: string[]): string[] {
  const core = CORE_SKILLS.filter((s) => skills.includes(s));
  const rest = skills.filter((s) => !CORE_SKILLS.includes(s)).sort();
  return [...core, ...rest];
}

function displayName(memberName: string, memberId: string, hideLastName: boolean, useCodenames: boolean): string {
  if (useCodenames) {
    return getCodename(memberId);
  }
  return hideLastName ? memberName.split(" ")[0] : memberName;
}

/** Trims trailing empty stage columns from the top down (never below MIN_VISIBLE_STAGE) — see OASHeatMap.tsx's identical function for the full rationale. */
function trimEmptyTrailingStages(allStages: number[], sections: HeatMapSection[]): number[] {
  const stageHasProgress = new Map<number, boolean>();
  allStages.forEach((stage) => stageHasProgress.set(stage, false));

  sections.forEach((section) => {
    section.members.forEach((member) => {
      member.stages.forEach((stage) => {
        if (stage.cells.some((c) => c.answered || c.awarded)) {
          stageHasProgress.set(stage.stage, true);
        }
      });
    });
  });

  let cutoff = allStages.length;
  for (let i = allStages.length - 1; i >= 0; i--) {
    const stage = allStages[i];
    if (stage <= MIN_VISIBLE_STAGE || stageHasProgress.get(stage)) {
      break;
    }
    cutoff = i;
  }

  return allStages.slice(0, cutoff);
}

interface StageCellView {
  kind: "empty" | "bar-complete" | "bar-unstarted" | "squares";
  title?: string;
  squares?: Array<{
    inputId: string;
    stateClass: string;
    groupClass: string;
    title: string;
  }>;
}

function buildStageCellView(stage: HeatMapStage | undefined, onlyInProgress: boolean): StageCellView {
  if (!stage) {
    return { kind: "empty" };
  }
  if (stage.complete) {
    return onlyInProgress ? { kind: "empty" } : { kind: "bar-complete", title: `Stage ${stage.stage} — complete` };
  }
  const hasAnyProgress = stage.cells.some((c) => c.answered || c.awarded);
  if (!hasAnyProgress) {
    return onlyInProgress ? { kind: "empty" } : { kind: "bar-unstarted", title: `Stage ${stage.stage} — not started` };
  }
  const squares = stage.cells.map((cell, index) => {
    const inProgressCell = cell.answered && !cell.awarded;
    const stateClass = onlyInProgress
      ? inProgressCell
        ? "oas-heatmap-square-answered"
        : "oas-heatmap-square-unanswered"
      : cell.awarded
        ? "oas-heatmap-square-awarded"
        : cell.answered
          ? "oas-heatmap-square-answered"
          : "oas-heatmap-square-unanswered";
    const isNewGroup = index === 0 || stage.cells[index - 1].inputGroup !== cell.inputGroup;
    const groupClass = isNewGroup && index > 0 ? "oas-heatmap-square-group-start" : "";
    return {
      inputId: cell.inputId,
      stateClass,
      groupClass,
      title: `${cell.inputGroup}: ${cell.iStatement}${cell.date ? ` (${cell.date})` : ""}`,
    };
  });
  return { kind: "squares", squares };
}

interface MemberRowView {
  memberId: string;
  displayName: string;
  stageDisplay: string;
  nextStageProgress: string | null;
  /** Same order as `allStages` — one entry per visible stage column, so the template can iterate
   * `allStages`/`cells` in lockstep by index rather than doing a Map lookup per cell. */
  cells: StageCellView[];
}

function buildMemberRowView(member: SectionMemberRow, allStages: number[], hideLastName: boolean, useCodenames: boolean, onlyInProgress: boolean, isStreamSection: boolean, trunkStageCount: number): MemberRowView {
  const stagesByStage = new Map(member.stages.map((s) => [s.stage, s]));
  const stageProgress = formatStageProgress(member.highestStage, member.stages, isStreamSection, trunkStageCount, member.trunkFullyAwarded);
  return {
    memberId: member.memberId,
    displayName: displayName(member.memberName, member.memberId, hideLastName, useCodenames),
    stageDisplay: stageProgress.stage,
    nextStageProgress: stageProgress.nextStageProgress,
    cells: allStages.map((stage) => buildStageCellView(stagesByStage.get(stage), onlyInProgress)),
  };
}

interface PatrolGroupView {
  patrolName: string;
  members: MemberRowView[];
}

interface SectionView {
  key: string;
  skill: string;
  iconUrl: string | null;
  title: string;
  /** Grouped by patrol only when breakByPatrol is on — a single unlabeled group otherwise, so
   * the template can always iterate patrolGroups rather than branching on breakByPatrol itself. */
  patrolGroups: PatrolGroupView[];
}

export default defineComponent({
  name: "OASHeatMapVue",
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    trunkStageCounts: { type: Object as PropType<Record<string, number>>, required: true },
    members: { type: Array as PropType<TerrainUnitMember[]>, required: true },
    visibleStreams: { type: Array as PropType<string[]>, required: true },
    stageRange: { type: Array as unknown as PropType<[number, number]>, required: true },
    sortBy: { type: String as PropType<"firstName" | "lastName" | "stageProgress">, required: true },
    showEmptySections: { type: Boolean, default: false },
    memberFilter: { type: String, default: "" },
    hideLastName: { type: Boolean, default: false },
    useCodenames: { type: Boolean, default: false },
    selectedPatrols: { type: Array as PropType<string[]>, default: () => [] },
    breakByPatrol: { type: Boolean, default: false },
    hideEmptyTopColumns: { type: Boolean, default: false },
    onlyInProgress: { type: Boolean, default: false },
  },
  computed: {
    grouped(): Record<string, ReturnType<typeof groupRowsForHeatMap>[string]> {
      return groupRowsForHeatMap(this.items, this.trunkStageCounts, this.members);
    },
    skills(): string[] {
      const allSkills = orderSkills(Object.keys(this.grouped));
      return allSkills.filter((skill) => this.visibleStreams.includes(skill));
    },
    overallMaxStage(): number {
      return Math.max(0, ...this.skills.map((s) => this.grouped[s].maxStage));
    },
    allStagesUntrimmed(): number[] {
      return Array.from({ length: this.overallMaxStage }, (_, i) => i + 1);
    },
    rangeStages(): number[] {
      return sliceStagesToRange(this.allStagesUntrimmed, this.stageRange);
    },
    visibleSectionsBySkill(): Map<string, HeatMapSection[]> {
      const rangeStageSet = new Set(this.rangeStages);
      const isEmptyWithinRange = (section: HeatMapSection): boolean => section.stream !== null && section.members.every((m) => m.stages.every((s) => !rangeStageSet.has(s.stage) || s.cells.every((c) => !c.answered && !c.awarded)));

      const map = new Map<string, HeatMapSection[]>();
      this.skills.forEach((skill) => {
        map.set(
          skill,
          this.grouped[skill].sections.filter((section: HeatMapSection) => this.showEmptySections || !isEmptyWithinRange(section)),
        );
      });
      return map;
    },
    allStagesTrimmed(): number[] {
      if (!this.hideEmptyTopColumns) {
        return this.allStagesUntrimmed;
      }
      const allSections = this.skills.flatMap((s) => this.visibleSectionsBySkill.get(s) ?? []);
      return trimEmptyTrailingStages(this.allStagesUntrimmed, allSections);
    },
    allStages(): number[] {
      return this.hideEmptyTopColumns ? sliceStagesToRange(this.allStagesTrimmed, this.stageRange) : this.rangeStages;
    },
    sections(): SectionView[] {
      const result: SectionView[] = [];
      this.skills.forEach((skill) => {
        const sections = this.visibleSectionsBySkill.get(skill) ?? [];
        const iconUrl = getSkillIconUrl(skill);
        sections.forEach((section: HeatMapSection) => {
          const isStreamSection = section.stream !== null;
          const nameFiltered = section.members.filter((member: SectionMemberRow) => !this.memberFilter.trim() || member.memberName.toLowerCase().includes(this.memberFilter.trim().toLowerCase()));
          const patrolFiltered = filterMembersByPatrol(nameFiltered, this.selectedPatrols);
          const filteredMembers = sortMembers(patrolFiltered, this.sortBy, isStreamSection, section.trunkStageCount);

          const toRowView = (member: SectionMemberRow) => buildMemberRowView(member, this.allStages, this.hideLastName, this.useCodenames, this.onlyInProgress, isStreamSection, section.trunkStageCount);

          const patrolGroups: PatrolGroupView[] = this.breakByPatrol
            ? groupMembersByPatrol(filteredMembers).map((group: PatrolGroup) => ({ patrolName: group.patrolName, members: group.members.map(toRowView) }))
            : [{ patrolName: "", members: filteredMembers.map(toRowView) }];

          result.push({
            key: skill + "::" + (section.stream ?? ""),
            skill,
            iconUrl,
            title: sectionTitle(section),
            patrolGroups,
          });
        });
      });
      return result;
    },
  },
});
