// Gotcha: Jest can't parse .vue files, so stub the child.
jest.mock("@/pages/OasProgressVue/components/OASTabJumpMenu.vue", () => ({ __esModule: true, default: { name: "OASTabJumpMenu", render: () => null } }), { virtual: true });

import { buildHeaderView, cellTitle, linkedCellTitle } from "@/pages/OasProgressVue/components/OASOverallProgressVue";
import type { TabJump } from "@/pages/OasProgressVue/services/tabJumps";

describe("linkedCellTitle", () => {
  const jump: TabJump = { viewMode: "nextSteps", filters: {}, title: "Open Next Steps: Jane – Camping", from: { viewMode: "summary", tabName: "Summary", detail: "Jane – Camping" } };

  it("adds the jump to the cell's own tooltip", () => {
    const cell = { stage: "2", nextStageProgress: null, awards: [{ stream: "camping", branch: "camping", stage: 2, section: "scout", date: "2025-02-02" }] };
    expect(linkedCellTitle(cell, jump)).toBe("Camping - Stage 2 - 02/02/2025 as a Scout\nOpen Next Steps: Jane – Camping");
  });

  it("has no tooltip when there is neither", () => {
    expect(linkedCellTitle({ stage: "3", nextStageProgress: "02" }, null)).toBeNull();
  });
});

describe("cellTitle", () => {
  it("has no tooltip on an expanded cell", () => {
    expect(cellTitle({ stage: "3", nextStageProgress: "02" })).toBeNull();
  });

  it("lists each trunk/stream's highest award on a collapsed cell, like Peak Award Core Skills", () => {
    const title = cellTitle({
      stage: "5",
      nextStageProgress: null,
      awards: [
        { stream: "bushcraft", branch: "bushcraft", stage: 3, section: "scout", date: "2025-02-02" },
        { stream: "bushcraft", branch: "pioneering", stage: 5, section: "scout", date: "2026-03-12" },
      ],
    });

    expect(title).toBe("Bushcraft - Stage 3 - 02/02/2025 as a Scout\nPioneering - Stage 5 - 12/03/2026 as a Scout");
  });
});

describe("buildHeaderView", () => {
  it("shows only the skill for a trunk column", () => {
    expect(buildHeaderView({ key: "camping::", skill: "camping", stream: null })).toEqual({ key: "camping::", skillLabel: "Camping", streamLabel: null, sortDirection: null });
  });

  it("puts the formatted stream on its own line for a stream column", () => {
    const view = buildHeaderView({ key: "bushcraft::survival-skills", skill: "bushcraft", stream: "survival-skills" });

    expect(view.skillLabel).toBe("Bushcraft");
    expect(view.streamLabel).toBe("Survival Skills");
  });

  it("marks only the sorted column with its direction", () => {
    const column = { key: "camping::", skill: "camping", stream: null };

    expect(buildHeaderView(column, { key: "camping::", descending: true }).sortDirection).toBe("descending");
    expect(buildHeaderView(column, { key: "camping::", descending: false }).sortDirection).toBe("ascending");
    expect(buildHeaderView(column, { key: "aquatics::", descending: true }).sortDirection).toBeNull();
  });
});
