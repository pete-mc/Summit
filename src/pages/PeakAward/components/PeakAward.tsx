import { ClickEventArgs } from "@syncfusion/ej2-react-navigations";
import {
  Column,
  ColumnDirective,
  ColumnsDirective,
  ContentType,
  ExcelExport,
  ExcelExportProperties,
  GridComponent,
  Inject,
  PageOrientation,
  PdfExport,
  PdfPageSize,
  PdfQueryCellInfoEventArgs,
  Sort,
  Toolbar,
} from "@syncfusion/ej2-react-grids";
import React from "react";
import PeakAwardItem from "../models/PeakAwardItem";
import { verticalText } from "@/helpers";

interface PeakAwardReportTableProps {
  items: PeakAwardItem[];
  onUpdate: (items: PeakAwardItem[]) => void;
}

export default class PeakAwardTable extends React.Component<PeakAwardReportTableProps> {
  constructor(props: PeakAwardReportTableProps) {
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
        fileName: "PeakAwardReport.xlsx",
        header: {
          headerRows: 1,
          rows: [
            {
              cells: [{ colSpan: 19, value: "Terrain | Summit -  Peak Award Report", style: { hAlign: "Center", bold: true, fontSize: 16 } }],
            },
          ],
        },
        columns: [
          { field: "name", headerText: "Name", width: 150 },
          { field: "milestone3", headerText: "Milestone 3", width: 50 },
          { field: "leads", headerText: "Leads", width: 50 },
          { field: "assists", headerText: "Assists", width: 50 },
          { field: "outdoors", headerText: "Outdoors", width: 50 },
          { field: "creative", headerText: "Creative", width: 50 },
          { field: "personalGrowth", headerText: "Personal Growth", width: 50 },
          { field: "community", headerText: "Community", width: 50 },
          { field: "SIAInProgress", headerText: "SIA In Progress", width: 50 },
          { field: "SIACompleted", headerText: "SIA Completed", width: 50 },
          { field: "OASProgressions", headerText: "OAS Progressions", width: 50 },
          { field: "Bushcraft", headerText: "Bushcraft", width: 50 },
          { field: "Bushwalking", headerText: "Bushwalking", width: 50 },
          { field: "Camping", headerText: "Camping", width: 50 },
          { field: "Scouts", headerText: "Scouts", width: 50 },
          { field: "Section", headerText: "Section", width: 50 },
          { field: "PersonalDevelopment", headerText: "Personal Development", width: 50 },
          { field: "Reflection", headerText: "Reflection", width: 50 },
          { field: "Journey", headerText: "Journey", width: 50 },
        ] as Column[],
      } as ExcelExportProperties;
      this.grid.excelExport(excelExportProperties);
    }
    if (this.grid && args.item.id === "Grid_pdfexport") {
      const PdfExportProperties = {
        pageOrientation: "Landscape" as PageOrientation,
        pageSize: "A4" as PdfPageSize,
        fileName: "PeakAwardReport.pdf",
        columns: [
          { field: "name", headerText: "Name", width: 180 },
          { field: "milestone3", headerText: verticalText("Milestone 3".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "leads", headerText: verticalText("Lead".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "assists", headerText: verticalText("Assists".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "outdoors", headerText: verticalText("Outdoors".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "creative", headerText: verticalText("Creative".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "personalGrowth", headerText: verticalText("Personal Growth".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "community", headerText: verticalText("Community".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "SIAInProgress", headerText: verticalText("SIA In Progress".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "SIACompleted", headerText: verticalText("SIA Completed".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "OASProgressions", headerText: verticalText("Progressions".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "Bushcraft", headerText: verticalText("Bushcraft".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "Bushwalking", headerText: verticalText("Bushwalking".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "Camping", headerText: verticalText("Camping".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "Scouts", headerText: verticalText("Scouts".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "Section", headerText: verticalText("Section".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "PersonalDevelopment", headerText: verticalText("Course".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "Reflection", headerText: verticalText("Reflection".toUpperCase()), width: 45, textAlign: "Center" },
          { field: "Journey", headerText: verticalText("Journey".toUpperCase()), width: 45, textAlign: "Center" },
        ] as Column[],
        header: {
          fromTop: 0,
          height: 60,
          contents: [
            {
              type: "Text" as ContentType,
              value: "Terrain | Summit - Peak Award Report",
              position: { x: 0, y: 30 },
              style: { textBrushColor: "#004C00", fontSize: 20 },
            },
          ],
        },
        theme: { record: { fontColor: "#000000", fontSize: 9 }, header: { fontColor: "#000000", fontSize: 9, bold: true } },
      };
      this.grid.pdfExport(PdfExportProperties);
    }
  };

  verticalHeaders = (headerText: string) => () => {
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

  pdfQueryCellInfo = (args: PdfQueryCellInfoEventArgs) => {
    if (typeof args.value === "string") args.value = args.value.replace(/✅/g, "Y").replace(/⌛/g, "...").replace(/❌/g, "-");
  };

  render(): React.ReactNode {
    return (
      <GridComponent
        id="Grid"
        dataSource={this.props.items}
        pdfQueryCellInfo={this.pdfQueryCellInfo}
        allowSorting={true}
        toolbar={["Print", "PdfExport", "ExcelExport"]}
        allowPdfExport={true}
        allowExcelExport={true}
        toolbarClick={this.toolbarClick}
        ref={(g: GridComponent | null) => (this.grid = g)}
      >
        <ColumnsDirective>
          <ColumnDirective field="name" headerText="Name" width="150" isFrozen={true} />
          <ColumnDirective field="milestone3" headerText="Milestone 3" width="50" headerTemplate={this.verticalHeaders("Milestone 3")} />
          <ColumnDirective field="leads" headerText="Leads" width="50" headerTemplate={this.verticalHeaders("Leads")} />
          <ColumnDirective field="assists" headerText="Assists" width="50" headerTemplate={this.verticalHeaders("Assists")} />
          <ColumnDirective field="outdoors" headerText="Outdoors" width="50" headerTemplate={this.verticalHeaders("Outdoors")} />
          <ColumnDirective field="creative" headerText="Creative" width="50" headerTemplate={this.verticalHeaders("Creative")} />
          <ColumnDirective field="personalGrowth" headerText="Personal Growth" width="50" headerTemplate={this.verticalHeaders("Personal Growth")} />
          <ColumnDirective field="community" headerText="Community" width="50" headerTemplate={this.verticalHeaders("Community")} />
          <ColumnDirective field="SIAInProgress" headerText="SIA In Progress" width="50" headerTemplate={this.verticalHeaders("SIA In Progress")} />
          <ColumnDirective field="SIACompleted" headerText="SIA Completed" width="50" headerTemplate={this.verticalHeaders("SIA Completed")} />
          <ColumnDirective field="OASProgressions" headerText="OAS Progressions" width="50" headerTemplate={this.verticalHeaders("Progressions")} />
          <ColumnDirective field="Bushcraft" headerText="Bushcraft" width="50" headerTemplate={this.verticalHeaders("Bushcraft")} />
          <ColumnDirective field="Bushwalking" headerText="Bushwalking" width="50" headerTemplate={this.verticalHeaders("Bushwalking")} />
          <ColumnDirective field="Camping" headerText="Camping" width="50" headerTemplate={this.verticalHeaders("Camping")} />
          <ColumnDirective field="Scouts" headerText="Scouts" width="50" headerTemplate={this.verticalHeaders("Scouts")} />
          <ColumnDirective field="Section" headerText="Section" width="50" headerTemplate={this.verticalHeaders("Section")} />
          <ColumnDirective field="PersonalDevelopment" headerText="Personal Development" width="50" headerTemplate={this.verticalHeaders("Course")} />
          <ColumnDirective field="Reflection" headerText="Reflection" width="50" headerTemplate={this.verticalHeaders("Reflection")} />
          <ColumnDirective field="Journey" headerText="Journey" width="50" headerTemplate={this.verticalHeaders("Journey")} />
        </ColumnsDirective>
        <Inject services={[Toolbar, PdfExport, ExcelExport, Sort]} />
      </GridComponent>
    );
  }
}
