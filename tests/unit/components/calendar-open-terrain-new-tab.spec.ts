import { SummitCalendarComponent } from "@/pages/SummitCalendar/components/SummitCalendar";
import { fetchActivity } from "@/services";

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

type CalendarHarness = SummitCalendarComponent & {
  setState: (updater: unknown, callback?: () => void) => void;
};

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

const mountHarness = (activityId?: string): CalendarHarness => {
  initialiseNuxtState();
  const component = new SummitCalendarComponent({ items: [], onUpdate: jest.fn() }) as CalendarHarness;

  component.setState = (updater: unknown, callback?: () => void) => {
    const previousState = component.state;
    const patch =
      typeof updater === "function"
        ? (updater as (state: SummitCalendarComponent["state"], props: SummitCalendarComponent["props"]) => Partial<SummitCalendarComponent["state"]>)(previousState, component.props)
        : updater;

    component.state = {
      ...previousState,
      ...(patch as Partial<SummitCalendarComponent["state"]>),
    };

    callback?.();
  };

  component.state = {
    ...component.state,
    activity: {
      ...component.state.activity,
      id: activityId,
    },
  };

  return component;
};

describe("Phase 2 open in terrain new-tab behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens a new tab to view an activity when an activity id exists", async () => {
    const component = mountHarness("activity-123");
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    const fetchedActivity = {
      id: "activity-123",
      title: "Camp planning",
    };

    (fetchActivity as jest.Mock).mockResolvedValue(fetchedActivity);

    await component.openTerrainDialog();

    expect(fetchActivity).toHaveBeenCalledWith("activity-123");
    expect((window as any).$nuxt.$accessor.programming.setActivity).toHaveBeenCalledWith(fetchedActivity);
    expect((window as any).$nuxt.$accessor.programming.setActivityFlow).toHaveBeenCalledWith("view");
    expect(openSpy).toHaveBeenCalledWith("https://terrain.scouts.com.au/programming/view-activity", "_blank");

    openSpy.mockRestore();
  });

  it("is a no-op when the activity id is missing", async () => {
    const component = mountHarness(undefined);
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    await component.openTerrainDialog();

    expect(fetchActivity).not.toHaveBeenCalled();
    expect((window as any).$nuxt.$accessor.programming.setActivity).not.toHaveBeenCalled();
    expect((window as any).$nuxt.$accessor.programming.setActivityFlow).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });
});