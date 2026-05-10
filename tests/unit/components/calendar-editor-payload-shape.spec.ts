import React from "react";
import TerrainEventItem from "@/pages/SummitCalendar/models/TerrainEventItem";
import { SummitCalendarComponent } from "@/pages/SummitCalendar/components/SummitCalendar";
import { applyGroupedMultiSelectChange } from "@/helpers/SummitCalendarValidation";
import { TerrainEvent, TerrainUnitMember } from "@/types/terrainTypes";

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
                id: "u1",
                section: "scout",
              },
              member: {
                id: "m0",
              },
            },
          ],
          profileIndex: 0,
          memberDetails: {
            id: "m0",
            first_name: "Test",
            last_name: "Member",
          },
        },
        profile: {
          unit: {
            id: "u1",
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

const mountHarness = (activity: TerrainEvent) => {
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
    currentUnitID: "u1",
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

describe("Phase 4 calendar editor payload shape", () => {
  beforeAll(() => {
    initialiseNuxtState();
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

  it("produces_valid_datetime_payload_after_time_edit", () => {
    const component = mountHarness({
      title: "Meeting",
      description: "",
      justification: "",
      location: "Hall",
      challenge_area: "community",
      start_datetime: "2026-04-01T09:00:00+10:00",
      end_datetime: "2026-04-01T11:00:00+10:00",
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
    } as TerrainEvent);

    fireDateTimeChange(component, "start_time", "08:15");
    fireDateTimeChange(component, "end_time", "10:45");

    const payload = new TerrainEventItem(component.state.activity);

    expect(payload.start_datetime).toMatch(/^2026-03-31T22:15:00\.000\+00:00$/);
    expect(payload.end_datetime).toMatch(/^2026-04-01T00:45:00\.000\+00:00$/);
    expect(payload.start_datetime).not.toContain("Invalid date");
    expect(payload.end_datetime).not.toContain("Invalid date");
  });
});
