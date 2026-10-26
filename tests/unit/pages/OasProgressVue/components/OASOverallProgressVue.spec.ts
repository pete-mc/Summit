import { buildHeaderView } from "@/pages/OasProgressVue/components/OASOverallProgressVue";

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
