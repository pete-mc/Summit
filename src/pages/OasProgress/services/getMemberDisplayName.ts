import type { NameFormat } from "@/shared/nameFormat";
import { getCodename } from "./getCodename";

export { NAME_FORMAT_OPTIONS, type NameFormat } from "@/shared/nameFormat";

/** Gotcha: takes first/last separately. Re-splitting a combined name loses multi-word names ("Van Der Berg"). */
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
