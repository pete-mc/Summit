import moment from "moment";
import { type OASTemplate, type OASTree, type OASTreeNode, type TerrainAchievements, type TerrainUnitMember } from "@/types/terrainTypes";
import { fetchOASTemplate, fetchOASTree, fetchUnitAchievementsFilterd } from "@/services";
import { createLogger, loadCached, saveCached } from "@/helpers";

const logger = createLogger("buildOASProgressionRows");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function isOASCacheKeyForStream(stream: string): (key: string) => boolean {
  return (key: string) => {
    const segments = key.split(".");
    const streamSegment = segments[0] === "achievements" ? segments[2] : segments[1];
    return streamSegment === stream;
  };
}

export interface FlattenedIStatement {
  inputId: string;
  iStatement: string;
  inputGroup: string;
  sortIndex: number;
}

export interface OASProgressionRow {
  unitId: string;
  stream: string;
  branch: string;
  stage: number;
  inputGroup: string;
  inputId: string;
  iStatement: string;
  memberId: string;
  /** For search and export only. Gotcha: never re-split it; sort and format from firstName/lastName. */
  memberName: string;
  firstName: string;
  lastName: string;
  patrolName: string | null;
  answered: boolean;
  awarded: boolean;
  date: string | null;
  /** Null for a blank cell. Lets the Peak Award summary count only the current section. */
  section: string | null;
}

export function flattenOASTemplate(template: OASTemplate): FlattenedIStatement[] {
  const flattened: FlattenedIStatement[] = [];
  const document = template.document?.[0];
  if (!document) {
    return flattened;
  }

  let sortIndex = 0;
  document.input_groups.forEach((group) => {
    const inputGroup = (group.title ?? "").replace(">", "").trim();
    group.inputs.forEach((input) => {
      if (input.id === "file_uploader") {
        return;
      }
      flattened.push({
        inputId: input.id,
        iStatement: input.label,
        inputGroup,
        sortIndex,
      });
      sortIndex += 1;
    });
  });

  return flattened;
}

/** `iStatements` can be per member: members stay on the template version they started. */
export function buildBlankMatrix(unitId: string, stream: string, branch: string, stage: number, iStatements: FlattenedIStatement[] | ((memberId: string) => FlattenedIStatement[]), members: TerrainUnitMember[]): OASProgressionRow[] {
  const matrix: OASProgressionRow[] = [];
  members.forEach((member) => {
    const memberStatements = typeof iStatements === "function" ? iStatements(member.id) : iStatements;
    memberStatements.forEach((iStatement) => {
      matrix.push({
        unitId,
        stream,
        branch,
        stage,
        inputGroup: iStatement.inputGroup,
        inputId: iStatement.inputId,
        iStatement: iStatement.iStatement,
        memberId: member.id,
        memberName: member.first_name + " " + member.last_name,
        firstName: member.first_name,
        lastName: member.last_name,
        patrolName: member.patrol?.name ?? null,
        answered: false,
        awarded: false,
        date: null,
        section: null,
      });
    });
  });
  return matrix;
}

export function parseTerrainAnswerDate(rawDate: string, statusUpdated: string): Date | null {
  if (!rawDate) {
    return null;
  }

  const statusUpdatedMoment = moment.utc(statusUpdated);

  const auParsed = moment.utc(rawDate, "DD/MM/YYYY", true);
  if (auParsed.isValid()) {
    if (!statusUpdatedMoment.isValid() || !auParsed.isAfter(statusUpdatedMoment)) {
      return auParsed.toDate();
    }

    const usParsed = moment.utc(rawDate, "MM/DD/YYYY", true);
    if (usParsed.isValid()) {
      return usParsed.toDate();
    }

    return auParsed.toDate();
  }

  const usParsed = moment.utc(rawDate, "MM/DD/YYYY", true);
  if (usParsed.isValid()) {
    return usParsed.toDate();
  }

  const isoParsed = moment.utc(rawDate, moment.ISO_8601, true);
  if (isoParsed.isValid()) {
    return isoParsed.toDate();
  }

  return null;
}

function applyAnswersToMemberRows(memberRows: OASProgressionRow[], achievement: TerrainAchievements, stampDate: string | null): void {
  const answers = achievement.answers ?? {};
  Object.entries(answers).forEach(([key, value]) => {
    let inputId: string | null = null;
    if (key === "logbook_up_to_date") {
      inputId = key;
    } else if (key.endsWith("_verifiedDate")) {
      inputId = key.slice(0, -"_verifiedDate".length);
    }

    if (!inputId) {
      return;
    }

    const row = memberRows.find((r) => r.inputId === inputId);
    if (!row) {
      return;
    }

    row.answered = true;
    if (typeof value === "string" && value) {
      const parsed = parseTerrainAnswerDate(value, achievement.status_updated);
      row.date = parsed ? parsed.toISOString().slice(0, 10) : value;
    } else if (stampDate) {
      row.date = stampDate;
    }
  });
}

