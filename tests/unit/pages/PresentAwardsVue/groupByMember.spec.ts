import Vue from "vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { TerrainAchievementsType } from "@/shared";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";
import PresentAwardsTableVue from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";

function makeItem(id: string, name: string, presentedOn?: string): SummitAchievement {
  const member: TerrainUnitMember = {
    id: `member-${name}`,
    member_number: "123",
    first_name: name,
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "scout", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
  };

  const achievement = {
    id,
    member_id: member.id,
    section: "scout" as TerrainAchievements["section"],
    type: TerrainAchievementsType.IntroScouting as TerrainAchievements["type"],
    status: "awarded" as TerrainAchievements["status"],
    status_updated: "2026-03-05T00:00:00.000Z",
  } as TerrainAchievements;

  const item = new SummitAchievement(achievement, member, []);
  if (presentedOn) item.updatePresented(presentedOn);
  return item;
}

/**
 * Ticking a row in the real page always gives it a date (defaulted to the awarded date), so the
 * fixture mirrors that: every selected id gets a pending date unless one is passed explicitly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountTable(items: SummitAchievement[], selectedIds: Set<string>, groupByMember = true, presentedDates?: Record<string, string>): any {
  const dates =
    presentedDates ??
    Array.from(selectedIds).reduce(
      (accumulator, id) => {
        accumulator[id] = items.find((item) => item.id === id)?.dateAwarded ?? "01/01/2026";
        return accumulator;
      },
      {} as Record<string, string>,
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor: any = Vue.extend(PresentAwardsTableVue as any);
  return new Ctor({ propsData: { items, selectedIds, presentedDates: dates, groupByMember } });
}

describe("PresentAwardsTableVue — grouping by member", () => {
  it("groups by the display name when enabled", () => {
    expect(mountTable([makeItem("a", "Alex")], new Set(), true).groupBy).toEqual(["member"]);
  });

  it("passes an empty array when disabled, which v-data-table reads as ungrouped", () => {
    expect(mountTable([makeItem("a", "Alex")], new Set(), false).groupBy).toEqual([]);
  });
});

describe("PresentAwardsTableVue — group header label", () => {
  it("counts the awards still to be presented", () => {
    const items = [makeItem("a", "Alex"), makeItem("b", "Alex"), makeItem("c", "Alex", "01/02/2026")];
    const table = mountTable(items, new Set(["c"]));

    expect(table.groupLabel("Alex Scout", items)).toBe("Alex Scout (2 not presented)");
  });

  it("says so when a member has nothing outstanding", () => {
    const items = [makeItem("a", "Alex", "01/02/2026")];
    const table = mountTable(items, new Set(["a"]));

    expect(table.groupLabel("Alex Scout", items)).toBe("Alex Scout (all presented)");
  });

  it("uses the singular count wording for one outstanding award", () => {
    const items = [makeItem("a", "Alex")];

    expect(mountTable(items, new Set()).groupLabel("Alex Scout", items)).toBe("Alex Scout (1 not presented)");
  });

  it("counts down as rows are ticked, before saving", () => {
    // The label reads the on-screen value, so ticking a row updates it immediately.
    const items = [makeItem("a", "Alex"), makeItem("b", "Alex")];

    expect(mountTable(items, new Set()).groupLabel("Alex Scout", items)).toBe("Alex Scout (2 not presented)");
    expect(mountTable(items, new Set(["a"])).groupLabel("Alex Scout", items)).toBe("Alex Scout (1 not presented)");
    expect(mountTable(items, new Set(["a", "b"])).groupLabel("Alex Scout", items)).toBe("Alex Scout (all presented)");
  });

  it("counts a stored-but-unticked award as outstanding", () => {
    // Unticking a previously presented award means it is to be handed over again.
    const items = [makeItem("a", "Alex", "01/02/2026")];

    expect(mountTable(items, new Set()).groupLabel("Alex Scout", items)).toBe("Alex Scout (1 not presented)");
  });
});
