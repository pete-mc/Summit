import React from "react";
// import MilestonePlanningItem from "../models/MilestonePlanningItem";

interface TermPlannerTableProps {
  items: [];
  onUpdate: (items: []) => void;
}

export default class TermPlannerTable extends React.Component<TermPlannerTableProps> {
  constructor(props: TermPlannerTableProps) {
    super(props);
    this.state = {};
  }

  render(): React.ReactNode {
    return <div></div>;
  }
}
