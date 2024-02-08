import React from "react";
import SummitCalendarItem from "../models/SummitCalendarItems";
import { TerrainEvent } from "@/types/terrainTypes";
import { fetchActivity } from "@/services";
import { LoadingSpinner } from "./LoadingSpinner";
import { ScheduleComponent } from "@syncfusion/ej2-react-schedule";

interface State {
  isLoading: boolean;
  isEditable: boolean;
  data: SummitCalendarItem;
  activity: TerrainEvent | null;
}

interface SummitCalendarPopupProps extends SummitCalendarItem {
  scheduleComponent: React.RefObject<ScheduleComponent>;
}

export class SummitCalendarPopup extends React.Component<SummitCalendarPopupProps, State> {
  constructor(props: SummitCalendarPopupProps) {
    super(props);
    this.state = {
      isLoading: true,
      isEditable: props.event?.status !== "concluded",
      data: props as SummitCalendarItem,
      activity: null,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.getActivity();
  }

  getActivity = async () => {
    console.log(this.props);
    if (!this.props.Id) return;
    const activity = (await fetchActivity(this.props.Id)) || null;
    this.setState({ activity: activity, isEditable: activity?.status !== "concluded", isLoading: false });
  };

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState((prevState) => ({
      activity: {
        ...prevState.activity,
        [event.target.name]: event.target.value,
      },
    }));
  };

  handleSave = (item: SummitCalendarItem) => {
    console.log(item);
    // Close the popup
    this.props.scheduleComponent.current?.closeEditor();
  };

  handleCancel = () => {
    this.props.scheduleComponent.current?.closeEditor();
  };

  render() {
    const { isLoading, isEditable, activity } = this.state;

    if (isLoading) {
      return <LoadingSpinner isLoading={isLoading} />;
    }

    return (
      <div className="editor-container">
        {isEditable ? "Editable" : "Not Editable"}
        <label>
          Status:
          <input className="e-input" type="text" name="status" value={activity?.status || ""} onChange={this.handleInputChange} disabled={!isEditable} />
        </label>
        <br />
        <label>
          Challenge Area:
          <input type="text" name="challenge_area" value={activity?.challenge_area || ""} onChange={this.handleInputChange} disabled={!isEditable} />
        </label>
        <div className="button-container">
          <button onClick={() => this.handleSave(this.state.data)} className="e-control e-btn e-primary" data-ripple="true">
            Save
          </button>
          <button onClick={this.handleCancel} className="e-control e-btn e-primary" data-ripple="true">
            Cancel
          </button>
        </div>
        <br />
      </div>
    );
  }
}
