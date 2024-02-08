import React from "react";
import { Inject, EventSettingsModel, ScheduleComponent, ActionEventArgs, EventRenderedArgs, ViewsDirective, ViewDirective, PopupOpenEventArgs } from "@syncfusion/ej2-react-schedule";
import SummitCalendarItem from "../models/SummitCalendarItems";
import { Agenda, Month, Week } from "@syncfusion/ej2-react-schedule";
import { fetchActivity, fetchMemberEvents } from "@/services";
import moment from "moment";
import { TerrainEvent } from "@/types/terrainTypes";
import { DropDownListComponent, MultiSelectComponent } from "@syncfusion/ej2-react-dropdowns";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";
import { MultiSelect } from "@syncfusion/ej2-dropdowns";

interface SummitCalendarProps {
  onUpdate: (items: SummitCalendarItem[]) => void;
}

interface SummitCalendarState {
  items: SummitCalendarItem[];
  sortState: { sortColumn: string; sortDirection: string };
  activity: TerrainEvent | null;
  editorIsLoading: boolean;
}

export class SummitCalendarComponent extends React.Component<SummitCalendarProps, SummitCalendarState> {
  private scheduleComponent: React.RefObject<ScheduleComponent> = React.createRef();

  constructor(props: SummitCalendarProps) {
    super(props);
    this.state = {
      items: [],
      sortState: { sortColumn: "file", sortDirection: "ascending" },
      activity: null,
      editorIsLoading: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
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

  editorFooterTemplate = () => {
    return (
      <div id="event-footer">
        <div id="right-button">
          <button id="Save" className="e-control e-btn e-primary" data-ripple="true">
            Save
          </button>
          <button id="Cancel" className="e-control e-btn e-secondary" data-ripple="true" onClick={() => this.scheduleComponent.current?.closeEditor()}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  componentDidUpdate() {
    if (this.state.editorIsLoading && this.state.activity !== null) {
      this.setState({ editorIsLoading: false });
    }
  }

  eventRendered = (args: EventRenderedArgs) => {
    const data = args.data as SummitCalendarItem;
    args.element.style.backgroundColor = data.color ?? "";
  };

  getActivity = async (id: string) => {
    const activity = (await fetchActivity(id)) || null;
    this.setState({ activity: activity, editorIsLoading: false }, () => {
      if (this.scheduleComponent.current && this.state.activity) {
        this.scheduleComponent.current.openEditor(this.state.activity, "Add", false);
      }
    });
  };

  onPopupOpen = (args: PopupOpenEventArgs) => {
    console.log(args);
    if (args.type === "Editor" && args.data) {
      if (args.target) args.cancel = true;
      this.setState({ editorIsLoading: true });
      const eventId = args.data.Id;
      this.getActivity(eventId);
    }
  };

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState((prevState) => ({
      activity: {
        ...prevState.activity,
        [event.target.name]: event.target.value,
      },
    }));
  };

  challangeAreas = [
    { text: "Community", value: "community" },
    { text: "Outdoor", value: "outdoors" },
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

  editorTemplate = (props: SummitCalendarItem) => {
    const { activity } = this.state;
    const isEditable = activity?.status !== "concluded";
    return props !== undefined ? (
      <div className="editor-container">
        <label>
          Title
          <input className="e-input" type="text" name="title" value={activity?.title || ""} onChange={this.handleInputChange} disabled={!isEditable} />
        </label>
        <label>
          Location
          <input className="e-input" type="text" name="location" value={activity?.location || ""} onChange={this.handleInputChange} disabled={!isEditable} />
        </label>
        <label>
          Challenge Area
          <DropDownListComponent dataSource={this.challangeAreas} value={this.state.activity?.challenge_area} onChange={this.handleInputChange} bind={this} />
        </label>
        <label>
          Start & End
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <DateTimePickerComponent value={new Date(activity?.start_datetime || "")} onChange={this.handleInputChange} name="start_time" disabled={!isEditable} />
            <DateTimePickerComponent value={new Date(activity?.end_datetime || "")} onChange={this.handleInputChange} name="end_time" disabled={!isEditable} />
          </div>
        </label>
        <label>
          Scout Method
          <MultiSelectComponent dataSource={this.scoutMethodOptions} value={this.state.activity?.review?.scout_method_elements} onChange={this.handleInputChange} mode="CheckBox" showDropDownIcon={true} disabled={!isEditable} />
        </label>
      </div>
    ) : (
      ""
    );
  };

  render(): React.ReactNode {
    const eventSettings: EventSettingsModel = { dataSource: this.state.items };

    return (
      <ScheduleComponent
        currentView="Month"
        ref={this.scheduleComponent}
        eventSettings={eventSettings}
        actionComplete={this.handleActionComplete}
        eventRendered={this.eventRendered}
        editorTemplate={this.editorTemplate}
        editorFooterTemplate={this.editorFooterTemplate}
        popupOpen={this.onPopupOpen}
      >
        <ViewsDirective>
          <ViewDirective option="Week" />
          <ViewDirective option="Month" />
          <ViewDirective option="Agenda" />
        </ViewsDirective>
        <Inject services={[Week, Month, Agenda]} />
      </ScheduleComponent>
    ) as React.ReactNode;
  }
}
