import * as fs from "fs";
import * as path from "path";
import { applyGroupedMultiSelectChange, buildGroupedMemberOptions } from "@/helpers/SummitCalendarValidation";
import { TerrainUnitMember } from "@/types/terrainTypes";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 4 grouped multi-select semantics", () => {
  const members = [
    {
      id: "m1",
      first_name: "Alex",
      last_name: "Ng",
      groups: [{ id: "g1", name: "Kookaburras" }],
    },
    {
      id: "m2",
      first_name: "Sam",
      last_name: "Lee",
      groups: [
        { id: "g1", name: "Kookaburras" },
        { id: "g2", name: "Wallabies" },
      ],
    },
  ] as unknown as TerrainUnitMember[];

  it("removes Syncfusion DropDownTree usage and keeps grouped multi-select pattern in SummitCalendar", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).not.toContain("DropDownTreeComponent");
    expect(source).toContain("multiple");
    expect(source).toContain("optgroup");
  });

  it("builds grouped member options for select optgroups", () => {
    const groups = buildGroupedMemberOptions(members);

    expect(groups.map((g) => g.label)).toEqual(expect.arrayContaining(["Kookaburras", "Wallabies"]));
    expect(groups.find((g) => g.label === "Kookaburras")?.options).toEqual(expect.arrayContaining([expect.objectContaining({ value: "m1", label: "Alex Ng" }), expect.objectContaining({ value: "m2", label: "Sam Lee" })]));
  });

  it("maps grouped multi-select values to organiser/member payload members", () => {
    const baseActivity = {
      organisers: [],
      attendance: {
        leader_members: [],
        assistant_members: [],
      },
      review: {
        scout_method_elements: [],
      },
    };

    const withOrganisers = applyGroupedMultiSelectChange(baseActivity, "organisers", ["m1", "m2"], members);
    const withLeads = applyGroupedMultiSelectChange(withOrganisers, "leader_members", ["m2"], members);

    expect(withLeads.organisers).toEqual([
      { id: "m1", first_name: "Alex", last_name: "Ng" },
      { id: "m2", first_name: "Sam", last_name: "Lee" },
    ]);
    expect(withLeads.attendance.leader_members).toEqual([{ id: "m2", first_name: "Sam", last_name: "Lee" }]);
  });
});
