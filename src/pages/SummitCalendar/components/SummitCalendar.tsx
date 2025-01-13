import React, { FocusEvent } from "react";
import { Agenda, Month, Week, Inject, EventSettingsModel, ScheduleComponent, ActionEventArgs, EventRenderedArgs, ViewsDirective, ViewDirective, PopupOpenEventArgs } from "@syncfusion/ej2-react-schedule";
import SummitCalendarItem from "../models/SummitCalendarItems";
import { createNewEvent, deleteEvent, fetchActivity, fetchMemberCalendars, fetchMemberEvents, fetchUnitMembers, updateEvent, updateMemberCalendars } from "@/services";
import moment from "moment";
import { TerrainEvent, TerrainEventSummary, TerrainUnitMember, TerrrainCalendarResult } from "@/types/terrainTypes";
import { DdtChangeEventArgs, DropDownListComponent, DropDownTreeComponent } from "@syncfusion/ej2-react-dropdowns";
import { DatePickerComponent, TimePickerComponent } from "@syncfusion/ej2-react-calendars";
import { TerrainState } from "@/helpers";
import { FormValidator, FormValidatorModel, TextBoxComponent } from "@syncfusion/ej2-react-inputs";
//import { enableRipple } from "@syncfusion/ej2-base";
import TerrainEventItem from "../models/TerrainEventItem";
import { DialogComponent, DialogUtility } from "@syncfusion/ej2-react-popups";

interface SummitCalendarProps {
  items: SummitCalendarItem[];
  onUpdate: (items: SummitCalendarItem[]) => void;
}

interface SummitCalendarState {
  items: SummitCalendarItem[];
  sortState: { sortColumn: string; sortDirection: string };
  activity: TerrainEvent;
  editorIsLoading: boolean;
  members: { value: string; text: string }[];
  currentUnitID: string;
  unitMembers: TerrainUnitMember[];
  hideDialog: boolean;
  iframeKey: number;
  calendars: TerrrainCalendarResult;
  allCalendars: { id: string; name: string; selected: boolean }[];
}

