import React, { useMemo } from "react";
import { groupRowsForHeatMap, type HeatMapStage, type HeatMapSection } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { filterMembersByPatrol, groupMembersByPatrol, sliceStagesToRange, formatStageProgress, sortMembers, type PatrolGroup, type MemberSortBy } from "@/pages/OasProgression/services/filterHeatMapSections";
import { getCodename } from "@/pages/OasProgression/services/getCodename";
import { getSkillIconUrl } from "@/pages/OasProgression/services/getSkillIconUrl";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

interface OASHeatMapProps {
  items: OASProgressionRow[];
  trunkStageCounts: Record<string, number>;
  members: TerrainUnitMember[];
  showEmptySections: boolean;
  memberFilter: string;
  hideLastName: boolean;
  useCodenames: boolean;
  selectedPatrols: string[];
  breakByPatrol: boolean;
  hideEmptyTopColumns: boolean;
  visibleStreams: string[];
  stageRange: [number, number];
  sortBy: MemberSortBy;
}

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

function StageCell({ stage }: { stage: HeatMapStage | undefined }): React.ReactNode {
  if (!stage) {
    return null;
  }

  if (stage.complete) {
    return <div className="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete" title={`Stage ${stage.stage} — complete`} />;
  }

  const hasAnyProgress = stage.cells.some((c) => c.answered || c.awarded);
  if (!hasAnyProgress) {
    return <div className="oas-heatmap-stage-bar oas-heatmap-stage-bar-unstarted" title={`Stage ${stage.stage} — not started`} />;
  }

  return (
    <div className="oas-heatmap-squares">
      {stage.cells.map((cell, index) => {
        const stateClass = cell.awarded ? "oas-heatmap-square-awarded" : cell.answered ? "oas-heatmap-square-answered" : "oas-heatmap-square-unanswered";
        const isNewGroup = index === 0 || stage.cells[index - 1].inputGroup !== cell.inputGroup;
        const groupClass = isNewGroup && index > 0 ? " oas-heatmap-square-group-start" : "";
        return (
          <div
            key={cell.inputId}
            className={`oas-heatmap-square ${stateClass}${groupClass}`}
            title={`${cell.inputGroup}: ${cell.iStatement}${cell.date ? ` (${cell.date})` : ""}`}
            data-oas-cell-state={cell.awarded ? "awarded" : cell.answered ? "answered" : "unanswered"}
            data-oas-cell-group={cell.inputGroup}
          />
        );
      })}
    </div>
  );
}

function matchesText(value: string, needle: string): boolean {
  return value.toLowerCase().includes(needle.trim().toLowerCase());
}

function MemberRow({ member, allStages, hideLastName, useCodenames }: { member: PatrolGroup["members"][number]; allStages: number[]; hideLastName: boolean; useCodenames: boolean }): React.ReactNode {
  const stagesByStage = new Map(member.stages.map((s) => [s.stage, s]));
  const stageProgress = formatStageProgress(member.highestStage, member.stages);
  return (
    <tr data-oas-member={member.memberId}>
      <td className="oas-heatmap-member-name">{displayName(member.memberName, member.memberId, hideLastName, useCodenames)}</td>
      <td className="oas-heatmap-highest-stage">
        {stageProgress.stage}
        {stageProgress.nextStageProgress && <span className="oas-heatmap-stage-progress">.{stageProgress.nextStageProgress}</span>}
      </td>
      {allStages.map((stage) => (
        <td key={stage} className="oas-heatmap-stage-cell">
          <StageCell stage={stagesByStage.get(stage)} />
        </td>
      ))}
    </tr>
  );
}

