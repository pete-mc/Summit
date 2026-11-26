export type NameFormat = "full" | "first" | "firstInitialLast" | "firstLastInitial" | "codename";

export const NAME_FORMAT_OPTIONS: Array<{ value: NameFormat; text: string }> = [
  { value: "full", text: "Full Name" },
  { value: "first", text: "First Name" },
  { value: "firstInitialLast", text: "FirstName.L" },
  { value: "firstLastInitial", text: "F.LastName" },
  { value: "codename", text: "Codename" },
];
