import fs from "fs";
import path from "path";

const controlFlowPath = path.resolve(__dirname, "../../docs/API/summit-terrain-control-flows.md");
const inventoryPath = path.resolve(__dirname, "../../docs/API/summit-terrain-interaction-inventory.md");

function readControlFlows(): string {
  return fs.readFileSync(controlFlowPath, "utf8");
}

describe("summit-terrain-control-flows consistency", () => {
  it("keeps one sequence diagram per required flow section", () => {
    expect(fs.existsSync(controlFlowPath)).toBe(true);

    const markdown = readControlFlows();
    const requiredSections = [
      "## Initialization flow",
      "## Awards checks flow",
      "## Calendar CRUD flow",
      "## Logbook copy/paste flow",
      "## iCal export flow",
    ];

    requiredSections.forEach((section, index) => {
      const start = markdown.indexOf(section);
      expect(start).toBeGreaterThanOrEqual(0);

      const end =
        index < requiredSections.length - 1
          ? markdown.indexOf(requiredSections[index + 1], start + section.length)
          : markdown.length;

      const sectionContent = markdown.slice(start, end);
      expect(sectionContent).toContain("```mermaid");
      expect(sectionContent).toContain("sequenceDiagram");
      expect(sectionContent).toContain("### Runtime symbol map");
    });
  });

  it("uses canonical Terrain hosts and service symbols aligned with the interaction inventory", () => {
    expect(fs.existsSync(inventoryPath)).toBe(true);

    const controlFlowMarkdown = readControlFlows();
    const inventoryMarkdown = fs.readFileSync(inventoryPath, "utf8");

    const requiredSharedTokens = [
      "events.terrain.scouts.com.au",
      "achievements.terrain.scouts.com.au",
      "members.terrain.scouts.com.au",
      "`src/services/fetchMemberEvents.ts`",
      "`src/services/fetchAchievements.ts`",
      "`src/services/fetchActivity.ts`",
      "`src/services/getLogbookData.ts`",
      "`src/services/saveLogbookData.ts`",
      "`src/services/createNewEvent.ts`",
      "`src/services/updateEvent.ts`",
      "`src/services/deleteEvent.ts`",
      "`src/services/fetchMemberCalendars.ts`",
      "`src/services/updateMemberCalendars.ts`",
    ];

    requiredSharedTokens.forEach((token) => {
      expect(controlFlowMarkdown).toContain(token);
      expect(inventoryMarkdown).toContain(token);
    });
  });
});
