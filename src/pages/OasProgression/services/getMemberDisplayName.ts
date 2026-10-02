import { getCodename } from "./getCodename";

/**
 * Resolves the name a member should be displayed by, honouring the "use codenames" /
 * "hide last name" display toggles. Codenames win when both are set, matching Terrain's own
 * "most private wins" expectation.
 *
 * Extracted from OASHeatMapVue.ts (previously a module-private `displayName` function there) so
 * the heat map and the OAS Worksheets view resolve the same member to the same displayed name —
 * see .claude/OASWorksheets/PLAN_STAGE_1.md §2.
 */
export function getMemberDisplayName(memberName: string, memberId: string, hideLastName: boolean, useCodenames: boolean): string {
  if (useCodenames) {
    return getCodename(memberId);
  }
  return hideLastName ? memberName.split(" ")[0] : memberName;
}