export function applyAchievementsToMatrix(matrix: OASProgressionRow[], achievements: TerrainAchievements[]): OASProgressionRow[] {
  const result = matrix.map((row) => ({ ...row }));
  const rowsByMember = new Map<string, OASProgressionRow[]>();
  result.forEach((row) => {
    const existing = rowsByMember.get(row.memberId);
    if (existing) {
      existing.push(row);
    } else {
      rowsByMember.set(row.memberId, [row]);
    }
  });

  achievements.forEach((achievement) => {
    const memberRows = rowsByMember.get(achievement.member_id);
    if (!memberRows || memberRows.length === 0) {
      return;
    }

    const status: string = achievement.status;
    const isInProgress = status === "draft_review" || status === "pending_review" || status === "draft_approval" || status === "in_progress";
    const isAwarded = status === "awarded" || status === "approved";

    if (isInProgress) {
      applyAnswersToMemberRows(memberRows, achievement, null);
      memberRows.forEach((row) => {
        row.section = achievement.section;
      });
      return;
    }

    if (!isAwarded) {
      return;
    }

    const importedDate = achievement.imported?.date_awarded;
    if (importedDate) {
      memberRows.forEach((row) => {
        row.answered = true;
        row.awarded = true;
        row.date = importedDate;
        row.section = achievement.section;
      });
      return;
    }

    // Gotcha: an awarded achievement is authoritative for the whole stage. Template edits can leave old `answers`
    // keys that no longer match, which would render an awarded stage as partly complete.
    applyAnswersToMemberRows(memberRows, achievement, achievement.status_updated);
    memberRows.forEach((row) => {
      row.answered = true;
      row.awarded = true;
      if (!row.date) {
        row.date = achievement.status_updated;
      }
      row.section = achievement.section;
    });
  });

  return result;
}

export interface OASTreeBranchStage {
  branch: string;
  stage: number;
  templateLink: string;
}

export function flattenOASTree(tree: OASTree): OASTreeBranchStage[] {
  const results: OASTreeBranchStage[] = [];

  function walk(node: OASTreeNode): void {
    if (node.template_link) {
      results.push({ branch: node.branch_id, stage: node.stage, templateLink: node.template_link });
    }
    (node.children ?? []).forEach(walk);
  }

  if (tree.tree) {
    walk(tree.tree);
  }

  return results;
}

/** From the tree's structure, not progress, so every member's row splits trunk/branch at the same column. */
export function getTrunkStageCount(tree: OASTree): number {
  let count = 0;
  let node: OASTreeNode | undefined = tree.tree;
  while (node && node.branch_id === tree.stream_id) {
    count += 1;
    node = node.children?.[0];
  }
  return count;
}

export async function getCachedOASTree(stream: string): Promise<OASTree | undefined> {
  const cacheKey = "tree." + stream;
  const cached = loadCached<OASTree>(cacheKey, ONE_DAY_MS);
  if (cached) {
    return cached;
  }

  const fetched = await fetchOASTree(stream);
  if (fetched) {
    saveCached(cacheKey, fetched);
  }
  return fetched;
}

export async function getCachedOASTemplate(templateLink: string): Promise<OASTemplate | undefined> {
  const cacheKey = "template." + templateLink;
  const cached = loadCached<OASTemplate>(cacheKey, ONE_DAY_MS);
  if (cached) {
    return cached;
  }

  const fetched = await fetchOASTemplate(templateLink);
  if (fetched) {
    saveCached(cacheKey, fetched);
  }
  return fetched;
}

async function getCachedAchievements(unitId: string, stream: string, branch: string, stage: number): Promise<TerrainAchievements[]> {
  const cacheKey = "achievements." + unitId + "." + stream + "." + branch + "." + stage;
  const cached = loadCached<TerrainAchievements[]>(cacheKey, ONE_DAY_MS);
  if (cached) {
    return cached;
  }

  const fetched = await fetchUnitAchievementsFilterd(`type=outdoor_adventure_skill&stream=${stream}&branch=${branch}&stage=${stage}`);
  saveCached(cacheKey, fetched);
  return fetched;
}

