import React from "react";

type SettingsProps = {
  // add your properties here
};

type StateOption = {
  value: string;
  label: string;
};

type SettingsState = {
  selectedState: StateOption | null;
  defaultSectionNightDetails: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

export class SettingsUIComponent extends React.Component<SettingsProps, SettingsState> {
  state: SettingsState = {
    selectedState: JSON.parse(localStorage.getItem("selectedState") || "null"),
    defaultSectionNightDetails: localStorage.getItem("defaultSectionNightDetails") || "",
    dayOfWeek: localStorage.getItem("dayOfWeek") || "",
    startTime: localStorage.getItem("startTime") || "",
    endTime: localStorage.getItem("endTime") || "",
  };

  componentDidUpdate() {
    localStorage.setItem("selectedState", JSON.stringify(this.state.selectedState));
    localStorage.setItem("defaultSectionNightDetails", this.state.defaultSectionNightDetails);
    localStorage.setItem("dayOfWeek", this.state.dayOfWeek);
    localStorage.setItem("startTime", this.state.startTime);
    localStorage.setItem("endTime", this.state.endTime);
  }

  render() {
    return (
      <div>
        <select
          onChange={(e) =>
            this.setState({
              selectedState: { value: e.target.value, label: e.target.value },
            })
          }
        >
          {/* Add your options here */}
        </select>
        <input type="text" value={this.state.defaultSectionNightDetails} onChange={(e) => this.setState({ defaultSectionNightDetails: e.target.value })} />
        <input type="text" value={this.state.dayOfWeek} onChange={(e) => this.setState({ dayOfWeek: e.target.value })} />
        <input type="time" value={this.state.startTime} onChange={(e) => this.setState({ startTime: e.target.value })} />
        <input type="time" value={this.state.endTime} onChange={(e) => this.setState({ endTime: e.target.value })} />
      </div>
    );
  }
}
