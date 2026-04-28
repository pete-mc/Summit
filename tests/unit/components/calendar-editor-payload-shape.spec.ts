import TerrainEventItem from "@/pages/SummitCalendar/models/TerrainEventItem";
import { applyGroupedMultiSelectChange } from "@/helpers/SummitCalendarValidation";
import { TerrainEvent, TerrainUnitMember } from "@/types/terrainTypes";

describe("Phase 4 calendar editor payload shape", () => {
  beforeAll(() => {
    (window as unknown as { $nuxt: unknown }).$nuxt = {
      $store: {
        state: {
          user: {
            memberDetails: {
              first_name: "Test",
              last_name: "Member",
            },
          },
          profile: {
            unit: {
              id: "u1",
            },
          },
        },
      },
    };
  });

  const members = [
    { id: "m1", first_name: "Alex", last_name: "Ng", groups: [{ id: "g1", name: "Kookaburras" }] },
    { id: "m2", first_name: "Sam", last_name: "Lee", groups: [{ id: "g2", name: "Wallabies" }] },
    { id: "m3", first_name: "Jo", last_name: "Kim", groups: [{ id: "g2", name: "Wallabies" }] },
  ] as unknown as TerrainUnitMember[];

  it("keeps organiser/member/review semantics when transformed into TerrainEventItem payload", () => {
    const baseActivity = {
      title: "Meeting",
      description: "",
      justification: "",
      location: "Hall",
      challenge_area: "community",
      start_datetime: "2026-04-01T09:00:00.000Z",
      end_datetime: "2026-04-01T11:00:00.000Z",
      organisers: [],
      attendance: {
        leader_members: [],
        assistant_members: [],
        attendee_members: [],
      },
      review: {
        scout_method_elements: [],
      },
      owner_type: "unit",
      owner_id: "u1",
    } as unknown as TerrainEvent;

    const withOrganisers = applyGroupedMultiSelectChange(baseActivity, "organisers", ["m1", "m3"], members) as TerrainEvent;
    const withLeaders = applyGroupedMultiSelectChange(withOrganisers, "leader_members", ["m2"], members) as TerrainEvent;
    const withAssistants = applyGroupedMultiSelectChange(withLeaders, "assistant_members", ["m3"], members) as TerrainEvent;
    const complete = applyGroupedMultiSelectChange(withAssistants, "scout_method_elements", ["learn_by_doing", "promise_and_law"], members) as TerrainEvent;

    const payload = new TerrainEventItem(complete);

    expect(payload.organisers).toEqual(["m1", "m3"]);
    expect(payload.attendance.leader_member_ids).toEqual(["m2"]);
    expect(payload.attendance.assistant_member_ids).toEqual(["m3"]);
    expect(payload.review.scout_method_elements).toEqual(["learn_by_doing", "promise_and_law"]);
  });
});