/** e.g. "oas/vertical/3/1.json". Members on the latest version, or with no version (imported awards), are left out. */
export function olderTemplateLinksByMember(achievements: TerrainAchievements[], latestVersion: number): Map<string, string> {
  const newestByMember = new Map<string, TerrainAchievements>();
  achievements.forEach((achievement) => {
    const existing = newestByMember.get(achievement.member_id);
    if (!existing || achievement.status_updated > existing.status_updated) {
      newestByMember.set(achievement.member_id, achievement);
    }
  });

  const links = new Map<string, string>();
  newestByMember.forEach((achievement, memberId) => {
    if (achievement.template && typeof achievement.version === "number" && achievement.version !== latestVersion) {
      links.set(memberId, `${achievement.template}/${achievement.version}.json`);
    }
  });
  return links;
}

/** Latest version's order, with older-only statements inserted after their predecessor. */
export function mergeStatementOrder(latest: FlattenedIStatement[], olderVersions: FlattenedIStatement[][]): Map<string, number> {
  const order = latest.map((s) => s.inputId);
  olderVersions.forEach((statements) => {
    statements.forEach((statement, index) => {
      if (order.indexOf(statement.inputId) !== -1) {
        return;
      }
      const predecessorIndex = index > 0 ? order.indexOf(statements[index - 1].inputId) : -1;
      order.splice(predecessorIndex + 1, 0, statement.inputId);
    });
  });
  return new Map(order.map((inputId, index) => [inputId, index]));
}

async function loadOlderStatementsByMember(achievements: TerrainAchievements[], latestVersion: number): Promise<{ byMember: Map<string, FlattenedIStatement[]>; versions: FlattenedIStatement[][] }> {
  const linksByMember = olderTemplateLinksByMember(achievements, latestVersion);
  const links = Array.from(new Set(Array.from(linksByMember.values())));

  const statementsByLink = new Map<string, FlattenedIStatement[]>();
  await Promise.all(
    links.map(async (link) => {
      const template = await getCachedOASTemplate(link);
      if (template) {
        statementsByLink.set(link, flattenOASTemplate(template));
      } else {
        logger.warn(`Could not load older template version ${link}; using latest for its members.`);
      }
    }),
  );

  const byMember = new Map<string, FlattenedIStatement[]>();
  linksByMember.forEach((link, memberId) => {
    const statements = statementsByLink.get(link);
    if (statements) {
      byMember.set(memberId, statements);
    }
  });
  return { byMember, versions: Array.from(statementsByLink.values()) };
}

export async function fetchOASProgressionForStage(unitId: string, stream: string, branch: string, stage: number, templateLink: string, members: TerrainUnitMember[]): Promise<OASProgressionRow[]> {
  const template = await getCachedOASTemplate(templateLink);
  if (!template) {
    return [];
  }

  const latestStatements = flattenOASTemplate(template);
  const achievements = await getCachedAchievements(unitId, stream, branch, stage);
  const older = await loadOlderStatementsByMember(achievements, template.version);

  const blankMatrix = buildBlankMatrix(unitId, stream, branch, stage, (memberId) => older.byMember.get(memberId) ?? latestStatements, members);
  const joined = applyAchievementsToMatrix(blankMatrix, achievements);

  const orderByInputId = mergeStatementOrder(latestStatements, older.versions);
  return joined.sort((a, b) => (orderByInputId.get(a.inputId) ?? 0) - (orderByInputId.get(b.inputId) ?? 0));
}

export interface StreamProgressionResult {
  rows: OASProgressionRow[];
  trunkStageCount: number;
}

export async function fetchOASProgressionForStream(unitId: string, stream: string, members: TerrainUnitMember[]): Promise<StreamProgressionResult> {
  const tree = await getCachedOASTree(stream);
  if (!tree) {
    return { rows: [], trunkStageCount: 0 };
  }

  const branchStages = flattenOASTree(tree);
  const rowsPerStage = await Promise.all(branchStages.map(({ branch, stage, templateLink }) => fetchOASProgressionForStage(unitId, stream, branch, stage, templateLink, members)));
  return { rows: rowsPerStage.flat(), trunkStageCount: getTrunkStageCount(tree) };
}

export const OAS_STREAMS = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];

export async function fetchAllOASProgression(unitId: string, members: TerrainUnitMember[], concurrency: number, onStreamComplete: (stream: string, result: StreamProgressionResult) => void): Promise<void> {
  const queue = [...OAS_STREAMS];

  async function worker(): Promise<void> {
    let stream = queue.shift();
    while (stream) {
      const result = await fetchOASProgressionForStream(unitId, stream, members);
      onStreamComplete(stream, result);
      stream = queue.shift();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, OAS_STREAMS.length) }, () => worker());
  await Promise.all(workers);
}
