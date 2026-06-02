import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 1 calendar event text color contract", () => {
  it("maps each FullCalendar event with computed textColor from the event background", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    const eventMapperObjectPattern = /this\.state\.items\.map\s*\(\s*\(\s*item\s*\)\s*=>\s*\(\s*\{[\s\S]*?backgroundColor\s*:\s*item\.color\s*,[\s\S]*?borderColor\s*:\s*item\.color\s*,[\s\S]*?textColor\s*:\s*getContrastTextColor\s*\(\s*item\.color\s*\)[\s\S]*?\}\s*\)\s*\)/m;

    expect(source).toMatch(eventMapperObjectPattern);
  });
});