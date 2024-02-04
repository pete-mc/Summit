import React from "react";
import {
  Column,
  ColumnDirective,
  ColumnsDirective,
  ContentType,
  ExcelExport,
  ExcelExportProperties,
  ExcelQueryCellInfoEventArgs,
  GridComponent,
  Inject,
  PageOrientation,
  PdfExport,
  PdfExportProperties,
  PdfHeader,
  PdfPageSize,
  PdfQueryCellInfoEventArgs,
  Sort,
  Toolbar,
  ValueType,
} from "@syncfusion/ej2-react-grids";
import OasReportItem, { OasReportSubItem } from "@/pages/OasReport/models/OasReportItem";
import { ClickEventArgs } from "@syncfusion/ej2-react-navigations";

interface OasReportTableProps {
  items: OasReportItem[];
  onUpdate: (items: OasReportItem[]) => void;
}

export class OasReportTable extends React.Component<OasReportTableProps> {
  constructor(props: OasReportTableProps) {
    super(props);
    this.state = {
      items: props.items,
      sortState: { sortColumn: "file", sortDirection: "ascending" },
    };
  }

  OasTemplateCell = ({ stream }: { stream: OasReportSubItem }) => {
    const branch = stream.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
    return (
      <div className="oas-template-cell" style={{ lineHeight: "0.9", textAlign: "center" }}>
        <b>{stream.stage}</b>
        <br />
        <span style={{ fontSize: "small" }}>{branch}</span>
      </div>
    );
  };

  oasTemplate = (props: OasReportItem, column: string) => {
    if (props[column] == null) return;
    return (props[column] as OasReportSubItem[]).map((stream: OasReportSubItem, index: number) => (
      <React.Fragment key={index}>
        <this.OasTemplateCell stream={stream} />
        <br />
      </React.Fragment>
    ));
  };
  grid: GridComponent | null = null;
  toolbarClick = (args: ClickEventArgs) => {
    if (this.grid && args.item.id === "Grid_excelexport") {
      const excelExportProperties = {
        fileName: "OASReport.xlsx",
        header: {
          headerRows: 1,
          rows: [
            {
              cells: [{ colSpan: 10, value: "Terrain | Summit -  OAS Report", style: { hAlign: "Center", bold: true, fontSize: 16 } }],
            },
          ],
        },
        columns: [
          { field: "name", headerText: "Name", width: 150 },
          { field: "bushcraft", headerText: "Bushcraft", width: 150 },
          { field: "bushwalking", headerText: "Bushwalking", width: 150 },
          { field: "camping", headerText: "Camping", width: 150 },
          { field: "alpine", headerText: "Alpine", width: 150 },
          { field: "cycling", headerText: "Cycling", width: 150 },
          { field: "vertical", headerText: "Vertical", width: 150 },
          { field: "aquatics", headerText: "Aquatics", width: 150 },
          { field: "boating", headerText: "Boating", width: 150 },
          { field: "paddling", headerText: "Paddling", width: 150 },
        ] as Column[],
      } as ExcelExportProperties;

      this.grid.excelExport(excelExportProperties);
    }
    if (this.grid && args.item.id === "Grid_pdfexport") {
      const PdfExportProperties = {
        header: {
          fromTop: 0,
          height: 60,
          contents: [
            {
              type: "Text" as ContentType,
              value: "Terrain | Summit -  OAS Report",
              position: { x: 0, y: 30 },
              style: { textBrushColor: "#004C00", fontSize: 20 },
            },
          ],
        } as PdfHeader,
        pageOrientation: "Landscape" as PageOrientation,
        pageSize: "A4" as PdfPageSize,
        fileName: "OASReport.pdf",
        columns: [
          { field: "name", headerText: "Name", width: 130 },
          { field: "bushcraft", headerText: "Bushcraft", width: 95 },
          { field: "bushwalking", headerText: "Bushwalking", width: 105 },
          { field: "camping", headerText: "Camping", width: 95 },
          { field: "alpine", headerText: "Alpine", width: 95 },
          { field: "cycling", headerText: "Cycling", width: 95 },
          { field: "vertical", headerText: "Vertical", width: 95 },
          { field: "aquatics", headerText: "Aquatics", width: 95 },
          { field: "boating", headerText: "Boating", width: 95 },
          { field: "paddling", headerText: "Paddling", width: 95 },
        ] as Column[],
        theme: { record: { fontColor: "#000000", fontSize: 9 }, header: { fontColor: "#000000", fontSize: 10, bold: true } },
      } as PdfExportProperties;
      this.grid.pdfExport(PdfExportProperties);
    }
  };

