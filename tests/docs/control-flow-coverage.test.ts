import fs from "fs";
import path from "path";

const controlFlowPath = path.resolve(__dirname, "../../docs/API/summit-terrain-control-flows.md");

function readControlFlows(): string {
  return fs.readFileSync(controlFlowPath, "utf8");
}

describe("summit-terrain-control-flows coverage", () => {
  it("includes all required phase-2 feature flow sections", () => {
    expect(fs.existsSync(controlFlowPath)).toBe(true);

    const markdown = readControlFlows();

    expect(markdown).toContain("## Initialization flow");
    expect(markdown).toContain("## Awards checks flow");
    expect(markdown).toContain("## Calendar CRUD flow");
    expect(markdown).toContain("## Logbook copy/paste flow");
    expect(markdown).toContain("## iCal export flow");
  });

  it("contains Mermaid sequence diagrams for all core flows", () => {
    const markdown = readControlFlows();
    const mermaidBlockCount = (markdown.match(/```mermaid/g) ?? []).length;
    const sequenceDiagramCount = (markdown.match(/sequenceDiagram/g) ?? []).length;

    expect(mermaidBlockCount).toBeGreaterThanOrEqual(5);
    expect(sequenceDiagramCount).toBeGreaterThanOrEqual(5);
  });

  it("maps flow steps to runtime symbols and source files", () => {
    const markdown = readControlFlows();

    expect(markdown).toContain("### Runtime symbol map");

    const requiredReferences = [
      "`src/index.ts`",
      "`src/modules/summitModule.ts`",
      "`src/router/SummitRouter.ts`",
      "`src/pages/SummitCalendar/components/SummitCalendar.tsx`",
      "`src/components/copyLogbook.ts`",
      "`src/components/exportiCal.ts`",
      "`src/services/fetchMemberEvents.ts`",
      "`src/services/fetchAchievements.ts`",
      "`src/services/createNewEvent.ts`",
      "`src/services/updateEvent.ts`",
      "`src/services/deleteEvent.ts`",
      "`src/services/fetchMemberCalendars.ts`",
      "`src/services/updateMemberCalendars.ts`",
      "`src/services/getLogbookData.ts`",
      "`src/services/saveLogbookData.ts`",
      "`src/services/fetchActivity.ts`",
    ];

    requiredReferences.forEach((reference) => {
      expect(markdown).toContain(reference);
    });
  });
});
