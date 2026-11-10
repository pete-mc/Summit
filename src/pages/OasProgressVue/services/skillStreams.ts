import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import { OAS_SKILLS } from "@/pages/OasProgress/services/filterHeatMapSections";
import { formatStream, skillTitle } from "@/pages/OasProgressVue/components/OASHeatMapVue";

/** `skill` is Terrain's `row.stream` and `stream` is `row.branch`; they are equal on the trunk. */
export interface SkillStream {
  key: string;
  skill: string;
  stream: string;
  label: string;
}

type SkillStreamRow = Pick<OASProgressRow, "stream" | "branch">;

export function skillStreamKey(skill: string, stream: string): string {
  return `${skill}::${stream}`;
}

export function skillStreamLabel(row: SkillStreamRow): string {
  return row.branch === row.stream ? skillTitle(row.stream) : `${skillTitle(row.stream)} - ${formatStream(row.branch)}`;
}

export function listSkillStreams(items: SkillStreamRow[]): SkillStream[] {
  const byKey = new Map<string, SkillStream>();
  items.forEach((row) => {
    const key = skillStreamKey(row.stream, row.branch);
    if (!byKey.has(key)) {
      byKey.set(key, { key, skill: row.stream, stream: row.branch, label: skillStreamLabel(row) });
    }
  });
  const skillIndex = (s: SkillStream) => OAS_SKILLS.indexOf(s.skill);
  const isTrunk = (s: SkillStream) => s.skill === s.stream;
  return Array.from(byKey.values()).sort((a, b) => skillIndex(a) - skillIndex(b) || Number(isTrunk(b)) - Number(isTrunk(a)) || a.label.localeCompare(b.label));
}
