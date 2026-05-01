import { validateSummitCalendarActivity } from "@/helpers/SummitCalendarValidation";

describe("Phase 4 SummitCalendar validation rules", () => {
  const buildValidActivity = () => ({
    title: "Camp planning",
    location: "Scout Hall",
    challenge_area: "community",
    review: {
      scout_method_elements: ["learn_by_doing"],
    },
    organisers: [{ id: "m1", first_name: "Alex", last_name: "Ng" }],
    start_datetime: "2026-04-01T09:00:00.000Z",
    end_datetime: "2026-04-01T11:00:00.000Z",
    attendance: {
      leader_members: [{ id: "m2", first_name: "Sam", last_name: "Lee" }],
      assistant_members: [{ id: "m3", first_name: "Jo", last_name: "Kim" }],
    },
  });

  it("passes when all required fields are present and dates/members are valid", () => {
    const result = validateSummitCalendarActivity(buildValidActivity());

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("fails when required fields are missing", () => {
    const activity = buildValidActivity();
    activity.title = "";
    activity.location = "";
    activity.challenge_area = "";
    activity.review.scout_method_elements = [];
    activity.organisers = [];

    const result = validateSummitCalendarActivity(activity);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        location: expect.any(String),
        challenge_area: expect.any(String),
        scout_method_elements: expect.any(String),
        organisers: expect.any(String),
      }),
    );
  });

  it("fails when a member is both a leader and assistant", () => {
    const activity = buildValidActivity();
    activity.attendance.leader_members = [{ id: "m5", first_name: "Jordan", last_name: "Fox" }];
    activity.attendance.assistant_members = [{ id: "m5", first_name: "Jordan", last_name: "Fox" }];

    const result = validateSummitCalendarActivity(activity);

    expect(result.isValid).toBe(false);
    expect(result.errors.member_roles).toContain("leader");
  });

  it("fails when start is same as or after end", () => {
    const activity = buildValidActivity();
    activity.start_datetime = "2026-04-01T11:00:00.000Z";
    activity.end_datetime = "2026-04-01T11:00:00.000Z";

    const result = validateSummitCalendarActivity(activity);

    expect(result.isValid).toBe(false);
    expect(result.errors.date_range).toContain("Start date");
  });
});
