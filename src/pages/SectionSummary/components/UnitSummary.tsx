import { ClickEventArgs } from "@syncfusion/ej2-react-navigations";
import { Column, ColumnDirective, ColumnsDirective, ContentType, ExcelExport, ExcelExportProperties, GridComponent, Inject, PageOrientation, PdfExport, PdfPageSize, Sort, Toolbar } from "@syncfusion/ej2-react-grids";
import React from "react";
import MilestonePlanningItem from "../models/UnitSummarytem";

interface MilestoneReportTableProps {
  items: MilestonePlanningItem[];
  onUpdate: (items: MilestonePlanningItem[]) => void;
}

export default class MilestoneReprtTable extends React.Component<MilestoneReportTableProps> {
  constructor(props: MilestoneReportTableProps) {
    super(props);
    this.state = {
      items: props.items,
      sortState: { sortColumn: "file", sortDirection: "ascending" },
    };
  }

  grid: GridComponent | null = null;
  toolbarClick = (args: ClickEventArgs) => {
    if (this.grid && args.item.id === "Grid_excelexport") {
      const excelExportProperties = {
        fileName: "MilestoneReport.xlsx",
        header: {
          headerRows: 1,
          rows: [
            {
              cells: [{ colSpan: 7, value: "Terrain | Summit -  Milestone Report", style: { hAlign: "Center", bold: true, fontSize: 16 } }],
            },
          ],
        },
        columns: [
          { field: "name", headerText: "Name", width: 150 },
          { field: "total_leads", headerText: "Leads", width: 120 },
          { field: "total_assists", headerText: "Assists", width: 120 },
          { field: "outdoors", headerText: "Outdoors", width: 120 },
          { field: "creative", headerText: "Creative", width: 120 },
          { field: "personalGrowth", headerText: "Personal Growth", width: 120 },
          { field: "community", headerText: "Community", width: 120 },
        ] as Column[],
      } as ExcelExportProperties;
      this.grid.excelExport(excelExportProperties);
    }
    if (this.grid && args.item.id === "Grid_pdfexport") {
      const PdfExportProperties = {
        pageOrientation: "Portrait" as PageOrientation,
        pageSize: "A4" as PdfPageSize,
        fileName: "MilestoneReport.pdf",
        columns: [
          { field: "name", headerText: "Name", width: 140 },
          { field: "total_leads", headerText: "Leads", width: 90 },
          { field: "total_assists", headerText: "Assists", width: 90 },
          { field: "outdoors", headerText: "Outdoors", width: 90 },
          { field: "creative", headerText: "Creative", width: 90 },
          { field: "personalGrowth", headerText: "Personal Growth", width: 90 },
          { field: "community", headerText: "Community", width: 90 },
        ] as Column[],
        header: {
          fromTop: 0,
          height: 60,
          contents: [
            {
              type: "Text" as ContentType,
              value: "Terrain | Summit - Milestone Report",
              position: { x: 0, y: 30 },
              style: { textBrushColor: "#004C00", fontSize: 20 },
            },
          ],
        },
        theme: { record: { fontColor: "#000000", fontSize: 9 }, header: { fontColor: "#000000", fontSize: 10, bold: true } },
      };
      this.grid.pdfExport(PdfExportProperties);
    }
  };

  render(): React.ReactNode {
    return (
      <GridComponent
        id="Grid"
        dataSource={this.props.items}
        allowSorting={true}
        toolbar={["Print", "PdfExport", "ExcelExport"]}
        allowPdfExport={true}
        allowExcelExport={true}
        toolbarClick={this.toolbarClick}
        ref={(g: GridComponent | null) => (this.grid = g)}
      >
        <ColumnsDirective>
          <ColumnDirective field="name" headerText="Name" width="150" isFrozen={true} />
          <ColumnDirective field="total_leads" headerText="Leads" width="100" />
          <ColumnDirective field="total_assists" headerText="Assists" width="100" />
          <ColumnDirective field="outdoors" headerText="Outdoors" width="100" />
          <ColumnDirective field="creative" headerText="Creative" width="100" />
          <ColumnDirective field="personalGrowth" headerText="Personal Growth" width="100" />
          <ColumnDirective field="community" headerText="Community" width="100" />
        </ColumnsDirective>
        <Inject services={[Toolbar, PdfExport, ExcelExport, Sort]} />
      </GridComponent>
    );
  }
}
