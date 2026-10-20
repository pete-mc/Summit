import { getCodename } from "./getCodename";

export type NameFormat = "full" | "first" | "firstInitialLast" | "firstLastInitial" | "codename";

export const NAME_FORMAT_OPTIONS: Array<{ value: NameFormat; text: string }> = [
  { value: "full", text: "Full Name" },
  { value: "first", text: "First Name" },
  { value: "firstInitialLast", text: "FirstName.L" },
  { value: "firstLastInitial", text: "F.LastName" },
  { value: "codename", text: "Codename" },
];

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