  stageSumSortComparer = (a: ValueType, b: ValueType) => {
    const aItem = a as unknown as OasReportSubItem[];
    const bItem = b as unknown as OasReportSubItem[];
    const aSum = aItem.reduce((sum: number, current: OasReportSubItem) => sum + current.stage, 0);
    const bSum = bItem.reduce((sum: number, current: OasReportSubItem) => sum + current.stage, 0);
    return aSum - bSum;
  };

  pdfQueryCellInfo = (args: PdfQueryCellInfoEventArgs) => {
    if (args.column && args.column.headerText != "Name") {
      args.value = ((args.data as OasReportItem)[args.column.field] as OasReportSubItem[])
        .map((stream: OasReportSubItem) => {
          return stream.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + ` (${stream.stage})`;
        })
        .join("\n");
    }
  };

  excelQueryCellInfo = (args: ExcelQueryCellInfoEventArgs) => {
    if (args.column && args.column.headerText != "Name") {
      args.style = { wrapText: true };
      args.value = ((args.data as OasReportItem)[args.column.field] as OasReportSubItem[])
        .map((stream: OasReportSubItem) => {
          return stream.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + ` (${stream.stage})`;
        })
        .join("\r\n");
    }
  };

  render(): React.ReactNode {
    return (
      <GridComponent
        id="Grid"
        dataSource={this.props.items}
        allowResizing={true}
        toolbar={["Print", "PdfExport", "ExcelExport"]}
        allowPdfExport={true}
        allowExcelExport={true}
        toolbarClick={this.toolbarClick}
        ref={(g: GridComponent | null) => (this.grid = g)}
        pdfQueryCellInfo={this.pdfQueryCellInfo}
        excelQueryCellInfo={this.excelQueryCellInfo}
        allowSorting={true}
      >
        <ColumnsDirective>
          <ColumnDirective field="name" headerText="Name" width="150" />
          <ColumnDirective field="bushcraft" headerText="Bushcraft" template={(props: OasReportItem) => this.oasTemplate(props, "bushcraft")} minWidth={100} sortComparer={this.stageSumSortComparer} />
          <ColumnDirective field="bushwalking" headerText="Bushwalking" template={(props: OasReportItem) => this.oasTemplate(props, "bushwalking")} minWidth={100} sortComparer={this.stageSumSortComparer} />
          <ColumnDirective field="camping" headerText="Camping" template={(props: OasReportItem) => this.oasTemplate(props, "camping")} minWidth={100} sortComparer={this.stageSumSortComparer} />
          <ColumnDirective field="alpine" headerText="Alpine" template={(props: OasReportItem) => this.oasTemplate(props, "alpine")} minWidth={100} sortComparer={this.stageSumSortComparer} />
          <ColumnDirective field="cycling" headerText="Cycling" template={(props: OasReportItem) => this.oasTemplate(props, "cycling")} minWidth={100} sortComparer={this.stageSumSortComparer} />
          <ColumnDirective field="vertical" headerText="Vertical" template={(props: OasReportItem) => this.oasTemplate(props, "vertical")} minWidth={100} sortComparer={this.stageSumSortComparer} />
          <ColumnDirective field="aquatics" headerText="Aquatics" template={(props: OasReportItem) => this.oasTemplate(props, "aquatics")} minWidth={100} sortComparer={this.stageSumSortComparer} />
          <ColumnDirective field="boating" headerText="Boating" template={(props: OasReportItem) => this.oasTemplate(props, "boating")} minWidth={100} sortComparer={this.stageSumSortComparer} />
          <ColumnDirective field="paddling" headerText="Paddling" template={(props: OasReportItem) => this.oasTemplate(props, "paddling")} minWidth={100} sortComparer={this.stageSumSortComparer} />
        </ColumnsDirective>
        <Inject services={[Toolbar, PdfExport, ExcelExport, Sort]} />
      </GridComponent>
    ) as React.ReactNode;
  }
}
