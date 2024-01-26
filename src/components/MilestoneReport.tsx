import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
import { MilestonePlanningItem } from "../classes/MilestonePlanningItem";
import React from "react";

interface MilestoneReportTableProps {
  data: MilestonePlanningItem[];
}

export function MilestoneReportTable({ data }: MilestoneReportTableProps) {
  return (
    <GridComponent dataSource={data}>
      <ColumnsDirective>
        <ColumnDirective field='id' headerText='ID' width='100' textAlign='Right' />
        <ColumnDirective field='name' headerText='Name' width='150' />
        <ColumnDirective field='status' headerText='Status' width='150' />
        {/* Add more columns as needed */}
      </ColumnsDirective>
    </GridComponent>
  );
}