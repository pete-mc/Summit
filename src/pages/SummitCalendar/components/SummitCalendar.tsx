import React, { FocusEvent } from "react";
import FullCalendar from "@fullcalendar/react";
import enAuLocale from "@fullcalendar/core/locales/en-au";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, DatesSetArg, EventClickArg, EventMountArg } from "@fullcalendar/core";
import SummitCalendarItem from "../models/SummitCalendarItems";
import { createNewEvent, deleteEvent, fetchActivity, fetchMemberCalendars, fetchMemberEvents, fetchUnitMembers, updateEvent, updateMemberCalendars } from "@/services";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TerrainEvent, TerrainUnitMember, TerrrainCalendarResult } from "@/types/terrainTypes";
import {
  TerrainState,
  applyGroupedMultiSelectChange,
  buildGroupedMemberOptions,
  clearSummitCalendarEditorDraft,
  detectSummitCalendarSoftConflicts,
  loadSummitCalendarEditorDraft,
  saveSummitCalendarEditorDraft,
  validateSummitCalendarActivity,
} from "@/helpers";
import { GroupedMultiSelectGroup } from "@/helpers/SummitCalendarValidation";
import TerrainEventItem from "../models/TerrainEventItem";
import { DatePickerComponent, TimePickerComponent } from "@/components/DateTimeInputs";
import { DropDownListComponent } from "@/components/SimpleDropdown";
import { DialogComponent, DialogUtility } from "@/components/DialogComponent";

const SUMMIT_CALENDAR_VIEW_STORAGE_KEY = "summit.calendar.currentView";
type AgendaRangePreset = "week" | "month" | "year" | "custom";

interface SummitCalendarProps {
  items: SummitCalendarItem[];
  onUpdate: (items: SummitCalendarItem[]) => void;
}

interface SummitCalendarState {
  items: SummitCalendarItem[];
  sortState: { sortColumn: string; sortDirection: string };
  activity: TerrainEvent;
  calendarLoadState: "loading" | "ready" | "empty" | "error";
  calendarLoadError: string | null;
  editorIsLoading: boolean;
  isEditorOpen: boolean;
  members: { value: string; text: string }[];
  currentUnitID: string;
  unitMembers: TerrainUnitMember[];
  hideDialog: boolean;
  iframeKey: number;
  calendars: TerrrainCalendarResult;
  allCalendars: { id: string; name: string; selected: boolean }[];
  currentWindow: { startDate: string; endDate: string } | null;
  editorValidationErrors: Record<string, string>;
  editorSoftConflictWarnings: string[];
  currentCalendarView: string;
  agendaRangeStart: string;
  agendaRangeEnd: string;
  agendaRangePreset: AgendaRangePreset;
}

export class SummitCalendarComponent extends React.Component<SummitCalendarProps, SummitCalendarState> {
  private calendarRef = React.createRef<FullCalendar>();

  constructor(props: SummitCalendarProps) {
    super(props);
    this.state = {
      items: [],
      sortState: { sortColumn: "file", sortDirection: "ascending" },
      activity: { start_datetime: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), end_datetime: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ") },
      calendarLoadState: "loading",
      calendarLoadError: null,
      editorIsLoading: false,
      isEditorOpen: false,
      members: [],
      currentUnitID: TerrainState.getUnitID(),
      unitMembers: [],
      hideDialog: true,
      iframeKey: 0,
      calendars: {},
      allCalendars: [],
      currentWindow: null,
      editorValidationErrors: {},
      editorSoftConflictWarnings: [],
      currentCalendarView: this.loadPersistedCalendarView(),
      agendaRangeStart: moment().startOf("week").format("YYYY-MM-DD"),
      agendaRangeEnd: moment().startOf("week").add(6, "days").format("YYYY-MM-DD"),
      agendaRangePreset: "week",
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  loadPersistedCalendarView = (): string => {
    const fallbackView = "dayGridMonth";

    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return fallbackView;
      }

      const persistedView = window.localStorage.getItem(SUMMIT_CALENDAR_VIEW_STORAGE_KEY);
      return persistedView || fallbackView;
    } catch {
      return fallbackView;
    }
  };

