import { getCodename } from "./getCodename";

/**
 * How a member's name is displayed across the OAS Progression heat map and worksheets.
 * Replaces the old pair of independent `hideLastName`/`useCodenames` booleans with one
 * exclusive choice — see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
 */
export type NameFormat = "full" | "first" | "firstInitialLast" | "firstLastInitial" | "codename";

export const NAME_FORMAT_OPTIONS: Array<{ value: NameFormat; text: string }> = [
  { value: "full", text: "Full Name" },
  { value: "first", text: "First Name" },
  { value: "firstInitialLast", text: "FirstName.L" },
  { value: "firstLastInitial", text: "F.LastName" },
  { value: "codename", text: "Codename" },
];

/**
 * Resolves the name a member should be displayed by, honouring the "Names" display format.
 *
 * Takes firstName/lastName directly — Terrain's own real, separate fields (TerrainUnitMember)
 * — rather than a combined name string re-split on whitespace. That used to be this function's
 * own approach and was lossy for any multi-word given or family name (e.g. "Van Der Berg" would
 * only recover "Berg"). See .claude/OASProgression/NAME_RESOLUTION.md for the full rationale and
 * the rule for all future name-handling code in this codebase.
 *
 * Extracted from OASHeatMapVue.ts (previously a module-private `displayName` function there) so
 * the heat map and the OAS Worksheets view resolve the same member to the same displayed name —
 * see .claude/OASWorksheets/PLAN_STAGE_1.md §2.
 */
export function getMemberDisplayName(firstName: string, lastName: string, memberId: string, nameFormat: NameFormat): string {
  switch (nameFormat) {
    case "codename":
      return getCodename(memberId);
    case "first":
      return firstName;
    case "firstInitialLast":
      return lastName ? `${firstName}.${lastName.charAt(0)}` : "Scout";
    case "firstLastInitial":
      return lastName ? `${firstName.charAt(0)}.${lastName}` : "Scout";
    case "full":
    default:
      return lastName ? `${firstName} ${lastName}` : firstName;
  }
}
