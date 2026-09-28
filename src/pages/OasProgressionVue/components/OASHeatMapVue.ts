import { defineComponent } from "vue";
import type { PropType } from "vue";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import type { HeatMapSection, HeatMapStage, SectionMemberRow } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { filterMembersByPatrol, groupMembersByPatrol, sliceStagesToRange, formatStageProgress, sortMembers } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { PatrolGroup } from "@/pages/OasProgression/services/filterHeatMapSections";
import { groupSectionsByMember } from "@/pages/OasProgression/services/groupSectionsByMember";
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
/**
 * Floor for "Hide empty top stages": trimming stops here, so stages 1 and 2 always stay on screen
 * even with no progress in them. The React page keeps its own (higher) floor of 4 — this page
 * trims further on purpose.
 */
const MIN_VISIBLE_STAGE = 2;

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

/** Trims trailing empty stage columns from the top down (never below MIN_VISIBLE_STAGE) — see OASHeatMap.tsx's equivalent function for the full rationale; this page differs only in its lower floor. */
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

function buildStageCellView(stage: HeatMapStage | undefined, onlyInProgress: boolean, hideAnswered: boolean): StageCellView {
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

  /*
   * "Hide answered" makes answered-but-not-yet-awarded squares invisible in place rather than
   * removing them, so the remaining squares keep their positions and rows stay aligned between
   * members. It affects squares and nothing else — suppressing the complete/not-started bars
   * above is onlyInProgress's job.
   */
  const squares = stage.cells.map((cell, index) => {
    const inProgressCell = cell.answered && !cell.awarded;
    const stateClass =
      hideAnswered && inProgressCell
        ? "oas-heatmap-square-hidden"
        : onlyInProgress
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

function buildMemberRowView(member: SectionMemberRow, allStages: number[], hideLastName: boolean, useCodenames: boolean, onlyInProgress: boolean, hideAnswered: boolean, isStreamSection: boolean, trunkStageCount: number): MemberRowView {
  const stagesByStage = new Map(member.stages.map((s) => [s.stage, s]));
  const stageProgress = formatStageProgress(member.highestStage, member.stages, isStreamSection, trunkStageCount, member.trunkFullyAwarded);
  return {
    memberId: member.memberId,
    displayName: displayName(member.memberName, member.memberId, hideLastName, useCodenames),
    stageDisplay: stageProgress.stage,
    nextStageProgress: stageProgress.nextStageProgress,
    cells: allStages.map((stage) => buildStageCellView(stagesByStage.get(stage), onlyInProgress, hideAnswered)),
  };
}

interface PatrolGroupView {
  patrolName: string;
  members: MemberRowView[];
}

/** One skill's row inside a member section — a member row view plus the skill's own labelling. */
interface MemberSkillRowView extends MemberRowView {
  key: string;
  title: string;
  iconUrl: string | null;
}

/**
 * A member section: the heading is the person, the rows are their skills. The mirror image of
 * SectionView, which heads with the skill and lists people.
 */
interface MemberSectionViewModel {
  memberId: string;
  title: string;
  patrolName: string | null;
  skillRows: MemberSkillRowView[];
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
    // Defaults to showing everything, matching the page's own default (the binding is
    // `!filters.hideEmptyStreams`, and that filter starts off). Now that an empty trunk section can
    // be hidden too, a `false` default would mean an omitted prop silently hides whole skills.
    showEmptySections: { type: Boolean, default: true },
    memberFilter: { type: String, default: "" },
    hideLastName: { type: Boolean, default: false },
    useCodenames: { type: Boolean, default: false },
    selectedPatrols: { type: Array as PropType<string[]>, default: () => [] },
    breakByPatrol: { type: Boolean, default: false },
    hideEmptyTopColumns: { type: Boolean, default: false },
    onlyInProgress: { type: Boolean, default: false },
    hideAnswered: { type: Boolean, default: false },
    /**
     * "skill" (default) groups by skill/stream, listing members — the original layout, optionally
     * sub-grouped by patrol. "member" inverts it: a section per member listing their skills, with
     * no secondary grouping, since the heading is already a person.
     */
    groupBy: { type: String as PropType<"skill" | "member">, default: "skill" },
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
      /*
       * "Hide empty skills" covers every skill+stream combination, trunk sections included — unlike
       * the React page's equivalent, which exempts the trunk via `section.stream !== null`. A skill
       * with no progress anywhere therefore disappears entirely, heading and all, rather than
       * leaving an empty heading behind.
       */
      const isEmptyWithinRange = (section: HeatMapSection): boolean => section.members.every((m) => m.stages.every((s) => !rangeStageSet.has(s.stage) || s.cells.every((c) => !c.answered && !c.awarded)));

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

          const toRowView = (member: SectionMemberRow) => buildMemberRowView(member, this.allStages, this.hideLastName, this.useCodenames, this.onlyInProgress, this.hideAnswered, isStreamSection, section.trunkStageCount);

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

    /**
     * Member-first sections: one per member, listing their skills.
     *
     * Reuses the same visibleSectionsBySkill the skill-first view builds from, so every filter
     * (hide empty skills, stage range, member search, patrol selection) has already been applied
     * before the inversion — the two views cannot drift.
     *
     * No patrol sub-grouping here: the section heading is already a person, so patrol becomes an
     * attribute shown beside their name rather than a divider. Members with no progress are kept,
     * rendering empty rows — see groupSectionsByMember() for why that is deliberate.
     */
    memberSections(): MemberSectionViewModel[] {
      const visibleBySkill: Record<string, { sections: HeatMapSection[]; maxStage: number }> = {};
      this.skills.forEach((skill) => {
        visibleBySkill[skill] = { sections: this.visibleSectionsBySkill.get(skill) ?? [], maxStage: this.grouped[skill].maxStage };
      });

      const nameNeedle = this.memberFilter.trim().toLowerCase();

      return groupSectionsByMember(visibleBySkill, this.skills)
        .filter((section) => !nameNeedle || section.memberName.toLowerCase().includes(nameNeedle))
        .filter((section) => this.selectedPatrols.length === 0 || (section.patrolName !== null && this.selectedPatrols.includes(section.patrolName)))
        .map((section) => ({
          memberId: section.memberId,
          title: displayName(section.memberName, section.memberId, this.hideLastName, this.useCodenames),
          patrolName: section.patrolName,
          skillRows: section.skillRows.map((row) => ({
            key: row.key,
            title: row.stream ? `${skillTitle(row.skill)} — ${formatStream(row.stream)}` : skillTitle(row.skill),
            iconUrl: getSkillIconUrl(row.skill),
            ...buildMemberRowView(row.member, this.allStages, this.hideLastName, this.useCodenames, this.onlyInProgress, this.hideAnswered, row.isStreamSection, row.trunkStageCount),
          })),
        }))
        .sort((a, b) => a.title.localeCompare(b.title));
    },

    /**
     * Column definitions, used only to tell v-data-table how many columns exist — the actual
     * <thead> is hand-written in the header slot, because the stage-group row needs colspan,
     * which Vuetify's own header renderer (one <th> per entry) cannot express.
     */
    dataTableHeaders(): Array<{ text: string; value: string; sortable: boolean }> {
      return [{ text: "Member", value: "member", sortable: false }, { text: "Stage", value: "stage", sortable: false }, ...this.allStages.map((stage) => ({ text: String(stage), value: `stage-${stage}`, sortable: false }))];
    },

    /**
     * v-data-table requires an `items` array, but the rows are rendered from `sections` in the
     * body slot — one <tbody> per skill section, which the PDF export paginates on, where
     * v-data-table emits only one. An entry per rendered member row keeps the component's own
     * bookkeeping (empty-state detection, item counts) consistent with what is on screen.
     */
    flatRows(): Array<{ memberId: string }> {
      return this.sections.flatMap((section) => section.patrolGroups.flatMap((group) => group.members.map((member) => ({ memberId: member.memberId }))));
    },
  },
  methods: {
    /**
     * The <table> element the PDF export measures row geometry from.
     *
     * A method rather than the `$refs.exportTable` the caller used to read directly: a ref on a
     * v-data-table resolves to the Vue component instance, not an element, and that failure would
     * be silent — exportElementToPdf would find no <tr>s and emit an empty PDF rather than
     * throwing. Asking the component for its table keeps the caller working regardless of how
     * this one renders internally.
     */
    getExportTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector("table") ?? undefined;
    },
  },
});
