import React from "react";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";
import MilestonePlanningItem from "../models/MilestonePlanningItem";

interface MilestoneReportTableProps {
  items: MilestonePlanningItem[];
  onUpdate: (items: MilestonePlanningItem[]) => void;
}

export default function MilestoneReportTable(props: MilestoneReportTableProps): React.ReactNode {
  const columns: DataGridColumn<MilestonePlanningItem>[] = [
    { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
    { id: "milestone", header: "Next Milestone", accessorKey: "milestone", enableSorting: true },
    { id: "overall_percent", header: "Complete", accessorKey: "overall_percent", enableSorting: true },
    { id: "total_leads", header: "Leads", accessorKey: "total_leads", enableSorting: true },
    { id: "total_assists", header: "Assists", accessorKey: "total_assists", enableSorting: true },
    { id: "outdoors", header: "Outdoors", accessorKey: "outdoors", enableSorting: true },
    { id: "creative", header: "Creative", accessorKey: "creative", enableSorting: true },
    { id: "personal_growth", header: "Personal Growth", accessorKey: "personal_growth", enableSorting: true },
    { id: "community", header: "Community", accessorKey: "community", enableSorting: true },
  ];

  return (
    <DataGrid
      id="Grid"
      data={props.items}
      columns={columns}
      toolbarActions={["pdf", "excel"]}
      pageSizeOptions={[10, 25, 50, 100]}
      exportOptions={{
        fileNamePrefix: "MilestoneReport",
        title: "Terrain | Summit - Milestone Report",
      }}
    />
  );
}
