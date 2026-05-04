import fs from "fs";
import path from "path";

const inventoryPath = path.resolve(__dirname, "../../docs/API/summit-terrain-interaction-inventory.md");

function readInventory(): string {
  return fs.readFileSync(inventoryPath, "utf8");
}

describe("summit-terrain-interaction-inventory links and coverage", () => {
  it("contains the canonical interaction table columns", () => {
    const markdown = readInventory();

    expect(markdown).toContain("| Source location |");
    expect(markdown).toContain("| Trigger |");
    expect(markdown).toContain("| Endpoint / host |");
    expect(markdown).toContain("| Auth requirement |");
    expect(markdown).toContain("| Input |");
    expect(markdown).toContain("| Output |");
    expect(markdown).toContain("| Side effects |");
  });

  it("covers required integration areas", () => {
    const markdown = readInventory();

    expect(markdown).toContain("## Bootstrap and injection");
    expect(markdown).toContain("## Auth source");
    expect(markdown).toContain("## Service calls");
    expect(markdown).toContain("## Iframe integration");
    expect(markdown).toContain("## Event and listener integration");
    expect(markdown).toContain("## Error and timeout behavior");
  });

  it("references key source files for runtime Terrain interactions", () => {
    const markdown = readInventory();

    const requiredSourceLinks = [
      "`src/summitloader.js`",
      "`src/index.ts`",
      "`src/helpers/TerrainState.ts`",
      "`src/services/createNewEvent.ts`",
      "`src/services/updateEvent.ts`",
      "`src/services/deleteEvent.ts`",
      "`src/services/fetchMemberEvents.ts`",
      "`src/services/fetchActivity.ts`",
      "`src/services/fetchMemberCalendars.ts`",
      "`src/services/updateMemberCalendars.ts`",
      "`src/services/fetchUnitMembers.ts`",
      "`src/services/getCurrentProfile.ts`",
      "`src/services/fetchUnitAchievements.ts`",
      "`src/services/fetchAchievements.ts`",
      "`src/services/fetchUnitAchievementsFilterd.ts`",
      "`src/services/getLogbookData.ts`",
      "`src/services/saveLogbookData.ts`",
      "`src/services/fetchSIATemplate.ts`",
      "`src/services/fetchUnitMembersMetrics.ts`",
      "`src/router/SummitRouter.ts`",
      "`src/pages/SummitCalendar/components/SummitCalendar.tsx`",
      "`src/modules/summitModule.ts`",
    ];

    requiredSourceLinks.forEach((source) => {
      expect(markdown).toContain(source);
    });
  });
});
