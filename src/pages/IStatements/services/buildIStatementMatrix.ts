import { type OASTemplate } from "@/types/terrainTypes";
import { OAS_STREAMS, flattenOASTemplate, flattenOASTree, getCachedOASTemplate, getCachedOASTree } from "@/pages/OasProgression/services/buildOASProgressionRows";

const TEMPLATE_FETCH_CONCURRENCY = 6;

/** Gotcha: excluded by id, not `type`: `logbook_up_to_date` appears as both "checkbox" and "text". */
const NON_ISTATEMENT_INPUT_IDS = new Set(["logbook_up_to_date", "file_uploader"]);

export interface IStatementCell {
  skill: string;
  branch: string;
  stage: number;
}

export interface IStatementRow {
  key: string;
  displayText: string;
  variants: Map<string, number>;
  cells: IStatementCell[];
}

export interface SkillBranchGroup {
  skill: string;
  branch: string;
  label: string;
  stages: number[];
}

export interface IStatementMatrix {
  rows: IStatementRow[];
  groups: SkillBranchGroup[];
  failedTemplates: number;
}

export function normaliseIStatement(label: string): string {
  return label
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/[.!]+$/, "");
}

export function titleCaseSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function groupKey(skill: string, branch: string): string {
  return skill + "|" + branch;
}

function cellKey(skill: string, branch: string, stage: number): string {
  return skill + "|" + branch + "|" + stage;
}

/** Ties break alphabetically so the text is stable across loads. */
function pickDisplayText(variants: Map<string, number>): string {
  let best = "";
  let bestCount = -1;
  variants.forEach((count, text) => {
    if (count > bestCount || (count === bestCount && text < best)) {
      best = text;
      bestCount = count;
    }
  });
  return best;
}

export function collectIStatements(template: OASTemplate): Array<{ label: string }> {
  return flattenOASTemplate(template)
    .filter((entry) => !NON_ISTATEMENT_INPUT_IDS.has(entry.inputId))
    .map((entry) => ({ label: entry.iStatement }));
}

interface TemplateTask {
  skill: string;
  branch: string;
  stage: number;
  templateLink: string;
}

async function runWithConcurrency<T>(tasks: T[], concurrency: number, run: (task: T) => Promise<void>): Promise<void> {
  const queue = [...tasks];

  async function worker(): Promise<void> {
    let task = queue.shift();
    while (task) {
      await run(task);
      task = queue.shift();
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
}

export async function buildIStatementMatrix(skills: string[], onProgress?: (done: number, total: number) => void): Promise<IStatementMatrix> {
  const orderedSkills = OAS_STREAMS.filter((stream) => skills.includes(stream));

  const tasks: TemplateTask[] = [];
  for (const skill of orderedSkills) {
    const tree = await getCachedOASTree(skill);
    if (!tree) {
      continue;
    }
    flattenOASTree(tree).forEach(({ branch, stage, templateLink }) => {
      tasks.push({ skill, branch, stage, templateLink });
    });
  }

  onProgress?.(0, tasks.length);

  const rowsByKey = new Map<string, IStatementRow>();
  const seenCells = new Set<string>();
  const stagesByGroup = new Map<string, Set<number>>();
  let done = 0;
  let failedTemplates = 0;

  await runWithConcurrency(tasks, TEMPLATE_FETCH_CONCURRENCY, async (task) => {
    const template = await getCachedOASTemplate(task.templateLink);
    if (!template) {
      failedTemplates += 1;
      done += 1;
      onProgress?.(done, tasks.length);
      return;
    }

    const groupStages = stagesByGroup.get(groupKey(task.skill, task.branch)) ?? new Set<number>();
    groupStages.add(task.stage);
    stagesByGroup.set(groupKey(task.skill, task.branch), groupStages);

    collectIStatements(template).forEach(({ label }) => {
      const key = normaliseIStatement(label);
      if (!key) {
        return;
      }

      let row = rowsByKey.get(key);
      if (!row) {
        row = { key, displayText: "", variants: new Map(), cells: [] };
        rowsByKey.set(key, row);
      }

      row.variants.set(label, (row.variants.get(label) ?? 0) + 1);

      const cell = cellKey(task.skill, task.branch, task.stage);
      if (!seenCells.has(key + "::" + cell)) {
        seenCells.add(key + "::" + cell);
        row.cells.push({ skill: task.skill, branch: task.branch, stage: task.stage });
      }
    });

    done += 1;
    onProgress?.(done, tasks.length);
  });

  const rows = Array.from(rowsByKey.values());
  rows.forEach((row) => {
    row.displayText = pickDisplayText(row.variants);
  });
  rows.sort((a, b) => b.cells.length - a.cells.length || a.displayText.localeCompare(b.displayText));

  const groups: SkillBranchGroup[] = [];
  orderedSkills.forEach((skill) => {
    const branches = Array.from(stagesByGroup.keys())
      .filter((key) => key.startsWith(skill + "|"))
      .map((key) => key.slice(skill.length + 1))
      .sort((a, b) => (a === skill ? -1 : b === skill ? 1 : a.localeCompare(b)));

    branches.forEach((branch) => {
      groups.push({
        skill,
        branch,
        label: titleCaseSegment(skill) + " · " + titleCaseSegment(branch),
        stages: Array.from(stagesByGroup.get(groupKey(skill, branch)) ?? []).sort((a, b) => a - b),
      });
    });
  });

  return { rows, groups, failedTemplates };
}