  persistCalendarView = (viewType: string) => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }

      if (viewType === "listRange") {
        viewType = "listWeek";
      }

      localStorage.setItem(SUMMIT_CALENDAR_VIEW_STORAGE_KEY, viewType);
    } catch {
      // Non-blocking persistence: ignore storage failures.
    }
  };

  shouldIgnoreSchedulerShortcut = (event: React.KeyboardEvent<HTMLDivElement>): boolean => {
    const targetElement = event.target as HTMLElement | null;
    const targetTag = targetElement?.tagName?.toLowerCase();
    return targetTag === "input" || targetTag === "textarea" || targetTag === "select";
  };

  handleSchedulerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (this.state.isEditorOpen || this.shouldIgnoreSchedulerShortcut(event)) {
      return;
    }

    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === "n") {
      event.preventDefault();
      const startDate = moment().minute(0).second(0).millisecond(0).add(1, "hour").utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const endDate = moment(startDate).add(1, "hour").utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      this.newActivity(startDate, endDate);
    }
  };

  buildEditorDefaults = (startDate: string, endDate: string): TerrainEvent => ({
    title: "",
    location: "",
    challenge_area: "",
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
    owner_id: this.state.currentUnitID,
    start_datetime: moment(startDate).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    end_datetime: moment(endDate).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  });

  focusTitleInput = () => {
    const titleInput = document.querySelector<HTMLInputElement>('input[name="title"]');
    titleInput?.focus();
  };

  setEditorValidationErrors = (editorValidationErrors: Record<string, string>) => {
    this.setState({ editorValidationErrors });
  };

  setSoftConflictWarnings = (activity: TerrainEvent | undefined) => {
    const editorSoftConflictWarnings = detectSummitCalendarSoftConflicts(activity, this.state.items);
    this.setState({ editorSoftConflictWarnings });
  };

  persistEditorDraft = (activity: TerrainEvent) => {
    if (activity?.id) {
      return;
    }

    saveSummitCalendarEditorDraft(activity);
  };

  clearValidationErrorsFor = (fieldIds: string[]) => {
    if (!fieldIds.length) {
      return;
    }

    this.setState((prevState) => {
      const nextErrors = { ...prevState.editorValidationErrors };
      fieldIds.forEach((fieldId) => {
        delete nextErrors[fieldId];
      });

      return {
        editorValidationErrors: nextErrors,
      };
    });
  };

  handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        void this.saveActivity();
      }
    }
  };

  componentDidMount() {
    this.fetchCalendars();
    this.fetchData();
  }

  fetchCalendars = async () => {
    const calendars = await fetchMemberCalendars();
    const allCalendars =
      calendars && calendars.own_calendars && calendars.other_calendars
        ? calendars.own_calendars
            ?.map((calendar) => ({ id: calendar.id, name: calendar.title, selected: calendar.selected }))
            .concat(calendars.other_calendars?.map((calendar) => ({ id: calendar.id, name: calendar.title, selected: calendar.selected })))
        : [];
    this.setState({ calendars: calendars, allCalendars: allCalendars });
  };

  fetchData = async (startDate?: string, endDate?: string) => {
    this.setState({ calendarLoadState: "loading", calendarLoadError: null });

    try {
      const unitMembers = await fetchUnitMembers();
      const members = unitMembers.map((member) => ({ value: member.id, text: member.first_name + " " + member.last_name }));
      this.setState({ members: members, unitMembers: unitMembers });

      const defaultStart = moment().startOf("month").format("YYYY-MM-DDTHH:mm:ss");
      const defaultEnd = moment().endOf("month").format("YYYY-MM-DDTHH:mm:ss");
      const rangeStart = startDate ?? this.state.currentWindow?.startDate ?? defaultStart;
      const rangeEnd = endDate ?? this.state.currentWindow?.endDate ?? defaultEnd;

      const data = await fetchMemberEvents(rangeStart, rangeEnd);
      const items = data.map((item) => new SummitCalendarItem(item));
      this.setState({
        items: items,
        calendarLoadState: items.length === 0 ? "empty" : "ready",
      });
      this.props.onUpdate(items);
    } catch (error) {
      this.setState({
        calendarLoadState: "error",
        calendarLoadError: error instanceof Error ? error.message : "Unknown calendar load error",
      });
    }
  };

  handleDatesSet = (args: DatesSetArg) => {
    const startDate = moment(args.start).format("YYYY-MM-DDTHH:mm:ss");
    const endDate = moment(args.end).format("YYYY-MM-DDTHH:mm:ss");
    const agendaRangeStart = moment(args.start).format("YYYY-MM-DD");
    const agendaRangeEnd = moment(args.end).subtract(1, "day").format("YYYY-MM-DD");
    const agendaRangePreset = this.getAgendaRangePreset(args.view.type, args.start, args.end);
    this.persistCalendarView(args.view.type);
    this.setState({ currentWindow: { startDate, endDate }, currentCalendarView: args.view.type, agendaRangeStart, agendaRangeEnd, agendaRangePreset }, () => {
      this.fetchData(startDate, endDate);
    });
  };

  getAgendaRangePreset = (viewType: string, start: Date, endExclusive: Date): AgendaRangePreset => {
    if (viewType === "listWeek") return "week";
    if (viewType === "listMonth") return "month";
    if (viewType === "listYear") return "year";
    if (viewType !== "listRange") return "custom";

    // listRange — detect by range length
    const startMoment = moment(start).startOf("day");
    const endMoment = moment(endExclusive).startOf("day");

    if (startMoment.clone().add(7, "days").isSame(endMoment)) return "week";
    if (startMoment.date() === 1 && startMoment.clone().add(1, "month").isSame(endMoment)) return "month";
    if (startMoment.dayOfYear() === 1 && startMoment.clone().add(1, "year").isSame(endMoment)) return "year";

    return "custom";
  };

  handleAgendaPresetSelect = (preset: Exclude<AgendaRangePreset, "custom">) => {
    const calendarApi = this.calendarRef.current?.getApi();
    if (!calendarApi) {
      return;
    }

    // Use built-in list views so prev/next/today navigation works natively.
    const viewName = preset === "week" ? "listWeek" : preset === "month" ? "listMonth" : "listYear";
    this.setState({ agendaRangePreset: preset }, () => {
      calendarApi.changeView(viewName);
    });
  };

  handleListRangePickerChange = (dates: [Date | null, Date | null]) => {
    const [startDate, endDate] = dates;

    if (!startDate) {
      this.setState({ agendaRangeStart: "", agendaRangeEnd: "", agendaRangePreset: "custom" });
      return;
    }

    if (!endDate) {
      this.setState({ agendaRangeStart: moment(startDate).format("YYYY-MM-DD"), agendaRangeEnd: "", agendaRangePreset: "custom" });
      return;
    }

    const calendarApi = this.calendarRef.current?.getApi();
    if (!calendarApi) {
      this.setState({ agendaRangeStart: moment(startDate).format("YYYY-MM-DD"), agendaRangeEnd: moment(endDate).format("YYYY-MM-DD"), agendaRangePreset: "custom" });
      return;
    }

    const endExclusive = moment(endDate).add(1, "day");
    this.setState(
      {
        agendaRangeStart: moment(startDate).format("YYYY-MM-DD"),
        agendaRangeEnd: moment(endDate).format("YYYY-MM-DD"),
        agendaRangePreset: "custom",
      },
      () => {
        calendarApi.changeView("listRange", { start: startDate, end: endExclusive.toDate() });
      },
    );
  };

  renderCalendarLegend = (items: SummitCalendarItem[]) => {
    const seen = new Set<string>();
    const entries: { color: string; label: string }[] = [];
    for (const item of items) {
      if (!item.color) continue;
      const label = item.event.invitee_name || item.event.section;
      const key = `${item.color}|${label}`;
      if (!seen.has(key)) {
        seen.add(key);
        entries.push({ color: item.color, label });
      }
    }

    return (
      <div className="calendar-legend" data-calendar-legend="visible" aria-label="Calendar legend">
        <span>Legend:</span>
        {entries.map(({ color, label }) => (
          <span key={`legend-${color}-${label}`} className="calendar-legend-item">
            <span className="calendar-legend-swatch" style={{ backgroundColor: color }} />
            <span>{label}</span>
          </span>
        ))}
      </div>
    );
  };

  eventDidMount = (args: EventMountArg) => {
    const item = args.event.extendedProps.item as SummitCalendarItem | undefined;
    if (item?.color) {
      args.el.style.backgroundColor = item.color;
      args.el.style.borderColor = item.color;
    }
  };

  handleEventClick = (args: EventClickArg) => {
    this.setState({ editorIsLoading: true, isEditorOpen: true });
    this.getActivity(args.event.id);
  };

  handleDateSelect = (args: DateSelectArg) => {
    if (args.allDay) {
      this.newActivity(moment(args.start).hour(19).minute(0).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), moment(args.start).hour(21).minute(0).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
      return;
    }

    this.newActivity(moment(args.start).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), moment(args.end).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
  };

  closeEditor = () => {
    clearSummitCalendarEditorDraft();
    this.setState({
      isEditorOpen: false,
      editorIsLoading: false,
      editorValidationErrors: {},
      editorSoftConflictWarnings: [],
      activity: { start_datetime: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), end_datetime: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ") },
    });
  };

  getActivity = async (id: string) => {
    const activity = await fetchActivity(id);
    if (activity) {
      activity.start_datetime = moment(activity.start_datetime).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      activity.end_datetime = moment(activity.end_datetime).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      this.setState({ activity: activity, editorIsLoading: false, isEditorOpen: true, editorValidationErrors: {}, editorSoftConflictWarnings: [] }, () => {
        this.focusTitleInput();
        this.setSoftConflictWarnings(activity);
      });
    } else this.newActivity(moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
  };

  newActivity = async (startDate: string, endDate: string) => {
    const activity = {
      ...this.buildEditorDefaults(startDate, endDate),
      ...(loadSummitCalendarEditorDraft() ?? {}),
      start_datetime: moment(startDate).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      end_datetime: moment(endDate).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    } as TerrainEvent;
    this.setState({ activity: activity, editorIsLoading: false, isEditorOpen: true, editorValidationErrors: {}, editorSoftConflictWarnings: [] }, () => {
      this.focusTitleInput();
      this.setSoftConflictWarnings(activity);
    });
  };

  challangeAreas = [
    { text: "Not Applicable", value: "not_applicable" },
    { text: "Community", value: "community" },
    { text: "Outdoors", value: "outdoors" },
    { text: "Creative", value: "creative" },
    { text: "Personal Growth", value: "personal_growth" },
  ];

  scoutMethodOptions = [
    { text: "Symbolic Framework", value: "symbolic_framework" },
    { text: "Community Involvement", value: "community_involvement" },
    { text: "Learning by Doing", value: "learn_by_doing" },
    { text: "Nature and Outdoors", value: "nature_and_outdoors" },
    { text: "Patrol System", value: "patrol_system" },
    { text: "Youth Lead Adult Support", value: "youth_leading_adult_supporting" },
    { text: "Promise & Law", value: "promise_and_law" },
    { text: "Personal Progression", value: "personal_progression" },
  ];

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    this.setState(
      (prevState) => ({
        activity: {
          ...prevState.activity,
          [name]: value,
        },
      }),
      () => {
        this.clearValidationErrorsFor([name]);
        this.persistEditorDraft(this.state.activity);
      },
    );
  };

  handleDateTimeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const isDateField = name.endsWith("_date");
    const isTimeField = name.endsWith("_time");
    const targetField: "start_datetime" | "end_datetime" | null = name.startsWith("start_") ? "start_datetime" : name.startsWith("end_") ? "end_datetime" : null;

    if (!targetField || (!isDateField && !isTimeField)) {
      return;
    }

    this.setState(
      (prevState) => {
        const previousDateTime = prevState.activity[targetField];
        const previousMoment = moment.parseZone(previousDateTime, moment.ISO_8601, true);

        if (!previousMoment.isValid()) {
          return {
            activity: {
              ...prevState.activity,
              [targetField]: previousDateTime,
            },
          };
        }

        let nextDate = previousMoment.format("YYYY-MM-DD");
        let nextTime = previousMoment.format("HH:mm");

        if (isDateField) {
          const parsedDate = moment(value, "YYYY-MM-DD", true);
          if (!parsedDate.isValid()) {
            return {
              activity: {
                ...prevState.activity,
                [targetField]: previousDateTime,
              },
            };
          }
          nextDate = parsedDate.format("YYYY-MM-DD");
        }

        if (isTimeField) {
          const parsedTime = moment(value, "HH:mm", true);
          if (!parsedTime.isValid()) {
            return {
              activity: {
                ...prevState.activity,
                [targetField]: previousDateTime,
              },
            };
          }
          nextTime = parsedTime.format("HH:mm");
        }

        return {
          activity: {
            ...prevState.activity,
            [targetField]: `${nextDate}T${nextTime}:00${previousMoment.format("Z")}`,
          },
        };
      },
      () => {
        this.clearValidationErrorsFor(["date_range"]);
        this.persistEditorDraft(this.state.activity);
        this.setSoftConflictWarnings(this.state.activity);
      },
    );
  };

  handleSelectChange = (event: { element: { id: string }; value: string | string[] }) => {
    switch (event.element.id) {
      case "challenge_area":
        this.setState(
          (prevState) => ({
            activity: {
              ...prevState.activity,
              challenge_area: event.value ? event.value.toString().toLowerCase().replace(" ", "_") : "",
            },
          }),
          () => {
            this.clearValidationErrorsFor(["challenge_area"]);
            this.persistEditorDraft(this.state.activity);
          },
        );
        break;
      default:
        this.setState(
          (prevState) => ({
            activity: {
              ...prevState.activity,
              [event.element.id]: event.value,
            },
          }),
          () => {
            this.persistEditorDraft(this.state.activity);
          },
        );
        break;
    }
  };

  handleGroupedMultiSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(event.target.selectedOptions).map((option) => option.value);
    const fieldId = event.target.id;

    this.setState(
      (prevState) => ({
        activity: applyGroupedMultiSelectChange(prevState.activity, fieldId, selectedValues, this.state.unitMembers),
      }),
      () => {
        this.clearValidationErrorsFor([fieldId]);
        this.persistEditorDraft(this.state.activity);
      },
    );
  };

  getScoutMethodGroups = (): GroupedMultiSelectGroup[] => {
    const programDesignValues = ["symbolic_framework", "community_involvement", "learn_by_doing", "nature_and_outdoors"];
    const leadershipValues = ["patrol_system", "youth_leading_adult_supporting", "promise_and_law", "personal_progression"];

    return [
      {
        label: "Program Design",
        options: this.scoutMethodOptions.filter((option) => programDesignValues.includes(option.value)).map((option) => ({ label: option.text, value: option.value })),
      },
      {
        label: "Leadership and Values",
        options: this.scoutMethodOptions.filter((option) => leadershipValues.includes(option.value)).map((option) => ({ label: option.text, value: option.value })),
      },
    ];
  };

  getCalendarGroups = (): GroupedMultiSelectGroup[] => {
    const ownCalendars = this.state.calendars.own_calendars ?? [];
    const otherCalendars = this.state.calendars.other_calendars ?? [];

    return [
      {
        label: "My Calendars",
        options: ownCalendars.map((calendar) => ({ label: calendar.title, value: calendar.id })),
      },
      {
        label: "Other Calendars",
        options: otherCalendars.map((calendar) => ({ label: calendar.title, value: calendar.id })),
      },
    ];
  };

  renderGroupedMultiSelect = (id: string, groups: GroupedMultiSelectGroup[], value: string[], disabled: boolean = false) => {
    const optionCount = groups.reduce((count, group) => count + group.options.length, 0);

    return (
      <select id={id} name={id} multiple={true} value={value} onChange={this.handleGroupedMultiSelectChange} disabled={disabled} className="summit-form-input" size={Math.min(Math.max(optionCount, 4), 10)}>
        {groups.map((group) => (
          <optgroup key={`${id}-${group.label}`} label={group.label}>
            {group.options.map((option) => (
              <option key={`${id}-${group.label}-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  };

  editorHeaderTemplate = () => {
    if (!this.state.activity?.id) return "New Event";
    else return this.state.activity?.title ?? "Event";
  };
  handleFocus = (e: FocusEvent) => {
    // Get the id of the relatedTarget
    const relatedTargetId = e.relatedTarget?.id;

    // List of ids of other date and time pickers
    const otherPickerIds = ["start_time", "end_date", "end_time"];

    // If the relatedTarget is one of the other pickers, stop the event propagation
    if (relatedTargetId && otherPickerIds.includes(relatedTargetId)) {
      e.stopPropagation();
    }
  };
  editorTemplate = () => {
    const { activity, currentUnitID, editorValidationErrors, editorSoftConflictWarnings } = this.state;
    const memberGroups = buildGroupedMemberOptions(this.state.unitMembers);
    const scoutMethodGroups = this.getScoutMethodGroups();
    const isEditable = (activity?.status !== "concluded" && currentUnitID === activity?.owner_id) || (activity && activity.id === undefined);
    const requiredMarker = (
      <span className="editor-field-required" aria-hidden="true">
        *
      </span>
    );
    return (
      <div className="editor-container" data-editor-layout="compact">
        <div className="editor-field" data-editor-field="title">
          <label className="editor-field-label" htmlFor="title">
            Title {requiredMarker}
          </label>
          <div className="editor-field-control">
            <input id="title" className="summit-form-input" type="text" name="title" value={activity?.title || ""} onChange={this.handleInputChange} disabled={!isEditable} data-msg-containerid="titleError" data-editor-default="title" />
          </div>
          <div id="titleError" className="editor-field-status" data-editor-validation="title" role="status">
            {editorValidationErrors.title ?? ""}
          </div>
        </div>
        <div className="editor-field" data-editor-field="location">
          <label className="editor-field-label" htmlFor="location">
            Location {requiredMarker}
          </label>
          <div className="editor-field-control">
            <input id="location" className="summit-form-input" type="text" name="location" value={activity?.location || ""} onChange={this.handleInputChange} disabled={!isEditable} data-editor-default="location" />
          </div>
          <div className="editor-field-status" data-editor-validation="location" role="status">
            {editorValidationErrors.location ?? ""}
          </div>
        </div>
        <div className="editor-field" data-editor-field="challenge_area">
          <label className="editor-field-label" htmlFor="challenge_area">
            Challenge Area {requiredMarker}
          </label>
          <div className="editor-field-control">
            <DropDownListComponent
              id="challenge_area"
              name="challenge_area"
              dataSource={this.challangeAreas}
              value={this.state.activity?.challenge_area}
              text={this.challangeAreas.find((c) => c.value == this.state.activity?.challenge_area)?.text}
              change={this.handleSelectChange}
              enabled={isEditable}
            />
          </div>
          <div id="caError" className="editor-field-status" data-editor-validation="challenge_area" role="status">
            {editorValidationErrors.challenge_area ?? ""}
          </div>
        </div>
        <div className="editor-field" data-editor-field="date_range">
          <div className="editor-field-control">
            <div className="editor-date-time-grid">
              <div className="editor-date-time-group" data-editor-date-time-group="start">
                <label className="editor-date-time-label" htmlFor="start_date">
                  Start {requiredMarker}
                </label>
                <div className="editor-date-time-inputs">
                  <DatePickerComponent
                    id="start_date"
                    value={new Date(activity?.start_datetime || new Date())}
                    format="dd/MM/yy"
                    onChange={this.handleDateTimeChange}
                    name="start_date"
                    disabled={!isEditable}
                    showClearButton={false}
                    onFocus={this.handleFocus}
                  />
                  <TimePickerComponent id="start_time" value={new Date(activity?.start_datetime || new Date())} format="hh:mm a" onChange={this.handleDateTimeChange} name="start_time" disabled={!isEditable} showClearButton={false} />
                </div>
              </div>
              <div className="editor-date-time-group" data-editor-date-time-group="end">
                <label className="editor-date-time-label" htmlFor="end_date">
                  End {requiredMarker}
                </label>
                <div className="editor-date-time-inputs">
                  <DatePickerComponent id="end_date" value={new Date(activity?.end_datetime || new Date())} format="dd/MM/yy" onChange={this.handleDateTimeChange} name="end_date" disabled={!isEditable} showClearButton={false} />
                  <TimePickerComponent id="end_time" value={new Date(activity?.end_datetime || new Date())} format="hh:mm a" onChange={this.handleDateTimeChange} name="end_time" disabled={!isEditable} showClearButton={false} />
                </div>
              </div>
            </div>
          </div>
          <div className="editor-field-status" data-editor-validation="date_range" role="status">
            {editorValidationErrors.date_range ?? ""}
          </div>
          <div className="editor-field-help" data-editor-warning="event-conflicts" role="status">
            {editorSoftConflictWarnings.length > 0 && <div>Potential conflict:</div>}
            {editorSoftConflictWarnings.map((warning, index) => (
              <div key={`editor-soft-conflict-warning-${index}`}>{warning}</div>
            ))}
          </div>
        </div>
        <div className="editor-field" data-editor-field="scout_method_elements">
          <label className="editor-field-label" htmlFor="scout_method_elements">
            Scout Method {requiredMarker}
          </label>
          <div className="editor-field-control">
            {isEditable ? (
              this.renderGroupedMultiSelect("scout_method_elements", scoutMethodGroups, this.state.activity?.review?.scout_method_elements ?? [], !isEditable)
            ) : (
              <input
                id="scout_method_elements"
                className="summit-form-input"
                value={activity?.review?.scout_method_elements
                  .map((sm) => {
                    return this.scoutMethodOptions.find((smo) => smo.value == sm)?.text;
                  })
                  ?.join(", ")}
                disabled={true}
              />
            )}
          </div>
          <div className="editor-field-status" />
        </div>
        <div className="editor-field" data-editor-field="organisers">
          <label className="editor-field-label" htmlFor="organisers">
            Organisers {requiredMarker}
          </label>
          <div className="editor-field-control">
            {isEditable ? (
              this.renderGroupedMultiSelect(
                "organisers",
                memberGroups,
                this.state.activity?.organisers?.map((i) => {
                  return typeof i === "object" ? i.id : "";
                }) ?? [],
                !isEditable,
              )
            ) : (
              <input id="organisers" className="summit-form-input" type="text" name="organisers" value={activity?.organisers?.map((i) => i.first_name + " " + i.last_name).join(", ")} disabled={true} />
            )}
          </div>
          <div className="editor-field-status" />
        </div>
        <div className="editor-field" data-editor-field="leader_members">
          <label className="editor-field-label" htmlFor="leader_members">
            Leads
          </label>
          <div className="editor-field-control">
            {isEditable ? (
              this.renderGroupedMultiSelect(
                "leader_members",
                memberGroups,
                this.state.activity?.attendance?.leader_members?.map((i) => {
                  return typeof i === "object" ? i.id : "";
                }) ?? [],
                !isEditable,
              )
            ) : (
              <input id="leader_members" className="summit-form-input" type="text" name="leads" value={activity?.attendance?.leader_members?.map((i) => i.first_name + " " + i.last_name).join(", ")} disabled={true} />
            )}
          </div>
          <div className="editor-field-status" />
        </div>
        <div className="editor-field" data-editor-field="assistant_members">
          <label className="editor-field-label" htmlFor="assistant_members">
            Assists
          </label>
          <div className="editor-field-control">
            {this.renderGroupedMultiSelect(
              "assistant_members",
              memberGroups,
              this.state.activity?.attendance?.assistant_members?.map((i) => {
                return i?.id ?? "";
              }) ?? [],
              !isEditable,
            )}
          </div>
          <div className="editor-field-status" />
        </div>
      </div>
    );
  };

  saveActivity = async (nextWeek?: boolean) => {
    const { activity } = this.state;
    if (!activity) return;
    console.log(activity);
    const validationResult = validateSummitCalendarActivity(activity);
    if (!validationResult.isValid) {
      this.setEditorValidationErrors(validationResult.errors);
      return;
    }

    this.setEditorValidationErrors({});
    const softConflictWarnings = detectSummitCalendarSoftConflicts(activity, this.state.items);
    this.setState({ editorSoftConflictWarnings: softConflictWarnings });

    const eventToSave = new TerrainEventItem(activity);
    if (eventToSave.id) {
      await updateEvent(eventToSave.id, JSON.stringify(eventToSave));
      clearSummitCalendarEditorDraft();
      this.setState({ isEditorOpen: false });
      this.fetchData();
    }
    if (!eventToSave.id) {
      await createNewEvent(JSON.stringify(eventToSave));
      clearSummitCalendarEditorDraft();
      this.setState({ isEditorOpen: false });
      this.fetchData();
    }
    if (nextWeek) {
      setTimeout(() => {
        const newStartDatetime = moment(eventToSave.start_datetime).add(7, "days").utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        const newEndDatetime = moment(eventToSave.end_datetime).add(7, "days").utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        this.newActivity(newStartDatetime, newEndDatetime);
      }, 1000);
    }
  };

  openTerrainDialog = async () => {
    if (!this.state.activity?.id) {
      return;
    }

    const event = await fetchActivity(this.state.activity.id);
    window.$nuxt.$accessor.programming.setActivity(event);
    window.$nuxt.$accessor.programming.setActivityFlow("view");
    this.setState({ hideDialog: false });
    $("#eventFrame").attr("src", "https://terrain.scouts.com.au/programming/view-activity");
    $("#eventFrame").on("load", function () {
      const iframeHead = $(this).contents().find("head");
      const css =
        '<style type="text/css">' +
        `
      #freshworks-container, header, nav, footer {
        visibility: hidden; display: none;
      }
      main {
        padding: 0 !important;
      }
      .v-application .v-main__wrap .container {
        margin: 0 !important;
        max-width: 100% !important;
        padding: 0 !important;
    }
      ` +
        "</style>";
      $(iframeHead).append(css);
    });
  };

  editorFooterTemplate = () => {
    const { activity } = this.state;
    const isEditable = (activity?.status !== "concluded" && TerrainState.getUnitID() === activity?.owner_id) || (activity && activity.id === undefined);
    return isEditable ? (
      <div id="event-footer" className="calendar-editor-footer">
        <div id="right-button" className="calendar-editor-actions">
          {!activity?.id ? (
            <button id="Save" className="summit-button summit-button-primary" data-editor-action="save-next-week" onClick={() => this.saveActivity(true)}>
              Save & Add Next Week
            </button>
          ) : (
            <button
              id="Delete"
              className="summit-button summit-button-danger"
              data-editor-action="delete"
              onClick={() => {
                const dialogObj = DialogUtility.confirm({
                  title: "Delete Item",
                  content: "Are you sure you want to permanently delete this item?",
                  width: "300px",
                  okButton: {
                    click: () => {
                      deleteEvent(this.state.activity?.id || "").then(() => {
                        dialogObj.hide();
                        this.setState({ isEditorOpen: false });
                        this.fetchData();
                      });
                    },
                  },
                  cancelButton: {
                    click: () => {
                      dialogObj.hide();
                    },
                  },
                });
              }}
            >
              Delete
            </button>
          )}
          {!!activity?.id && (
            <button id="open-modal" className="summit-button summit-button-secondary" data-editor-action="open-terrain" onClick={this.openTerrainDialog}>
              Open in Terrain
            </button>
          )}
          <button id="Save" className="summit-button summit-button-primary" data-editor-action="save" onClick={() => this.saveActivity()}>
            Save
          </button>
          <button id="Cancel" className="summit-button summit-button-secondary" data-editor-action="cancel" onClick={this.closeEditor}>
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div id="event-footer" className="calendar-editor-footer">
        <div id="right-button" className="calendar-editor-actions">
          {!!activity?.id && (
            <button id="open-modal" className="summit-button summit-button-secondary" data-editor-action="open-terrain" onClick={this.openTerrainDialog}>
              Open in Terrain
            </button>
          )}
          <button id="Cancel" className="summit-button summit-button-secondary" data-editor-action="cancel" onClick={this.closeEditor}>
            Close
          </button>
        </div>
      </div>
    );
  };

  dialogButtons = [
    {
      click: () => {
        this.setState({ hideDialog: true });
      },
      buttonModel: { content: "Close Event", isPrimary: true, cssClass: "summit-button summit-button-primary" },
    },
  ];

  handleCalendarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCalendars = Array.from(event.target.selectedOptions).map((option) => option.value);
    const calendarUpdate = { ...this.state.calendars };
    if (!calendarUpdate.own_calendars) return;
    calendarUpdate.own_calendars = calendarUpdate.own_calendars.map((calendar) => {
      return { ...calendar, selected: selectedCalendars.includes(calendar.id) };
    });
    calendarUpdate.other_calendars = calendarUpdate.other_calendars?.map((calendar) => {
      return { ...calendar, selected: selectedCalendars.includes(calendar.id) };
    });
    const allCalendars = this.state.allCalendars.map((c) => ({ ...c, selected: selectedCalendars.includes(c.id) }));
    this.setState({ calendars: calendarUpdate, allCalendars }, () => {
      updateMemberCalendars(JSON.stringify(calendarUpdate)).then(() => {
        this.fetchData();
      });
    });
  };

  render(): React.ReactNode {
    const isCalendarLoading = this.state.calendarLoadState === "loading";
    const isCalendarEmpty = this.state.calendarLoadState === "empty";
    const hasCalendarError = this.state.calendarLoadState === "error";
    const isListView = this.state.currentCalendarView.startsWith("list");

    const allEvents = this.state.items.map((item) => ({
      id: item.Id,
      title: item.Subject,
      start: item.StartTime,
      end: item.EndTime,
      backgroundColor: item.color,
      borderColor: item.color,
      extendedProps: {
        item,
      },
    }));

    const listRangeStartDate = moment(this.state.agendaRangeStart, "YYYY-MM-DD", true);
    const listRangeEndDate = moment(this.state.agendaRangeEnd, "YYYY-MM-DD", true);

    const filteredItems = this.state.items;
    const events = allEvents;

    return (
      <div id="scheduler" style={{ width: "100%", height: "100%" }} onKeyDown={this.handleSchedulerKeyDown} tabIndex={0} data-calendar-shortcuts="new-event">
        <div id="calendar-ux-contract" data-calendar-load-state={this.state.calendarLoadState} data-calendar-load-error={this.state.calendarLoadError ?? ""} hidden={true}>
          <span id="calendar-loading-state" data-active={String(isCalendarLoading)} />
          <span id="calendar-empty-state" data-active={String(isCalendarEmpty)} />
          <span id="calendar-error-state" data-active={String(hasCalendarError)} />
        </div>
        <div className="calendar-ux-toolbar">
          {isListView && (
            <div className="calendar-agenda-range-controls" data-calendar-range-controls="visible">
              <span id="list-range-label" className="calendar-agenda-range-label">List range:</span>
              <DatePicker
                selected={listRangeStartDate.isValid() ? listRangeStartDate.toDate() : null}
                onChange={(dates) => this.handleListRangePickerChange(dates as [Date | null, Date | null])}
                startDate={listRangeStartDate.isValid() ? listRangeStartDate.toDate() : null}
                endDate={listRangeEndDate.isValid() ? listRangeEndDate.toDate() : null}
                selectsRange={true}
                dateFormat="dd/MM/yyyy"
                className="summit-form-input"
                placeholderText="Select date range"
                ariaLabelledBy="list-range-label"
              />
              <div className="calendar-agenda-presets" role="group" aria-label="List quick select">
                <button
                  type="button"
                  className={`summit-button summit-button-secondary ${this.state.agendaRangePreset === "week" ? "calendar-agenda-preset-active" : ""}`}
                  onClick={() => this.handleAgendaPresetSelect("week")}
                >
                  Week
                </button>
                <button
                  type="button"
                  className={`summit-button summit-button-secondary ${this.state.agendaRangePreset === "month" ? "calendar-agenda-preset-active" : ""}`}
                  onClick={() => this.handleAgendaPresetSelect("month")}
                >
                  Month
                </button>
                <button
                  type="button"
                  className={`summit-button summit-button-secondary ${this.state.agendaRangePreset === "year" ? "calendar-agenda-preset-active" : ""}`}
                  onClick={() => this.handleAgendaPresetSelect("year")}
                >
                  Year
                </button>
              </div>
            </div>
          )}
          {this.renderCalendarLegend(filteredItems)}
        </div>
        <FullCalendar
          ref={this.calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          // Legacy contract marker: initialView="dayGridMonth"
          initialView={this.state.currentCalendarView}
          views={{
            listRange: { type: "list", buttonText: "Agenda" },
          }}
          buttonText={{
            dayGridMonth: "Month",
            timeGridWeek: "Week",
            timeGridDay: "Day",
            listWeek: "List",
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={events}
          selectable={true}
          select={this.handleDateSelect}
          eventClick={this.handleEventClick}
          datesSet={this.handleDatesSet}
          eventDidMount={this.eventDidMount}
          locale={enAuLocale}
          height={"auto"}
        />
        <DialogComponent
          id="calendar-editor-dialog"
          isModal={true}
          visible={this.state.isEditorOpen}
          header={this.editorHeaderTemplate()}
          close={this.closeEditor}
          closeOnEscape={true}
          showCloseIcon={true}
          footer={!this.state.editorIsLoading ? this.editorFooterTemplate() : undefined}
        >
          <div
            data-editor-speed-contract="calendar-editor-speed"
            data-editor-open-proxy={String(this.state.isEditorOpen)}
            data-editor-loading-proxy={String(this.state.editorIsLoading)}
            data-editor-shortcuts="enabled"
            onKeyDown={this.handleEditorKeyDown}
            tabIndex={0}
          >
            {this.state.editorIsLoading ? <div>Loading event...</div> : this.editorTemplate()}
          </div>
        </DialogComponent>
        <div className="calendar-selector-panel">
          <label htmlFor="calendarSelector">Select Calendars</label>
          <select id="calendarSelector" name="calendarSelector" multiple={true} value={this.state.allCalendars.filter((c) => c.selected).map((c) => c.id)} onChange={this.handleCalendarChange} className="summit-form-input" size={8}>
            {this.getCalendarGroups().map((group) => (
              <optgroup key={`calendar-${group.label}`} label={group.label}>
                {group.options.map((option) => (
                  <option key={`calendar-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <DialogComponent
          id="dialog"
          isModal={true}
          visible={!this.state.hideDialog}
          header="View Event"
          target="#scheduler"
          animationSettings={{ effect: "None" }}
          close={() => {
            $("#eventFrame").attr("src", "about:blank");
            this.setState({ hideDialog: true });
            this.fetchData();
          }}
          closeOnEscape={true}
          showCloseIcon={true}
          cssClass="summit-dialog-max-size"
          buttons={this.dialogButtons}
        >
          <iframe id="eventFrame" src="about:blank" title="Modal Content" style={{ width: "100%", height: "100%" }} />
        </DialogComponent>
      </div>
    ) as React.ReactNode;
  }
}
