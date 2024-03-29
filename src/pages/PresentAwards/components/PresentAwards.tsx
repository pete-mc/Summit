import React from "react";
import { L10n } from "@syncfusion/ej2-base";
import {
  Column,
  ColumnDirective,
  ColumnsDirective,
  ContentType,
  ExcelExport,
  ExcelExportProperties,
  Filter,
  GridComponent,
  Group,
  GroupSettingsModel,
  Inject,
  PageOrientation,
  PdfExport,
  PdfPageSize,
  RowDataBoundEventArgs,
  Sort,
  Toolbar,
} from "@syncfusion/ej2-react-grids";
import SummitAchievement from "../models/SummitAchievement";
import { ClickEventArgs } from "@syncfusion/ej2-react-navigations";
import { ToastComponent } from "@syncfusion/ej2-react-notifications";

L10n.load({
  "en-US": {
    grid: {
      EmptyRecord: "Loading Records...",
    },
  },
});

interface AwardsTableState {
  items: SummitAchievement[];
}

interface AwardsTableProps {
  items: SummitAchievement[];
  onUpdate: (PresentedItems: SummitAchievement[]) => void;
}

export default class AwardsTable extends React.Component<AwardsTableProps, AwardsTableState> {
  constructor(props: AwardsTableProps) {
    super(props);
    this.state = {
      items: props.items,
    };
  }
  grid: GridComponent | null = null;
  filtering: boolean = true;
  toastInstance: ToastComponent = null!;

  componentDidUpdate(prevProps: AwardsTableProps) {
    const { items } = this.props;
    console.log("items updated");
    if (items !== prevProps.items) {
      this.setState({
        items,
      });
    }
    this.grid?.refresh();
  }

  toolbarClick = (args: ClickEventArgs) => {
    if (this.grid && args.item.id === "Grid_excelexport") {
      const excelExportProperties = {
        fileName: "Awards.xlsx",
        header: {
          headerRows: 1,
          rows: [
            {
              cells: [{ colSpan: 4, value: "Terrain | Summit - Awards Completed", style: { hAlign: "Center", bold: true, fontSize: 16 } }],
            },
          ],
        },
        columns: [
          { field: "type", headerText: "Type", width: 200 },
          { field: "achievementName", headerText: "Award", width: 200 },
          { field: "dateAwarded", headerText: "Date", width: 120 },
          { field: "presented", headerText: "Presented", width: 100 },
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
          { field: "member", headerText: "Name", width: 140 },
          { field: "type", headerText: "Type", width: 90 },
          { field: "achievementName", headerText: "Award", width: 90 },
          { field: "dateAwarded", headerText: "Date", width: 90 },
          { field: "presented", headerText: "Presented", width: 90 },
        ] as Column[],
        header: {
          fromTop: 0,
          height: 60,
          contents: [
            {
              type: "Text" as ContentType,
              value: "Terrain | Summit - Awards Completed",
              position: { x: 0, y: 30 },
              style: { textBrushColor: "#004C00", fontSize: 20 },
            },
          ],
        },
        theme: { record: { fontColor: "#000000", fontSize: 9 }, header: { fontColor: "#000000", fontSize: 10, bold: true } },
      };
      this.grid.pdfExport(PdfExportProperties);
    }
    if (this.grid && args.item.id === "show_presented") {
      if (this.filtering) {
        this.grid.clearFiltering();
        this.filtering = false;
        args.item.text = "Hide Presented";
      } else {
        this.grid.filterByColumn("presented", "equal", "No");
        this.filtering = true;
        args.item.text = "Show Presented";
      }
    }
    if (this.grid && args.item.id === "present_awards") {
      const selectedRecords = this.grid.getSelectedRecords() as SummitAchievement[];
      if (selectedRecords.length > 0) {
        const items = this.state.items.filter((item) => item.presented === "Yes" || selectedRecords.some((selected) => selected.id === item.id));
        this.props.onUpdate(items);
      } else {
        this.toastInstance.show();
      }
    }
  };

  sortingOptions = {
    columns: [
      {
        field: "member",
        direction: "Ascending",
      },
      {
        field: "type",
        direction: "Ascending",
      },
      {
        field: "achievementName",
        direction: "Ascending",
      },
      {
        field: "dateAwarded",
        direction: "Ascending",
      },
    ],
  };

  groupOptions: GroupSettingsModel = {
    columns: ["member"],
    showDropArea: false,
    captionTemplate: '<span class="groupItems"><b> ${key} </b> (${count} Records)',
  };

  toolbarOptions = [
    "PdfExport",
    "ExcelExport",
    { text: "Show Presented", tooltipText: "Show only presented awards", prefixIcon: "e-filter icon", id: "show_presented" },
    { text: "Present", tooltipText: "Mark selected awards presented", prefixIcon: "e-save icon", id: "present_awards", align: "Right" },
  ];

  selectionSettings = { checkboxOnly: true, type: "Multiple" };

  rowDataBound = (args: RowDataBoundEventArgs) => {
    args.isSelectable = (args.data as SummitAchievement).presented === "No";
  };

  render(): React.ReactNode {
    const { items } = this.state;
    return (
      <>
        <div id="#toast_target" />
        <ToastComponent id="toast_target" ref={(toast: ToastComponent) => (this.toastInstance = toast)} title="Warning" content="No new awards were selected as presented." />
        <GridComponent
          id="Grid"
          dataSource={items}
          selectionSettings={this.selectionSettings}
          allowResizing
          allowGrouping
          toolbar={this.toolbarOptions}
          allowPdfExport
          allowExcelExport
          allowSorting
          sortSettings={this.sortingOptions}
          locale="en-US"
          groupSettings={this.groupOptions}
          allowFiltering
          rowDataBound={this.rowDataBound}
          filterSettings={{ type: "", columns: [{ field: "presented", operator: "equal", value: "No" }] }}
          toolbarClick={this.toolbarClick}
          ref={(g: GridComponent | null) => (this.grid = g)}
        >
          <ColumnsDirective>
            <ColumnDirective field="member" headerText="Name" width="100" textAlign="Left" />
            <ColumnDirective field="type" headerText="Type" width="100" textAlign="Left" />
            <ColumnDirective field="achievementName" headerText="Award" width="100" textAlign="Left" />
            <ColumnDirective field="dateAwarded" headerText="Date" width="100" textAlign="Left" />
            <ColumnDirective field="presented" headerText="Presented" width="100" textAlign="Left" />
            <ColumnDirective headerText="Present" width="50" type="checkbox" />
          </ColumnsDirective>
          <Inject services={[Toolbar, PdfExport, ExcelExport, Sort, Group, Filter]} />
        </GridComponent>
      </>
    ) as React.ReactNode;
  }
}
