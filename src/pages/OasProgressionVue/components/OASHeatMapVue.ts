import { defineComponent } from "vue";
import type { PropType } from "vue";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import type { HeatMapSection, HeatMapStage, SectionMemberRow } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { filterMembersByPatrol, groupMembersByPatrol, sliceStagesToVisible, formatStageProgress, sortMembers } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { PatrolGroup } from "@/pages/OasProgression/services/filterHeatMapSections";
import { groupSectionsByMember } from "@/pages/OasProgression/services/groupSectionsByMember";
import { getSkillIconUrl } from "@/pages/OasProgression/services/getSkillIconUrl";
import { getMemberDisplayName } from "@/pages/OasProgression/services/getMemberDisplayName";
import type { NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

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
/** Stage 1 always stays visible. The React page's floor is 4. */
const MIN_VISIBLE_STAGE = 1;

export function skillTitle(skill: string): string {
  return SKILL_TITLES[skill] ?? skill;
}

export function formatStream(stream: string): string {
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

/** "hidden" keeps the square's place but draws nothing. */
export type SquareState = "awarded" | "answered" | "unanswered" | "hidden";

export interface StageCellView {
  kind: "empty" | "bar-complete" | "bar-unstarted" | "squares";
  title?: string;
  squares?: Array<{
    inputId: string;
    state: SquareState;
    stateClass: string;
    groupClass: string;
    title: string;
  }>;
}

function buildStageCellView(stage: HeatMapStage | undefined, showAwarded: boolean, showNotStarted: boolean, showAnswered: boolean): StageCellView {
  if (!stage) {
    return { kind: "empty" };
  }
  if (stage.complete) {
    return showAwarded ? { kind: "bar-complete", title: `Stage ${stage.stage} — Awarded` } : { kind: "empty" };
  }
  const hasAnyProgress = stage.cells.some((c) => c.answered || c.awarded);
  if (!hasAnyProgress) {
    // "Not started" = no answered/awarded statement in this stage, for this member and skill.
    return showNotStarted ? { kind: "bar-unstarted", title: `Stage ${stage.stage} — Not started` } : { kind: "empty" };
  }

  // Learning: hidden squares stay in place so rows stay aligned between members. showNotStarted never affects squares inside a started stage.
  const squares = stage.cells.map((cell, index) => {
    const inProgressCell = cell.answered && !cell.awarded;
    const state: SquareState = (!showAnswered && inProgressCell) || (!showAwarded && cell.awarded) ? "hidden" : cell.awarded ? "awarded" : cell.answered ? "answered" : "unanswered";
    const isNewGroup = index === 0 || stage.cells[index - 1].inputGroup !== cell.inputGroup;
    const groupClass = isNewGroup && index > 0 ? "oas-heatmap-square-group-start" : "";
    return {
      inputId: cell.inputId,
      state,
      stateClass: `oas-heatmap-square-${state}`,
      groupClass,
      title: `${cell.inputGroup}: ${cell.iStatement}${cell.date ? ` (${cell.date})` : ""}`,
    };
  });
  return { kind: "squares", squares };
}

export interface MemberRowView {
  memberId: string;
  displayName: string;
  stageDisplay: string;
  nextStageProgress: string | null;
  cells: StageCellView[];
}

function buildMemberRowView(member: SectionMemberRow, allStages: number[], nameFormat: NameFormat, showAwarded: boolean, showNotStarted: boolean, showAnswered: boolean, isStreamSection: boolean, trunkStageCount: number): MemberRowView {
  const stagesByStage = new Map(member.stages.map((s) => [s.stage, s]));
  const stageProgress = formatStageProgress(member.highestStage, member.stages, isStreamSection, trunkStageCount, member.trunkFullyAwarded);
  return {
    memberId: member.memberId,
    displayName: getMemberDisplayName(member.firstName, member.lastName, member.memberId, nameFormat),
    stageDisplay: stageProgress.stage,
    nextStageProgress: stageProgress.nextStageProgress,
    cells: allStages.map((stage) => buildStageCellView(stagesByStage.get(stage), showAwarded, showNotStarted, showAnswered)),
  };
}

interface PatrolGroupView {
  patrolName: string;
  members: MemberRowView[];
}

interface MemberSkillRowView extends MemberRowView {
  key: string;
  title: string;
  iconUrl: string | null;
}

interface MemberSectionViewModel {
  memberId: string;
  title: string;
  patrolName: string | null;
  skillRows: MemberSkillRowView[];
}

/** Built from the same computed properties as the screen, so the export can't drift from it. */
export interface HeatMapExportView {
  firstColumnHeader: string;
  stages: number[];
  sections: Array<{
    title: string;
    patrolName: string | null;
    groups: Array<{ patrolName: string; rows: Array<{ label: string; view: MemberRowView }> }>;
  }>;
}

interface SectionView {
  key: string;
  skill: string;
  iconUrl: string | null;
  title: string;
  patrolGroups: PatrolGroupView[];
}

export default defineComponent({
  name: "OASHeatMapVue",
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    trunkStageCounts: { type: Object as PropType<Record<string, number>>, required: true },
    members: { type: Array as PropType<TerrainUnitMember[]>, required: true },
    visibleStreams: { type: Array as PropType<string[]>, required: true },
    visibleStages: { type: Array as PropType<number[]>, required: true },
    sortBy: { type: String as PropType<"firstName" | "lastName" | "stageProgress">, required: true },
    // Gotcha: default true, or an omitted prop silently hides whole skills.
    showEmptySkillRows: { type: Boolean, default: true },
    memberFilter: { type: String, default: "" },
    nameFormat: { type: String as PropType<NameFormat>, default: "full" },
    selectedPatrols: { type: Array as PropType<string[]>, default: () => [] },
    breakByPatrol: { type: Boolean, default: false },
    showEmptyTopStages: { type: Boolean, default: true },
    showAwarded: { type: Boolean, default: true },
    showNotStarted: { type: Boolean, default: true },
    showAnswered: { type: Boolean, default: true },
    /** "none" (shared with the table view) is treated as "skill": a heat map is always grouped. */
    groupBy: { type: String as PropType<"skill" | "member" | "none">, default: "skill" },
  },
  computed: {
    isGroupedByMember(): boolean {
      return this.groupBy === "member";
    },
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
      return sliceStagesToVisible(this.allStagesUntrimmed, this.visibleStages);
    },
    visibleSectionsBySkill(): Map<string, HeatMapSection[]> {
      const rangeStageSet = new Set(this.rangeStages);
      // Unlike the React page, trunk sections can be hidden too.
      const isEmptyWithinRange = (section: HeatMapSection): boolean => section.members.every((m) => m.stages.every((s) => !rangeStageSet.has(s.stage) || s.cells.every((c) => !c.answered && !c.awarded)));

      const map = new Map<string, HeatMapSection[]>();
      this.skills.forEach((skill) => {
        map.set(
          skill,
          this.grouped[skill].sections.filter((section: HeatMapSection) => this.showEmptySkillRows || !isEmptyWithinRange(section)),
        );
      });
      return map;
    },
    allStagesTrimmed(): number[] {
      if (this.showEmptyTopStages) {
        return this.allStagesUntrimmed;
      }
      const allSections = this.skills.flatMap((s) => this.visibleSectionsBySkill.get(s) ?? []);
      return trimEmptyTrailingStages(this.allStagesUntrimmed, allSections);
    },
    allStages(): number[] {
      return this.showEmptyTopStages ? this.rangeStages : sliceStagesToVisible(this.allStagesTrimmed, this.visibleStages);
    },
    sections(): SectionView[] {
      const result: SectionView[] = [];
      this.skills.forEach((skill) => {
        const sections = this.visibleSectionsBySkill.get(skill) ?? [];
        const iconUrl = getSkillIconUrl(skill);
        sections.forEach((section: HeatMapSection) => {
          const isStreamSection = section.stream !== null;
          const nameFiltered = section.members.filter((member: SectionMemberRow) => !this.memberFilter.trim() || member.memberName.toLowerCase().includes(this.memberFilter.trim().toLowerCase()));
          // Gotcha: an empty patrol selection shows nobody here, unlike filterMembersByPatrol's "empty = everyone".
          const patrolFiltered = this.selectedPatrols.length === 0 ? [] : filterMembersByPatrol(nameFiltered, this.selectedPatrols);
          const filteredMembers = sortMembers(patrolFiltered, this.sortBy, isStreamSection, section.trunkStageCount);

          const toRowView = (member: SectionMemberRow) => buildMemberRowView(member, this.allStages, this.nameFormat, this.showAwarded, this.showNotStarted, this.showAnswered, isStreamSection, section.trunkStageCount);

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

    /** Built from visibleSectionsBySkill so both layouts share the same filters. Patrol filtering and sorting are re-applied here. */
    memberSections(): MemberSectionViewModel[] {
      const visibleBySkill: Record<string, { sections: HeatMapSection[]; maxStage: number }> = {};
      this.skills.forEach((skill) => {
        visibleBySkill[skill] = { sections: this.visibleSectionsBySkill.get(skill) ?? [], maxStage: this.grouped[skill].maxStage };
      });

      const nameNeedle = this.memberFilter.trim().toLowerCase();

      const nameFiltered = groupSectionsByMember(visibleBySkill, this.skills).filter((section) => !nameNeedle || section.memberName.toLowerCase().includes(nameNeedle));
      const patrolFiltered = this.selectedPatrols.length === 0 ? [] : filterMembersByPatrol(nameFiltered, this.selectedPatrols);
      // "Stage" sort is disabled in this layout and falls back to firstName.
      const sortedByName = patrolFiltered.slice().sort((a, b) => {
        return this.sortBy === "lastName" ? a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName) : a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName);
      });

      return sortedByName.map((section) => ({
        memberId: section.memberId,
        title: getMemberDisplayName(section.firstName, section.lastName, section.memberId, this.nameFormat),
        patrolName: section.patrolName,
        skillRows: section.skillRows.map((row) => ({
          key: row.key,
          title: row.stream ? `${skillTitle(row.skill)} — ${formatStream(row.stream)}` : skillTitle(row.skill),
          iconUrl: getSkillIconUrl(row.skill),
          ...buildMemberRowView(row.member, this.allStages, this.nameFormat, this.showAwarded, this.showNotStarted, this.showAnswered, row.isStreamSection, row.trunkStageCount),
        })),
      }));
    },

    /** Only tells v-data-table the column count. The <thead> is hand-written because Vuetify headers can't do colspan. */
    dataTableHeaders(): Array<{ text: string; value: string; sortable: boolean }> {
      return [{ text: "Member", value: "member", sortable: false }, { text: "Stage", value: "stage", sortable: false }, ...this.allStages.map((stage) => ({ text: String(stage), value: `stage-${stage}`, sortable: false }))];
    },

    /** v-data-table needs `items`, but rows render from `sections` (one <tbody> per section). This keeps its counts correct. */
    flatRows(): Array<{ memberId: string }> {
      return this.sections.flatMap((section) => section.patrolGroups.flatMap((group) => group.members.map((member) => ({ memberId: member.memberId }))));
    },
  },
  methods: {
    /** Gotcha: a $ref on v-data-table is the component, not the <table>, and fails silently. Ask the component instead. */
    getExportTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector("table") ?? undefined;
    },
    getExportView(): HeatMapExportView {
      if (this.isGroupedByMember) {
        return {
          firstColumnHeader: "Skill",
          stages: this.allStages,
          sections: this.memberSections.map((section) => ({
            title: section.title,
            patrolName: section.patrolName,
            groups: [{ patrolName: "", rows: section.skillRows.map((row) => ({ label: row.title, view: row })) }],
          })),
        };
      }
      return {
        firstColumnHeader: "Member",
        stages: this.allStages,
        sections: this.sections.map((section) => ({
          title: section.title,
          patrolName: null,
          groups: section.patrolGroups.map((group) => ({ patrolName: group.patrolName, rows: group.members.map((member) => ({ label: member.displayName, view: member })) })),
        })),
      };
    },
  },
});
