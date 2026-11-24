import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import { skillStreamKey, skillStreamLabel } from "./skillStreams";

export type NextStepsRow = OASProgressRow & { skillStream: string };

/** Awarded rows are dropped first, so no option list or table ever offers an awarded stage. */
export function listOutstandingRows(items: OASProgressRow[], memberId: string): OASProgressRow[] {
  return items.filter((row) => row.memberId === memberId && !row.awarded);
}

const inSkillStream = (key: string) => (row: OASProgressRow) => skillStreamKey(row.stream, row.branch) === key;

export function listStageOptions(rows: OASProgressRow[], skillStream: string): number[] {
  const stages = rows.filter(inSkillStream(skillStream)).map((row) => row.stage);
  return stages.filter((stage, index) => stages.indexOf(stage) === index).sort((a, b) => a - b);
}

export function buildNextStepsRows(rows: OASProgressRow[], skillStream: string, stage: number | null): NextStepsRow[] {
  return rows.filter((row) => row.stage === stage && inSkillStream(skillStream)(row)).map((row) => ({ ...row, skillStream: skillStreamLabel(row) }));
}

export interface NextStepsGroup {
  title: string;
  rows: NextStepsRow[];
}

/** Only neighbouring rows merge, so the template's group order is kept. */
export function groupNextStepsRows(rows: NextStepsRow[]): NextStepsGroup[] {
  const groups: NextStepsGroup[] = [];
  rows.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last.title === row.inputGroup) {
      last.rows.push(row);
    } else {
      groups.push({ title: row.inputGroup, rows: [row] });
    }
  });
  return groups;
}
