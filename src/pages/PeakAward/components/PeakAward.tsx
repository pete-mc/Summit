import React from "react";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";
import PeakAwardItem from "../models/PeakAwardItem";

interface PeakAwardReportTableProps {
  items: PeakAwardItem[];
  onUpdate: (items: PeakAwardItem[]) => void;
}

const verticalHeader = (headerText: string) => {
  const lines = headerText.split("\n");
  return (
    <div style={{ writingMode: "vertical-rl" }}>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

const exportStatus = (value: string | number) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/✅/g, "Y").replace(/⌛/g, "...").replace(/❌/g, "-");
};

export default function PeakAwardTable(props: PeakAwardReportTableProps): React.ReactNode {
  const columns: DataGridColumn<PeakAwardItem>[] = [
    { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
    { id: "milestone3", header: verticalHeader("Milestone 3"), accessorKey: "milestone3", enableSorting: true, exportValue: (row) => exportStatus(row.milestone3) },
    { id: "leads", header: verticalHeader("Leads"), accessorKey: "leads", enableSorting: true },
    { id: "assists", header: verticalHeader("Assists"), accessorKey: "assists", enableSorting: true },
    { id: "outdoors", header: verticalHeader("Outdoors"), accessorKey: "outdoors", enableSorting: true },
    { id: "creative", header: verticalHeader("Creative"), accessorKey: "creative", enableSorting: true },
    { id: "personalGrowth", header: verticalHeader("Personal Growth"), accessorKey: "personalGrowth", enableSorting: true },
    { id: "community", header: verticalHeader("Community"), accessorKey: "community", enableSorting: true },
    { id: "SIAInProgress", header: verticalHeader("SIA In Progress"), accessorKey: "SIAInProgress", enableSorting: true },
    { id: "SIACompleted", header: verticalHeader("SIA Completed"), accessorKey: "SIACompleted", enableSorting: true },
    { id: "OASProgressions", header: verticalHeader("Progressions"), accessorKey: "OASProgressions", enableSorting: true },
    { id: "Bushcraft", header: verticalHeader("Bushcraft"), accessorKey: "Bushcraft", enableSorting: true },
    { id: "Bushwalking", header: verticalHeader("Bushwalking"), accessorKey: "Bushwalking", enableSorting: true },
    { id: "Camping", header: verticalHeader("Camping"), accessorKey: "Camping", enableSorting: true },
    { id: "Scouts", header: verticalHeader("Scouts"), accessorKey: "Scouts", enableSorting: true, exportValue: (row) => exportStatus(row.Scouts) },
    { id: "Section", header: verticalHeader("Section"), accessorKey: "Section", enableSorting: true, exportValue: (row) => exportStatus(row.Section) },
    {
      id: "PersonalDevelopment",
      header: verticalHeader("Course"),
      accessorKey: "PersonalDevelopment",
      enableSorting: true,
      exportHeader: "Personal Development",
      exportValue: (row) => exportStatus(row.PersonalDevelopment),
    },
    { id: "Reflection", header: verticalHeader("Reflection"), accessorKey: "Reflection", enableSorting: true, exportValue: (row) => exportStatus(row.Reflection) },
    { id: "Journey", header: verticalHeader("Journey"), accessorKey: "Journey", enableSorting: true, exportValue: (row) => exportStatus(row.Journey) },
  ];

  return (
    <DataGrid
      id="Grid"
      data={props.items}
      columns={columns}
      toolbarActions={["pdf", "excel"]}
      exportOptions={{
        fileNamePrefix: "PeakAwardReport",
        title: "Terrain | Summit - Peak Award Report",
        orientation: "landscape",
      }}
    />
  );
}
