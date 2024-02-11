import React from "react";
import { Inject, EventSettingsModel, ScheduleComponent, ActionEventArgs, EventRenderedArgs, ViewsDirective, ViewDirective, PopupOpenEventArgs } from "@syncfusion/ej2-react-schedule";
import SummitCalendarItem from "../models/SummitCalendarItems";
import { Agenda, Month, Week } from "@syncfusion/ej2-react-schedule";
import { createNewEvent, deleteEvent, fetchActivity, fetchMemberEvents, updateEvent } from "@/services";
import moment from "moment";
import { TerrainEvent, TerrainEventSummary } from "@/types/terrainTypes";
import { DropDownListComponent, DropDownTreeComponent } from "@syncfusion/ej2-react-dropdowns";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";
import { TerrainState } from "@/helpers";
import { FormValidator, FormValidatorModel, TextBoxComponent } from "@syncfusion/ej2-react-inputs";
import { DdtChangeEventArgs } from "@syncfusion/ej2-dropdowns";
import { enableRipple } from "@syncfusion/ej2-base";
import TerrainEventItem from "../models/TerrainEventItem";
import { DialogUtility } from "@syncfusion/ej2-popups";
//import { DialogComponent } from "@syncfusion/ej2-react-popups";

interface SummitCalendarProps {
  onUpdate: (items: SummitCalendarItem[]) => void;
}

interface SummitCalendarState {
  items: SummitCalendarItem[];
  sortState: { sortColumn: string; sortDirection: string };
  activity: TerrainEvent | null;
  editorIsLoading: boolean;
  members: { value: string; text: string }[];
  currentUnitID: string;
}

export class SummitCalendarComponent extends React.Component<SummitCalendarProps, SummitCalendarState> {
  private scheduleComponent: React.RefObject<ScheduleComponent> = React.createRef();

  constructor(props: SummitCalendarProps) {
    super(props);
    enableRipple(true);
    this.state = {
      items: [],
      sortState: { sortColumn: "file", sortDirection: "ascending" },
      activity: {},
      editorIsLoading: false,
      members: [],
      currentUnitID: TerrainState.getUnitID(),
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const members = TerrainState.getUnitMembers().map((member) => ({ value: member.id, text: member.first_name + " " + member.last_name }));
    this.setState({ members: members });

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
    const activity = (await fetchActivity(id)) || {};
    this.setState({ activity: activity, editorIsLoading: false }, () => {
      if (this.scheduleComponent.current && this.state.activity) {
        this.scheduleComponent.current.openEditor(this.state.activity, "Add", false);
      }
    });
  };

  newActivity = async (startDate: string, endDate: string) => {
    const activity = {
      start_datetime: startDate,
      end_datetime: endDate,
    };
    this.setState({ activity: activity, editorIsLoading: false }, () => {
      if (this.scheduleComponent.current && this.state.activity) {
        this.scheduleComponent.current.openEditor(this.state.activity, "Add", false);
      }
    });
  };

  onPopupOpen = (args: PopupOpenEventArgs) => {
    console.log(args);
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
      this.newActivity(args.data.startTime.toISOString(), args.data.endTime.toISOString());
    }
  };

  onPopupClosed = (args: PopupOpenEventArgs) => {
    console.log("closed");
    if (args.type === "Editor") {
      this.setState({ activity: {} });
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

  handleTreeChange = (event: DdtChangeEventArgs) => {
    switch (event.element.id) {
      case "organisers":
        this.setState((prevState) => ({
          activity: {
            ...prevState.activity,
            organisers: event.value
              ? TerrainState.getUnitMembers()
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
                ? TerrainState.getUnitMembers()
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
                ? TerrainState.getUnitMembers()
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

  editorTemplate = (props: SummitCalendarItem) => {
    console.log(props);
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
          Start & End <span style={{ color: "red" }}>*</span>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <DateTimePickerComponent id="start_datetime" value={new Date(activity?.start_datetime || "")} format="dd/MM/yy hh:mm" onChange={this.handleInputChange} name="start_datetime" disabled={!isEditable} />
            <DateTimePickerComponent id="end_datetime" value={new Date(activity?.end_datetime || "")} format="dd/MM/yy hh:mm" name="end_datetime" disabled={!isEditable} openOnFocus />
          </div>
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
                return i?.id ?? "";
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
                return i?.id ?? "";
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
    if (nextWeek) {
      this.scheduleComponent.current?.closeEditor();
    }
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
        start_datetime: { required: true },
        end_datetime: { required: true },
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
                  title: "Delete Multiple Items",
                  content: "Are you sure you want to permanently delete these items?",
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

                  const newStartDatetime = moment(start_datetime).add(7, "days").toISOString();
                  const newEndDatetime = moment(end_datetime).add(7, "days").toISOString();

                  this.newActivity(newStartDatetime, newEndDatetime);
                }}
              >
                Add Next Week
              </button>
            )}
          </div>
        </div>
      );
    }
  };

  render(): React.ReactNode {
    const eventSettings: EventSettingsModel = { dataSource: this.state.items };
    return (
      <div id="scheduler">
        <ScheduleComponent
          width="100%"
          height="500px"
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
            <ViewDirective option="Week" />
            <ViewDirective option="Month" />
            <ViewDirective option="Agenda" />
          </ViewsDirective>
          <Inject services={[Week, Month, Agenda]} />
        </ScheduleComponent>
        {/* <DialogComponent width="250px" isModal={true} target="#scheduler" visible={this.state.hideDialog} close={this.dialogClose} overlayClick={this.onOverlayClick}>
          This is a modal Dialog{" "}
        </DialogComponent> */}
      </div>
    ) as React.ReactNode;
  }
}
