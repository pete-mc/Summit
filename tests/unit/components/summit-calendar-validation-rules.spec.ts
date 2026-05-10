import React from "react";
import { validateSummitCalendarActivity } from "@/helpers/SummitCalendarValidation";
import { SummitCalendarComponent } from "@/pages/SummitCalendar/components/SummitCalendar";

jest.mock("@fullcalendar/react", () => () => null);
jest.mock("@fullcalendar/core/locales/en-au", () => ({}));
jest.mock("@fullcalendar/daygrid", () => ({}));
jest.mock("@fullcalendar/timegrid", () => ({}));
jest.mock("@fullcalendar/list", () => ({}));
jest.mock("@fullcalendar/interaction", () => ({}));
jest.mock("react-datepicker", () => () => null);
jest.mock("react-datepicker/dist/react-datepicker.css", () => ({}), { virtual: true });

const initialiseNuxtState = () => {
  (window as any).$nuxt = {
    $store: {
      state: {
        user: {
          profiles: [
            {
              unit: {
                id: "unit-1",
                section: "scout",
              },
              member: {
                id: "member-1",
              },
            },
          ],
          profileIndex: 0,
          memberDetails: {
            id: "member-1",
            first_name: "Casey",
            last_name: "Tester",
          },
        },
        auth: {
          idToken: "token",
        },
      },
    },
    $accessor: {
      programming: {
        setActivity: jest.fn(),
        setActivityFlow: jest.fn(),
      },
    },
  };
};

const mountHarness = (activity: any) => {
  initialiseNuxtState();

  const component = new SummitCalendarComponent({ items: [], onUpdate: jest.fn() });

  (component as any).setState = (updater: any, callback?: () => void) => {
    const previousState = component.state;
    const patch = typeof updater === "function" ? updater(previousState, component.props) : updater;
    (component as any).state = {
      ...previousState,
      ...patch,
    };
    callback?.();
  };

  (component as any).clearValidationErrorsFor = jest.fn();
  (component as any).persistEditorDraft = jest.fn();
  (component as any).setSoftConflictWarnings = jest.fn();

  (component as any).state = {
    ...component.state,
    activity,
    currentUnitID: "unit-1",
  };

  return component;
};

const fireDateTimeChange = (component: SummitCalendarComponent, name: string, value: string) => {
  component.handleDateTimeChange({
    target: {
      name,
      value,
    },
  } as React.ChangeEvent<HTMLInputElement>);
};

describe("Phase 4 SummitCalendar validation rules", () => {
  beforeAll(() => {
    initialiseNuxtState();
  });

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

  it("validation_paths_handle_updated_start_end_without_blanking", () => {
    const component = mountHarness({
      ...buildValidActivity(),
      owner_type: "unit",
      owner_id: "unit-1",
      start_datetime: "2026-04-01T09:00:00+10:00",
      end_datetime: "2026-04-01T11:00:00+10:00",
      attendance: {
        leader_members: [{ id: "m2", first_name: "Sam", last_name: "Lee" }],
        assistant_members: [{ id: "m3", first_name: "Jo", last_name: "Kim" }],
        attendee_members: [],
      },
    });

    fireDateTimeChange(component, "start_time", "07:30");
    fireDateTimeChange(component, "end_time", "09:00");

    const result = validateSummitCalendarActivity(component.state.activity);

    expect(component.state.activity.start_datetime).toMatch(/^2026-04-01T07:30:00/);
    expect(component.state.activity.end_datetime).toMatch(/^2026-04-01T09:00:00/);
    expect(result.isValid).toBe(true);
    expect(result.errors.date_range).toBeUndefined();
  });
});
