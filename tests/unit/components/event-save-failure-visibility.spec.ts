import * as fs from "fs";
import * as path from "path";
import { SummitCalendarComponent } from "@/pages/SummitCalendar/components/SummitCalendar";
import { createNewEvent, updateEvent } from "@/services";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

jest.mock("@fullcalendar/react", () => () => null);
jest.mock("@fullcalendar/core/locales/en-au", () => ({}));
jest.mock("@fullcalendar/daygrid", () => ({}));
jest.mock("@fullcalendar/timegrid", () => ({}));
jest.mock("@fullcalendar/list", () => ({}));
jest.mock("@fullcalendar/interaction", () => ({}));
jest.mock("react-datepicker", () => () => null);
jest.mock("react-datepicker/dist/react-datepicker.css", () => ({}), { virtual: true });

jest.mock("@/services", () => ({
  createNewEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  fetchActivity: jest.fn(),
  fetchMemberCalendars: jest.fn(),
  fetchMemberEvents: jest.fn(),
  fetchUnitMembers: jest.fn(),
  updateMemberCalendars: jest.fn(),
}));

const initialiseNuxtState = () => {
  const runtimeWindow = window as unknown as {
    $nuxt: {
      $store: {
        state: {
          user: {
            profiles: Array<{ unit: { id: string; section: string }; member: { id: string } }>;
            profileIndex: number;
            memberDetails: { id: string; first_name: string; last_name: string };
          };
          auth: {
            idToken: string;
          };
        };
      };
      $accessor: {
        programming: {
          setActivity: jest.Mock;
          setActivityFlow: jest.Mock;
        };
      };
    };
  };

  runtimeWindow.$nuxt = {
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

type SaveFailureHarness = SummitCalendarComponent & {
  setState: (updater: unknown, callback?: () => void) => void;
  state: SummitCalendarComponent["state"] & {
    editorSaveErrors?: string[];
  };
};

const mountHarness = (activity: Record<string, unknown>) => {
  initialiseNuxtState();

  const component = new SummitCalendarComponent({ items: [], onUpdate: jest.fn() }) as SaveFailureHarness;

  component.setState = (updater: unknown, callback?: () => void) => {
    const previousState = component.state;
    const patch = typeof updater === "function" ? (updater as (state: SummitCalendarComponent["state"], props: SummitCalendarComponent["props"]) => Partial<SummitCalendarComponent["state"]>)(previousState, component.props) : updater;
    component.state = {
      ...previousState,
      ...(patch as Partial<SummitCalendarComponent["state"]>),
    };
    callback?.();
  };

  component.state = {
    ...component.state,
    activity: activity as SummitCalendarComponent["state"]["activity"],
    isEditorOpen: true,
    currentUnitID: "unit-1",
  };

  return component;
};

const buildValidActivity = (overrides: Record<string, unknown> = {}) => ({
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
    attendee_members: [],
  },
  owner_type: "unit",
  owner_id: "unit-1",
  ...overrides,
});

describe("Phase 3 save failure visibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  it("shows both top-level and inline backend errors verbatim on create failure and keeps the editor open", async () => {
    const component = mountHarness(buildValidActivity());

    (createNewEvent as jest.Mock).mockResolvedValue({
      ok: false,
      topLevelMessages: ["Backend validation: title cannot include /"],
      fieldErrors: {
        title: ["Title cannot include /"],
        organisers: ["Assign at least 2 organisers", "Lead organiser must be adult leader"],
      },
    });

    await component.saveActivity();

    expect(component.state.isEditorOpen).toBe(true);
    expect(component.state.activity.title).toBe("Camp planning");
    expect(component.state.editorValidationErrors.title).toContain("Title cannot include /");
    expect(component.state.editorValidationErrors.organisers).toContain("Assign at least 2 organisers");
    expect(component.state.editorValidationErrors.organisers).toContain("Lead organiser must be adult leader");

    expect(component.state.editorSaveErrors).toEqual(["Backend validation: title cannot include /"]);

    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    expect(source).toContain('data-editor-save-errors="true"');
  });

  it("shows all backend messages on update failure and keeps editor open", async () => {
    const component = mountHarness(
      buildValidActivity({
        id: "event-123",
      }),
    );

    (updateEvent as jest.Mock).mockResolvedValue({
      ok: false,
      topLevelMessages: ["Unable to save event", "Please fix validation and retry"],
      fieldErrors: {
        date_range: ["End must be after start"],
      },
    });

    await component.saveActivity();

    expect(component.state.isEditorOpen).toBe(true);
    expect(component.state.editorSaveErrors).toEqual(["Unable to save event", "Please fix validation and retry"]);
    expect(component.state.editorValidationErrors.date_range).toContain("End must be after start");
  });
});
