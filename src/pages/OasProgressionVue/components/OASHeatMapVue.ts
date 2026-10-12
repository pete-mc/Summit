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

/**
 * Vue+Vuetify port of OASHeatMap.tsx (see that file for the original React version and
 * PLAN_VUESTAGE_2.md for the porting rationale). This stage only wires the props VueStage 1
 * already has (items/trunkStageCounts/members) — filter-driven props (memberFilter,
 * selectedPatrols, breakByPatrol, nameFormat, showAwarded, showNotStarted,
 * showEmptyTopStages) default to their "show everything" values here and get real controls in
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
 * Floor for "Hide empty top stages": trimming stops here, so stage 1 always stays on screen even
 * with no progress in it. The React page keeps its own (higher) floor of 4 — this page trims
 * further on purpose. Lowered from 2 to 1 per DEV_NOTES.md: "Empty top stages can hide empty
 * stages down to 2, inclusively. So only stage 1 must be shown."
 */
const MIN_VISIBLE_STAGE = 1;

/** Exported for OASWorksheetsVue (.claude/OASWorksheets/PLAN_STAGE_1.md) — worksheet page titles use the same skill-casing rules as the heat map rather than inventing a second set. */
export function skillTitle(skill: string): string {
  return SKILL_TITLES[skill] ?? skill;
}

/** Exported for OASWorksheetsVue — see skillTitle's comment above. */
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

function buildStageCellView(stage: HeatMapStage | undefined, showAwarded: boolean, showNotStarted: boolean, showAnswered: boolean): StageCellView {
  if (!stage) {
    return { kind: "empty" };
  }
  if (stage.complete) {
    return showAwarded ? { kind: "bar-complete", title: `Stage ${stage.stage} — Awarded` } : { kind: "empty" };
  }
  const hasAnyProgress = stage.cells.some((c) => c.answered || c.awarded);
  if (!hasAnyProgress) {
    // A "not started" stage, per the user's own definition: this single stage, for this single
    // member, for this single skill, has zero answered/awarded I-Statements anywhere in it.
    // showNotStarted governs only this whole-stage-bar case — it has no bearing on individual
    // unanswered squares inside a stage that DOES have some progress (the branch below).
    return showNotStarted ? { kind: "bar-unstarted", title: `Stage ${stage.stage} — Not started` } : { kind: "empty" };
  }

  /*
   * "Show answered"/"Show awarded" make their squares invisible in place rather than removing
   * them, so the remaining squares keep their positions and rows stay aligned between members.
   * There is deliberately no "not started" case here: once a stage has any progress at all, its
   * individual unanswered squares are structural (they hold position within the group) and are
   * never affected by showNotStarted — see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
   */
  const squares = stage.cells.map((cell, index) => {
    const inProgressCell = cell.answered && !cell.awarded;
    const stateClass =
      (!showAnswered && inProgressCell) || (!showAwarded && cell.awarded) ? "oas-heatmap-square-hidden" : cell.awarded ? "oas-heatmap-square-awarded" : cell.answered ? "oas-heatmap-square-answered" : "oas-heatmap-square-unanswered";
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
    visibleStages: { type: Array as PropType<number[]>, required: true },
    sortBy: { type: String as PropType<"firstName" | "lastName" | "stageProgress">, required: true },
    // Defaults to showing everything, matching the page's own default (the binding is
    // `filters.showEmptySkillRows`, and that filter starts on). Now that an empty trunk section
    // can be hidden too, a `false` default would mean an omitted prop silently hides whole skills.
    showEmptySkillRows: { type: Boolean, default: true },
    memberFilter: { type: String, default: "" },
    nameFormat: { type: String as PropType<NameFormat>, default: "full" },
    selectedPatrols: { type: Array as PropType<string[]>, default: () => [] },
    breakByPatrol: { type: Boolean, default: false },
    showEmptyTopStages: { type: Boolean, default: true },
    showAwarded: { type: Boolean, default: true },
    showNotStarted: { type: Boolean, default: true },
    showAnswered: { type: Boolean, default: true },
    /**
     * "skill" (default) groups by skill/stream, listing members — the original layout, optionally
     * sub-grouped by patrol. "member" inverts it: a section per member listing their skills, with
     * no secondary grouping, since the heading is already a person.
     *
     * "none" is shared with the table view, which can be flat. A heat map cannot — it is always
     * grouped by something — so it is treated as "skill" here rather than adding a third layout.
     */
    groupBy: { type: String as PropType<"skill" | "member" | "none">, default: "skill" },
  },
  computed: {
    /** "none" has no heat-map meaning, so it falls back to the skill-first layout. */
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
          // Unlike filterMembersByPatrol's own shared "empty = show everyone" contract (still
          // relied on by Worksheets and the legacy React page), the Heat Map's own Patrol filter
          // behaves like every other filter on this page: nothing selected means nothing shown.
          // See .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
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

    /**
     * Member-first sections: one per member, listing their skills.
     *
     * Reuses the same visibleSectionsBySkill the skill-first view builds from, so every filter
     * (hide empty skills, stage range, member search) has already been applied before the
     * inversion — the two views cannot drift. Patrol filtering and sorting are applied
     * separately below, the same way the skill-first `sections` computed applies them, since
     * groupSectionsByMember() folds members across skills and has no sense of either on its own.
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

      const nameFiltered = groupSectionsByMember(visibleBySkill, this.skills).filter((section) => !nameNeedle || section.memberName.toLowerCase().includes(nameNeedle));
      // Same "empty selection shows nothing" rule as the skill-first sections computed — see its
      // own comment above. Reuses filterMembersByPatrol (including its UNASSIGNED_PATROL
      // handling) rather than a hand-rolled check, so the two layouts cannot drift again.
      const patrolFiltered = this.selectedPatrols.length === 0 ? [] : filterMembersByPatrol(nameFiltered, this.selectedPatrols);
      // "Stage" has no single-member equivalent here (a person has one stage per skill, not
      // one overall) — the Sort By dropdown disables that option when grouped by member
      // (OASProgressionFiltersVue.ts), so only firstName/lastName can reach this computed in
      // practice; stageProgress falls back to firstName rather than throwing if it ever does.
      // Sorts on the real firstName/lastName fields directly — see
      // .claude/OASProgression/NAME_RESOLUTION.md.
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
     * body slot — one <tbody> per skill section (each opening with its title row), where
     * v-data-table emits only one. An entry per rendered member row keeps the component's own
     * bookkeeping (empty-state detection, item counts) consistent with what is on screen.
     */
    flatRows(): Array<{ memberId: string }> {
      return this.sections.flatMap((section) => section.patrolGroups.flatMap((group) => group.members.map((member) => ({ memberId: member.memberId }))));
    },
  },
  methods: {
    /**
     * The <table> element summit-print clones for the Heatmap printout.
     *
     * A method rather than a `$refs` read by the caller: a ref on a v-data-table resolves to the
     * Vue component instance, not an element, and that failure would be silent — the printout
     * would find no table. Asking the component for its table keeps the caller working regardless
     * of how this one renders internally.
     */
    getExportTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector("table") ?? undefined;
    },
  },
});