function SectionRows({
  section,
  allStages,
  memberFilter,
  selectedPatrols,
  breakByPatrol,
  hideLastName,
  useCodenames,
  sortBy,
}: {
  section: HeatMapSection;
  allStages: number[];
  memberFilter: string;
  selectedPatrols: string[];
  breakByPatrol: boolean;
  hideLastName: boolean;
  useCodenames: boolean;
  sortBy: MemberSortBy;
}): React.ReactNode {
  const filteredMembers = sortMembers(
    filterMembersByPatrol(
      section.members.filter((member) => !memberFilter.trim() || matchesText(member.memberName, memberFilter)),
      selectedPatrols,
    ),
    sortBy,
  );

  if (!breakByPatrol) {
    return (
      <>
        {filteredMembers.map((member) => (
          <MemberRow key={member.memberId} member={member} allStages={allStages} hideLastName={hideLastName} useCodenames={useCodenames} />
        ))}
      </>
    );
  }

  const patrolGroups = groupMembersByPatrol(filteredMembers);

  return (
    <>
      {patrolGroups.map((group) => (
        <React.Fragment key={group.patrolName || "__all__"}>
          {group.patrolName && (
            <tr className="oas-heatmap-patrol-title-row" data-oas-patrol-title={group.patrolName}>
              <td colSpan={allStages.length + 2} className="oas-heatmap-patrol-title">
                {group.patrolName}
              </td>
            </tr>
          )}
          {group.members.map((member) => (
            <MemberRow key={member.memberId} member={member} allStages={allStages} hideLastName={hideLastName} useCodenames={useCodenames} />
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

const MIN_VISIBLE_STAGE = 4;

/**
 * Trims trailing empty stage columns from the top down, stopping at the first non-empty
 * column found (scanning from the highest stage downward) and never trimming below
 * MIN_VISIBLE_STAGE, per the user's request: only auto-hide unused columns above stage 4.
 */
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

export function OASHeatMap(props: OASHeatMapProps): React.ReactNode {
  const grouped = useMemo(() => groupRowsForHeatMap(props.items, props.trunkStageCounts, props.members), [props.items, props.trunkStageCounts, props.members]);
  const allSkills = useMemo(() => orderSkills(Object.keys(grouped)), [grouped]);
  const skills = useMemo(() => allSkills.filter((skill) => props.visibleStreams.includes(skill)), [allSkills, props.visibleStreams]);

  const overallMaxStage = useMemo(() => Math.max(0, ...skills.map((s) => grouped[s].maxStage)), [grouped, skills]);
  const allStagesUntrimmed = useMemo(() => Array.from({ length: overallMaxStage }, (_, i) => i + 1), [overallMaxStage]);

  const visibleSectionsBySkill = useMemo(() => {
    const map = new Map<string, HeatMapSection[]>();
    skills.forEach((skill) => {
      map.set(
        skill,
        grouped[skill].sections.filter((section) => props.showEmptySections || !section.isEmpty),
      );
    });
    return map;
  }, [grouped, skills, props.showEmptySections]);

  const allStagesTrimmed = useMemo(
    () =>
      props.hideEmptyTopColumns
        ? trimEmptyTrailingStages(
            allStagesUntrimmed,
            skills.flatMap((s) => visibleSectionsBySkill.get(s) ?? []),
          )
        : allStagesUntrimmed,
    [allStagesUntrimmed, skills, visibleSectionsBySkill, props.hideEmptyTopColumns],
  );

  const allStages = useMemo(() => sliceStagesToRange(allStagesTrimmed, props.stageRange), [allStagesTrimmed, props.stageRange]);

  return (
    <div>
      <div className="oas-heatmap-scroll">
        <table className="oas-heatmap-table">
          <thead className="oas-heatmap-thead">
            <tr>
              <th className="oas-heatmap-member-header">Member</th>
              <th className="oas-heatmap-highest-stage-header">Stage</th>
              {allStages.map((stage) => (
                <th key={stage} className="oas-heatmap-stage-group-header">
                  {stage}
                </th>
              ))}
            </tr>
          </thead>
          {skills.flatMap((skill) => {
            const sections = visibleSectionsBySkill.get(skill) ?? [];
            const iconUrl = getSkillIconUrl(skill);
            return sections.map((section) => (
              <tbody key={skill + "::" + (section.stream ?? "")} data-oas-skill={skill} data-oas-stream={section.stream ?? undefined}>
                <tr className="oas-heatmap-skill-title-row">
                  <td colSpan={allStages.length + 2} className="oas-heatmap-skill-title">
                    {iconUrl && <img src={iconUrl} alt="" className="oas-heatmap-skill-icon" data-oas-skill-icon={skill} />}
                    {sectionTitle(section)}
                  </td>
                </tr>
                <SectionRows
                  section={section}
                  allStages={allStages}
                  memberFilter={props.memberFilter}
                  selectedPatrols={props.selectedPatrols}
                  breakByPatrol={props.breakByPatrol}
                  hideLastName={props.hideLastName}
                  useCodenames={props.useCodenames}
                  sortBy={props.sortBy}
                />
              </tbody>
            ));
          })}
        </table>
      </div>
    </div>
  );
}
