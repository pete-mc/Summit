import React from "react";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";
import MilestonePlanningItem from "../models/UnitSummarytem";

interface MilestoneReportTableProps {
  items: MilestonePlanningItem[];
  onUpdate: (items: MilestonePlanningItem[]) => void;
}

export default function MilestoneReprtTable(props: MilestoneReportTableProps): React.ReactNode {
  const columns: DataGridColumn<MilestonePlanningItem>[] = [
    { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
    { id: "total_leads", header: "Leads (total)", accessorKey: "total_leads", enableSorting: true },
    { id: "outdoors", header: "Outdoors participants", accessorKey: "outdoors", enableSorting: true },
    { id: "creative", header: "Creative participants", accessorKey: "creative", enableSorting: true },
    { id: "personalGrowth", header: "Personal Growth participants", accessorKey: "personalGrowth", enableSorting: true },
    { id: "community", header: "Community participants", accessorKey: "community", enableSorting: true },
  ];

  return (
    <DataGrid
      id="Grid"
      data={props.items}
      columns={columns}
      toolbarActions={["pdf", "excel"]}
      exportOptions={{
        fileNamePrefix: "UnitSummaryReport",
        title: "Terrain | Summit - Unit Summary Report",
      }}
    />
  );
}