export class SummitCalendarComponent extends React.Component<SummitCalendarProps, SummitCalendarState> {
  private scheduleComponent: React.RefObject<ScheduleComponent> = React.createRef();
  private dialogInstance: DialogComponent | null = null;
  constructor(props: SummitCalendarProps) {
    super(props);
    //enableRipple(true);
    this.state = {
      items: [],
      sortState: { sortColumn: "file", sortDirection: "ascending" },
      activity: { start_datetime: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), end_datetime: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ") },
      editorIsLoading: false,
      members: [],
      currentUnitID: TerrainState.getUnitID(),
      unitMembers: [],
      hideDialog: true,
      iframeKey: 0,
      calendars: {},
      allCalendars: [],
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

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

  fetchData = async () => {
    const unitMembers = await fetchUnitMembers();
    const members = unitMembers.map((member) => ({ value: member.id, text: member.first_name + " " + member.last_name }));
    this.setState({ members: members, unitMembers: unitMembers });
    const scheduleObj = this.scheduleComponent.current;
    const viewDates = scheduleObj?.getCurrentViewDates();
    const startDate = moment(viewDates ? viewDates[0] : new Date()).format("YYYY-MM-DDTHH:mm:ss");
    const endDate = moment(viewDates ? viewDates[viewDates.length - 1] : new Date()).format("YYYY-MM-DDTHH:mm:ss");

    fetchMemberEvents(startDate, endDate).then((data) => {
      const items = data.map((item) => {
        return new SummitCalendarItem(item);
      });
      this.setState({
        items: items,
      });
      this.props.onUpdate(items);
    });
  };

  handleActionComplete = (args: ActionEventArgs) => {
    if (args.requestType === "viewNavigate" || args.requestType === "dateNavigate") {
      this.fetchData();
    }
  };

  eventRendered = (args: EventRenderedArgs) => {
    const data = args.data as SummitCalendarItem;
    args.element.style.backgroundColor = data.color ?? "";
  };

  getActivity = async (id: string) => {
    const activity = await fetchActivity(id);
    if (activity) {
      activity.start_datetime = moment(activity.start_datetime).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      activity.end_datetime = moment(activity.end_datetime).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      this.setState({ activity: activity, editorIsLoading: false }, () => {
        if (this.scheduleComponent.current && this.state.activity) {
          this.scheduleComponent.current.openEditor(this.state.activity, "Add", false);
        }
      });
    } else this.newActivity(moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
  };

  newActivity = async (startDate: string, endDate: string) => {
    moment(this.state.activity?.start_datetime).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    const activity = {
      start_datetime: moment(startDate).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      end_datetime: moment(endDate).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    };
    this.setState({ activity: activity, editorIsLoading: false }, () => {
      if (this.scheduleComponent.current && this.state.activity) {
        this.scheduleComponent.current.openEditor(this.state.activity, "Add", false);
      }
    });
  };

  onPopupOpen = (args: PopupOpenEventArgs) => {
    if (args.type === "Editor" && args.data) {
      if (args.target) {
        args.cancel = true;
        this.setState({ editorIsLoading: true });
        const eventId = args.data.Id;
        this.getActivity(eventId);
      }
    }
    if (args.type === "QuickInfo" && args.data && !args.data.Id) {
      args.cancel = true;
      if (args.data.isAllDay) {
        this.newActivity(moment(args.data.startTime).hour(19).minute(0).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), moment(args.data.startTime).hour(21).minute(0).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
      } else this.newActivity(args.data.startTime.utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), args.data.endTime.utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
    }
  };

  onPopupClosed = (args: PopupOpenEventArgs) => {
    if (args.type === "Editor") {
      this.setState({ activity: { start_datetime: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"), end_datetime: moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ") } });
    }
  };

  challangeAreas = [
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
    this.setState((prevState) => ({
      activity: {
        ...prevState.activity,
        [name]: value,
      },
    }));
  };

  handleDateTimeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    //if name ends with time change name to be datetime and set previous values time but not date if it ends with date change name to be datetime and update the date but not the time of the previous value
    switch (name) {
      case "start_date":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            start_datetime: moment(value).utc().format("YYYY-MM-DD") + "T" + moment(prevState.activity.start_datetime).utc().format("HH:mm:ss"),
          },
        }));
        break;
      case "start_time":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            start_datetime: moment(prevState.activity.start_datetime).utc().format("YYYY-MM-DD") + "T" + moment(value).utc().format("HH:mm:ss"),
          },
        }));
        break;
      case "end_date":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            end_datetime: moment(value).utc().format("YYYY-MM-DD") + "T" + moment(prevState.activity.end_datetime).utc().format("HH:mm:ss"),
          },
        }));
        break;
      case "end_time":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            end_datetime: moment(prevState.activity.end_datetime).utc().format("YYYY-MM-DD") + "T" + moment(value).utc().format("HH:mm:ss"),
          },
        }));
        break;
    }
  };

  handleTreeChange = (event: DdtChangeEventArgs) => {
    switch (event.element.id) {
      case "organisers":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            organisers: event.value
              ? this.state.unitMembers
                  .filter((um) => {
                    return event.value.includes(um.id);
                  })
                  .map((um) => {
                    return {
                      id: um.id,
                      first_name: um.first_name,
                      last_name: um.last_name,
                    };
                  })
              : [],
          },
        }));
        break;
      case "leader_members":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            attendance: {
              ...prevState.activity?.attendance,
              leader_members: event.value
                ? this.state.unitMembers
                    .filter((um) => {
                      return event.value.includes(um.id);
                    })
                    .map((um) => {
                      return {
                        id: um.id,
                        first_name: um.first_name,
                        last_name: um.last_name,
                      };
                    })
                : [],
            },
          },
        }));
        break;
      case "assistant_members":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            attendance: {
              ...prevState.activity?.attendance,
              assistant_members: event.value
                ? this.state.unitMembers
                    .filter((um) => {
                      return event.value.includes(um.id);
                    })
                    .map((um) => {
                      return {
                        id: um.id,
                        first_name: um.first_name,
                        last_name: um.last_name,
                      };
                    })
                : [],
            },
          },
        }));
        break;
      case "scout_method_elements":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            review: {
              ...prevState.activity?.review,
              scout_method_elements: event.value,
            },
          },
        }));
        break;
      case "challenge_area":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            challenge_area: event.value ? event.value.toString().toLowerCase().replace(" ", "_") : "",
          },
        }));
        break;
      default:
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            [event.element.id]: event.value,
          },
        }));
        break;
    }
  };

  editorHeaderTemplate = () => {
    if (!this.state.activity?.id) return <div className="e-title-text">New Event</div>;
    else return <div className="e-title-text">{this.state.activity?.title}</div>;
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
  editorTemplate = (props: SummitCalendarItem) => {
    console.log("editorTemplate Opened");
    console.log(this.state.activity);
    const { activity, members, currentUnitID } = this.state;
    const isEditable = (activity?.status !== "concluded" && currentUnitID === activity?.owner_id) || (activity && activity.id === undefined);
    return props !== undefined ? (
      <div className="editor-container">
        <label>
          Title <span style={{ color: "red" }}>*</span>
          <TextBoxComponent className="e-input" type="text" name="title" value={activity?.title || ""} onChange={this.handleInputChange} disabled={!isEditable} data-msg-containerid="titleError" />
          <div id="titleError" />
        </label>
        <label>
          Location <span style={{ color: "red" }}>*</span>
          <TextBoxComponent className="e-input" type="text" name="location" value={activity?.location || ""} onChange={this.handleInputChange} disabled={!isEditable} />
        </label>
        <label>
          Challenge Area <span style={{ color: "red" }}>*</span>
          <DropDownListComponent
            id="challenge_area"
            name="challenge_area"
            dataSource={this.challangeAreas}
            value={this.state.activity?.challenge_area}
            text={this.challangeAreas.find((c) => c.value == this.state.activity?.challenge_area)?.text}
            change={this.handleTreeChange}
            bind={this}
            enabled={isEditable}
            data-msg-containerid="titleError"
          />
          <div id="caError"></div>
        </label>
        <label>
          Start <span style={{ color: "red" }}>*</span>
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
          End <span style={{ color: "red" }}>*</span>
          <DatePickerComponent id="end_date" value={new Date(activity?.end_datetime || new Date())} format="dd/MM/yy" onChange={this.handleDateTimeChange} name="end_date" disabled={!isEditable} showClearButton={false} />
          <TimePickerComponent id="end_time" value={new Date(activity?.end_datetime || new Date())} format="hh:mm a" onChange={this.handleDateTimeChange} name="end_time" disabled={!isEditable} showClearButton={false} />
        </label>
        <label>
          Scout Method <span style={{ color: "red" }}>*</span>
          {isEditable ? (
            <DropDownTreeComponent
              name="scout_method_elements"
              showCheckBox={true}
              id="scout_method_elements"
              fields={{ dataSource: this.scoutMethodOptions, text: "text", value: "value" }}
              value={this.state.activity?.review?.scout_method_elements}
              change={this.handleTreeChange}
              enabled={isEditable}
            />
          ) : (
            <input
              className="e-input"
              value={activity?.review?.scout_method_elements
                .map((sm) => {
                  return this.scoutMethodOptions.find((smo) => smo.value == sm)?.text;
                })
                ?.join(", ")}
              disabled={true}
            />
          )}
        </label>
        <label>
          Organisers <span style={{ color: "red" }}>*</span>
          {isEditable ? (
            <DropDownTreeComponent
              showCheckBox={true}
              name="organisers"
              id="organisers"
              fields={{ dataSource: members, text: "text", value: "value" }}
              value={this.state.activity?.organisers?.map((i) => {
                return typeof i === "object" ? i.id : "";
              })}
              change={this.handleTreeChange}
              enabled={isEditable}
            />
          ) : (
            <input className="e-input" type="text" name="organisers" value={activity?.organisers?.map((i) => i.first_name + " " + i.last_name).join(", ")} disabled={true} />
          )}
        </label>
        <label>
          Leads
          {isEditable ? (
            <DropDownTreeComponent
              name="leader_members"
              showCheckBox={true}
              id="leader_members"
              fields={{ dataSource: members, text: "text", value: "value" }}
              value={this.state.activity?.attendance?.leader_members?.map((i) => {
                return typeof i === "object" ? i.id : "";
              })}
              change={this.handleTreeChange}
              enabled={isEditable}
            />
          ) : (
            <input className="e-input" type="text" name="leads" value={activity?.attendance?.leader_members?.map((i) => i.first_name + " " + i.last_name).join(", ")} disabled={true} />
          )}
        </label>
        <label>
          Assists
          <DropDownTreeComponent
            name="assistant_members"
            showCheckBox={true}
            id="assistant_members"
            fields={{ dataSource: members, text: "text", value: "value" }}
            value={this.state.activity?.attendance?.assistant_members?.map((i) => {
              return i?.id ?? "";
            })}
            change={this.handleTreeChange}
            enabled={isEditable}
          />
        </label>
      </div>
    ) : (
      ""
    );
  };

  saveActivity = async (nextWeek?: boolean) => {
    const { activity } = this.state;
    if (!activity) return;
    console.log(activity);
    const options: FormValidatorModel = {
      rules: {
        title: { required: true },
        location: { required: true },
        challenge_area: { required: true },
        scout_method_elements: { required: true },
        organisers: { required: true },
        start_date: { required: true },
        end_date: { required: true },
        start_time: { required: true },
        end_time: { required: true },
      },
    };
    const formObject = new FormValidator(".editor-container", options);
    if (!formObject.validate()) {
      return;
    }
    if (this.state.activity?.attendance?.leader_members?.some((lm) => this.state.activity?.attendance?.assistant_members?.some((am) => lm.id === am.id))) {
      alert("A member can't both be a leader and an assistant at the same time");
      return;
    }
    if (this.state.activity?.start_datetime && this.state.activity?.end_datetime && moment(this.state.activity?.start_datetime).isSameOrAfter(this.state.activity?.end_datetime)) {
      alert("Start date can't be after end date");
      return;
    }
    const eventToSave = new TerrainEventItem(activity);
    if (eventToSave.id) {
      await updateEvent(eventToSave.id, JSON.stringify(eventToSave));
      this.scheduleComponent.current?.closeEditor();
      this.fetchData();
    }
    if (!eventToSave.id) {
      await createNewEvent(JSON.stringify(eventToSave));
      this.scheduleComponent.current?.closeEditor();
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

  editorFooterTemplate = () => {
    const { activity } = this.state;
    const isEditable = (activity?.status !== "concluded" && TerrainState.getUnitID() === activity?.owner_id) || (activity && activity.id === undefined);
    return isEditable ? (
      <div id="event-footer">
        <div id="right-button">
          {!activity?.id ? (
            <button id="Save" className="e-control e-btn e-primary" data-ripple="true" onClick={() => this.saveActivity(true)}>
              Save & Add Next Week
            </button>
          ) : (
            <button
              id="Delete"
              className="e-control e-btn e-danger"
              data-ripple="true"
              onClick={() => {
                const dialogObj = DialogUtility.confirm({
                  title: "Delete Item",
                  content: "Are you sure you want to permanently delete this item?",
                  width: "300px",
                  okButton: {
                    click: () => {
                      deleteEvent(this.state.activity?.id || "").then(() => {
                        dialogObj.hide();
                        this.scheduleComponent.current?.deleteEvent(this.state.activity?.id || "");
                        this.scheduleComponent.current?.closeEditor();
                      });
                    },
                  },
                  cancelButton: {
                    click: () => {
                      dialogObj.hide();
                      this.scheduleComponent.current?.closeEditor();
                    },
                  },
                });
              }}
            >
              Delete
            </button>
          )}
          <button id="Save" className="e-control e-btn e-primary" data-ripple="true" onClick={() => this.saveActivity()}>
            Save
          </button>
          <button id="Cancel" className="e-control e-btn e-secondary" data-ripple="true" onClick={() => this.scheduleComponent.current?.closeEditor()}>
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div id="event-footer">
        <div id="right-button">
          <button id="Cancel" className="e-control e-btn e-secondary" data-ripple="true" onClick={() => this.scheduleComponent.current?.closeEditor()}>
            Close
          </button>
        </div>
      </div>
    );
  };

  quickInfoFooterTemplate = (props: { [key: string]: string | TerrainEvent }) => {
    if (props.elementType === "cell") {
      return <div>Cell Footer</div>;
    } else {
      return (
        <div className="e-cell-footer">
          <div className="right-button">
            <button
              id="edit"
              className="e-event-edit e-btn e-primary"
              title="Edit"
              onClick={() => {
                this.scheduleComponent.current?.closeQuickInfoPopup();
                this.getActivity((props.event as TerrainEventSummary).id);
              }}
            >
              {TerrainState.getUnitID() === (props.event as TerrainEventSummary).invitee_id ? "Edit" : "View"}
            </button>
            {TerrainState.getUnitID() === (props.event as TerrainEventSummary).invitee_id && (
              <button
                id="add"
                className="e-event-edit e-btn e-primary"
                title="Add"
                onClick={() => {
                  this.scheduleComponent.current?.closeQuickInfoPopup();
                  const start_datetime = (props.event as TerrainEventSummary).start_datetime;
                  const end_datetime = (props.event as TerrainEventSummary).end_datetime;

                  const newStartDatetime = moment(start_datetime).add(7, "days").utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                  const newEndDatetime = moment(end_datetime).add(7, "days").utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");

                  this.newActivity(newStartDatetime, newEndDatetime);
                }}
              >
                Add Next Week
              </button>
            )}
            <button
              id="open-modal"
              className="e-event-edit e-btn e-secondary"
              title="Open Event"
              onClick={async () => {
                this.scheduleComponent.current?.closeQuickInfoPopup();
                const event = await fetchActivity((props.event as TerrainEventSummary).id);
                window.$nuxt.$accessor.programming.setActivity(event);
                window.$nuxt.$accessor.programming.setActivityFlow("view");
                this.dialogInstance?.show(true);
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
              }}
            >
              Open in Terain
            </button>
          </div>
        </div>
      );
    }
  };

  dialogButtons = [
    {
      click: () => {
        this.dialogInstance?.hide();
      },
      buttonModel: { content: "Close Event", isPrimary: true, cssClass: "e-event-edit e-btn e-primary" },
    },
  ];

  handleCalendarChange = (event: DdtChangeEventArgs) => {
    if (!event.isInteracted) return;
    const selectedCalendars = event.value as string[];
    const calendarUpdate = this.state.calendars;
    if (!calendarUpdate.own_calendars) return;
    calendarUpdate.own_calendars = calendarUpdate.own_calendars.map((calendar) => {
      return { ...calendar, selected: selectedCalendars.includes(calendar.id) };
    });
    calendarUpdate.other_calendars = calendarUpdate.other_calendars?.map((calendar) => {
      return { ...calendar, selected: selectedCalendars.includes(calendar.id) };
    });
    updateMemberCalendars(JSON.stringify(calendarUpdate)).then(() => {
      this.fetchData();
    });
  };

  render(): React.ReactNode {
    const eventSettings: EventSettingsModel = { dataSource: this.state.items };
    return (
      <div id="scheduler" style={{ width: "100%", height: "100%" }}>
        <ScheduleComponent
          currentView="Month"
          ref={this.scheduleComponent}
          eventSettings={eventSettings}
          actionComplete={this.handleActionComplete}
          eventRendered={this.eventRendered}
          editorTemplate={this.editorTemplate}
          editorFooterTemplate={this.editorFooterTemplate}
          editorHeaderTemplate={this.editorHeaderTemplate}
          quickInfoTemplates={{ footer: this.quickInfoFooterTemplate.bind(this) }}
          popupOpen={this.onPopupOpen}
          popupClose={this.onPopupClosed}
          enableAdaptiveUI={true}
        >
          <ViewsDirective>
            <ViewDirective option="Month" />
          </ViewsDirective>
          <Inject services={[Week, Month, Agenda]} />
        </ScheduleComponent>
        Select Calendars{" "}
        <DropDownTreeComponent
          width="250"
          name="calendarSelector"
          showCheckBox={true}
          id="calendarSelector"
          fields={{ dataSource: this.state.allCalendars, text: "name", value: "id" }}
          value={this.state.allCalendars.filter((c) => c.selected).map((c) => c.id)}
          change={this.handleCalendarChange}
          showSelectAll={true}
        />
        <DialogComponent
          id="dialog"
          isModal={true}
          visible={false}
          header="View Event"
          target="#scheduler"
          animationSettings={{ effect: "None" }}
          close={() => {
            $("#eventFrame").attr("src", "about:blank");
            this.fetchData();
          }}
          closeOnEscape={true}
          showCloseIcon={true}
          ref={(dialog: DialogComponent) => (this.dialogInstance = dialog!)}
          cssClass="summit-dialog-max-size"
          buttons={this.dialogButtons}
        >
          <iframe id="eventFrame" src="about:blank" title="Modal Content" style={{ width: "100%", height: "100%" }} />
        </DialogComponent>
      </div>
    ) as React.ReactNode;
  }
}
