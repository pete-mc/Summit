import React from "react";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";
import OasReportItem, { OasReportSubItem } from "@/pages/OasReport/models/OasReportItem";

interface OasReportTableProps {
  items: OasReportItem[];
  onUpdate: (items: OasReportItem[]) => void;
}

const formatBranch = (branch: string): string => {
  return branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
};

const stageSumSortComparer = (a: OasReportSubItem[] | undefined, b: OasReportSubItem[] | undefined) => {
  const aSum = (a ?? []).reduce((sum: number, current: OasReportSubItem) => sum + current.stage, 0);
  const bSum = (b ?? []).reduce((sum: number, current: OasReportSubItem) => sum + current.stage, 0);
  return aSum - bSum;
};

const streamTemplate = (items: OasReportSubItem[] | undefined) => {
  if (!items || items.length === 0) {
    return null;
  }

  return items.map((stream: OasReportSubItem, index: number) => (
    <React.Fragment key={`${stream.branch}-${stream.stage}-${index}`}>
      <div className="oas-template-cell" style={{ lineHeight: "0.9", textAlign: "center" }}>
        <b>{stream.stage}</b>
        <br />
        <span style={{ fontSize: "small" }}>{formatBranch(stream.branch)}</span>
      </div>
      {index < items.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
};

const streamExportValue = (items: OasReportSubItem[] | undefined) => {
  return (items ?? []).map((stream) => `${formatBranch(stream.branch)} (${stream.stage})`).join("\n");
};

export function OasReportTable(props: OasReportTableProps): React.ReactNode {
  const streamColumns: Array<{ id: keyof OasReportItem & string; header: string }> = [
    { id: "bushcraft", header: "Bushcraft" },
    { id: "bushwalking", header: "Bushwalking" },
    { id: "camping", header: "Camping" },
    { id: "alpine", header: "Alpine" },
    { id: "cycling", header: "Cycling" },
    { id: "vertical", header: "Vertical" },
    { id: "aquatics", header: "Aquatics" },
    { id: "boating", header: "Boating" },
    { id: "paddling", header: "Paddling" },
  ];

  const columns: DataGridColumn<OasReportItem>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
    },
    ...streamColumns.map((column): DataGridColumn<OasReportItem> => {
      return {
        id: column.id,
        header: column.header,
        accessorFn: (row) => row[column.id] as OasReportSubItem[] | undefined,
        cell: (row) => streamTemplate(row[column.id] as OasReportSubItem[] | undefined),
        enableSorting: true,
        sortingFn: (left, right) => stageSumSortComparer(left[column.id] as OasReportSubItem[] | undefined, right[column.id] as OasReportSubItem[] | undefined),
        exportValue: (row) => streamExportValue(row[column.id] as OasReportSubItem[] | undefined),
      };
    }),
  ];

  return (
    <DataGrid
      id="Grid"
      data={props.items}
      columns={columns}
      toolbarActions={["pdf", "excel"]}
      pageSizeOptions={[10, 25, 50, 100]}
      exportOptions={{
        fileNamePrefix: "OASReport",
        title: "Terrain | Summit - OAS Report",
        orientation: "landscape",
      }}
    />
  );
}
