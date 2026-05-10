import React from "react";
import { DatePickerComponent } from "@/components/DateTimeInputs";
import { SummitCalendarComponent } from "@/pages/SummitCalendar/components/SummitCalendar";
import { TerrainEvent } from "@/types/terrainTypes";

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

const seedActivity = (start_datetime: string, end_datetime: string): TerrainEvent => ({
  title: "Night Hike",
  location: "Trail",
  challenge_area: "outdoors",
  organisers: [],
  review: {
    scout_method_elements: [],
  },
  attendance: {
    leader_members: [],
    assistant_members: [],
    attendee_members: [],
  },
  owner_type: "unit",
  owner_id: "unit-1",
  start_datetime,
  end_datetime,
});

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

const findElementById = (node: unknown, id: string): React.ReactElement | null => {
  if (!React.isValidElement(node)) {
    return null;
  }

  if ((node.props as { id?: string }).id === id) {
    return node;
  }

  const children = React.Children.toArray((node.props as { children?: React.ReactNode }).children);
  for (const child of children) {
    const result = findElementById(child, id);
    if (result) {
      return result;
    }
  }

  return null;
};

describe("Phase 1 datetime picker date blanking regressions", () => {
  it("keeps_start_date_when_start_time_changes_to_hh_mm", () => {
    const component = mountHarness(seedActivity("2026-04-07T00:15:00+10:00", "2026-04-07T02:00:00+10:00"));

    fireDateTimeChange(component, "start_time", "09:30");

    expect(component.state.activity.start_datetime).toMatch(/^2026-04-07T09:30:00/);
  });

  it("keeps_end_date_when_end_time_changes_to_hh_mm", () => {
    const component = mountHarness(seedActivity("2026-04-07T18:00:00+10:00", "2026-04-08T00:45:00+10:00"));

    fireDateTimeChange(component, "end_time", "11:05");

    expect(component.state.activity.end_datetime).toMatch(/^2026-04-08T11:05:00/);
  });

  it("keeps_prior_datetime_when_time_input_invalid", () => {
    const previousStart = "2026-04-07T18:30:00+10:00";
    const component = mountHarness(seedActivity(previousStart, "2026-04-07T20:00:00+10:00"));

    fireDateTimeChange(component, "start_time", "not-a-time");

    expect(component.state.activity.start_datetime).toBe(previousStart);
  });

  it("does_not_blank_date_input_after_time_edit", () => {
    const component = mountHarness(seedActivity("2026-04-07T00:15:00+10:00", "2026-04-07T02:00:00+10:00"));

    fireDateTimeChange(component, "start_time", "09:30");

    const editor = component.editorTemplate();
    const startDatePicker = findElementById(editor, "start_date");

    expect(startDatePicker).toBeTruthy();

    const renderedDateInput = DatePickerComponent(startDatePicker!.props) as React.ReactElement;

    expect(renderedDateInput.props.value).not.toBe("");
    expect(renderedDateInput.props.value).toBe("2026-04-07");
  });
});
