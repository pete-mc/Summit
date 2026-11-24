import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { OverallProgressCell, OverallProgressColumn, OverallProgressRow } from "@/pages/OasProgress/services/buildOverallProgressRows";
import type { StageAward } from "@/pages/OasProgress/services/buildPeakAwardSummaryRows";
import type { OASProgressVueFilterState } from "./OASProgressVueFilterPersistence";
import { skillStreamKey, skillStreamLabel } from "./skillStreams";

type ViewMode = OASProgressVueFilterState["viewMode"];

export interface TabJump {
  viewMode: ViewMode;
  filters: Partial<OASProgressVueFilterState>;
  title: string;
  from: { viewMode: ViewMode; tabName: string; detail: string };
}

/** Keyed by memberId, aligned with the Summary columns. */
export type SummaryCellJumps = Record<string, Array<TabJump | null>>;

const memberSkillStreamKey = (memberId: string, skillStream: string) => `${memberId}|${skillStream}`;

/** Every member and Skill - Stream with a stage not yet awarded: what Next Steps can show. */
export function listOutstandingSkillStreams(items: OASProgressRow[]): Set<string> {
  const keys = new Set<string>();
  items.forEach((row) => {
    if (!row.awarded) keys.add(memberSkillStreamKey(row.memberId, skillStreamKey(row.stream, row.branch)));
  });
  return keys;
}

/** A merged skill cell uses the stream whose award gives the number shown; a tie goes to the first listed (trunk first). */
export function cellStream(column: OverallProgressColumn, cell: OverallProgressCell): string {
  if (column.stream) return column.stream;
  const highest = (cell.awards ?? []).reduce<StageAward | null>((best, award) => (!best || award.stage > best.stage ? award : best), null);
  return highest ? highest.branch : column.skill;
}

/** Null when the member has nothing left to do in that Skill - Stream. */
export function nextStepsCellJump(row: OverallProgressRow, column: OverallProgressColumn, cell: OverallProgressCell, outstanding: Set<string>): TabJump | null {
  const stream = cellStream(column, cell);
  const skillStream = skillStreamKey(column.skill, stream);
  if (!outstanding.has(memberSkillStreamKey(row.memberId, skillStream))) return null;

  const detail = `${row.displayName} – ${skillStreamLabel({ stream: column.skill, branch: stream })}`;
  return {
    viewMode: "nextSteps",
    filters: { nextStepsMemberId: row.memberId, nextStepsSkillStream: skillStream, nextStepsStage: null },
    title: `Open Next Steps: ${detail}`,
    from: { viewMode: "summary", tabName: "Summary", detail },
  };
}

export function buildSummaryCellJumps(columns: OverallProgressColumn[], rows: OverallProgressRow[], outstanding: Set<string>): SummaryCellJumps {
  const jumps: SummaryCellJumps = {};
  rows.forEach((row) => {
    jumps[row.memberId] = row.cells.map((cell, index) => nextStepsCellJump(row, columns[index], cell, outstanding));
  });
  return jumps;
}
