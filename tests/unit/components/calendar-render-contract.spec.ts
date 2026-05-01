import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 5 calendar render contract", () => {
  it("maps Summit calendar items into FullCalendar event render callbacks", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("events={");
    expect(source).toContain("this.state.items.map");
    expect(source).toContain("id: item.Id");
    expect(source).toContain("title: item.Subject");
    expect(source).toContain("start: item.StartTime");
    expect(source).toContain("end: item.EndTime");
    expect(source).toContain("eventDidMount");
    expect(source).toContain("datesSet");

    expect(source).not.toContain("EventSettingsModel");
    expect(source).not.toContain("eventSettings=");
    expect(source).not.toContain("eventRendered=");
  });
});
