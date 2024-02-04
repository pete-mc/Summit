import React from "react";
import { Inject, EventSettingsModel, ScheduleComponent, ActionEventArgs, EventRenderedArgs, ViewsDirective, ViewDirective } from "@syncfusion/ej2-react-schedule";
import SummitCalendarItem from "../models/SummitCalendarItems";
import { Agenda, Month, Week } from "@syncfusion/ej2-react-schedule";
import { fetchMemberEvents } from "@/services";
import moment from "moment";
import { SummitCalendarPopup } from "./SummitCalendarPopup";

interface SummitCalendarProps {
  onUpdate: (items: SummitCalendarItem[]) => void;
}

interface SummitCalendarState {
  items: SummitCalendarItem[];
  sortState: { sortColumn: string; sortDirection: string };
}

export class SummitCalendarComponent extends React.Component<SummitCalendarProps, SummitCalendarState> {
  private scheduleComponent: React.RefObject<ScheduleComponent> = React.createRef();

  constructor(props: SummitCalendarProps) {
    super(props);
    this.state = {
      items: [],
      sortState: { sortColumn: "file", sortDirection: "ascending" },
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

  eventRendered = (args: EventRenderedArgs) => {
    const data = args.data as SummitCalendarItem;
    args.element.style.backgroundColor = data.color ?? "";
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
        editorTemplate={(props: SummitCalendarItem) => <SummitCalendarPopup {...props} />}
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
