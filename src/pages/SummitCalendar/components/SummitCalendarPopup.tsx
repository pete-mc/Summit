import React from "react";
import SummitCalendarItem from "../models/SummitCalendarItems";
import { TerrainEvent } from "@/types/terrainTypes";
import { fetchActivity } from "@/services";
import { LoadingSpinner } from "./LoadingSpinnger";

interface State {
  isLoading: boolean;
  isEditable: boolean;
  data: SummitCalendarItem;
  activity: TerrainEvent | null;
}

export class SummitCalendarPopup extends React.Component<SummitCalendarItem, State> {
  constructor(props: SummitCalendarItem) {
    super(props);
    this.state = {
      isLoading: true,
      isEditable: props.event?.status !== "Concluded",
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
    this.setState({ activity: activity, isEditable: activity?.status !== "Concluded", isLoading: false });
  };

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      data: {
        ...this.state.data,
        [event.target.name]: event.target.value,
      },
    });
  };

  onSave(data: SummitCalendarItem): void {
    console.log(data);
  }

  render() {
    const { isLoading, isEditable, data, activity } = this.state;

    if (isLoading) {
      return <LoadingSpinner isLoading={isLoading} />; // Replace with your spinner component
    }

    return (
      <div>
        {isEditable ? "Editable" : "Not Editable"}
        <label>
          Status:
          <input type="text" name="status" value={activity?.status} onChange={this.handleInputChange} disabled={!isEditable} />
        </label>
        <br />
        <label>
          Challenge Area:
          <input type="text" name="challenge_area" value={activity?.challenge_area} onChange={this.handleInputChange} disabled={!isEditable} />
        </label>
        <br />

        {isEditable && <button onClick={() => this.onSave(data)}>Save</button>}
      </div>
    );
  }
}
