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
  Page,
  PageOrientation,
  PdfExport,
  PdfPageSize,
  RowDataBoundEventArgs,
  RowSelectEventArgs,
  Sort,
  Toolbar,
} from "@syncfusion/ej2-react-grids";
import SummitAchievement from "../models/SummitAchievement";
import { ClickEventArgs } from "@syncfusion/ej2-react-navigations";
import { ToastComponent } from "@syncfusion/ej2-react-notifications";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import moment from "moment";

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
  selIndex: number[] = [];
  firstLoad: boolean = true;
  componentDidUpdate(prevProps: AwardsTableProps) {
    const { items } = this.props;
    if (items !== prevProps.items && this.firstLoad) {
      this.firstLoad = false;
      console.log("items updated");
      this.setState({
        items,
      });
    }
    this.grid?.refreshColumns();
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
        fileName: "Awards.pdf",
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

    //filter button clicked
    if (this.grid && args.item.id === "show_presented") {
      if (this.filtering) {
        this.grid.clearFiltering();
        this.filtering = false;
        args.item.text = "Hide Previously Presented";
      } else {
        this.grid.filterByColumn("previouslyPresented", "equal", false);
        this.filtering = true;
        args.item.text = "Show Previously Presented";
      }
    }

    //save button clicked
    if (this.grid && args.item.id === "present_awards") {
      const selectedRecords = this.grid.getSelectedRecords() as SummitAchievement[];
      if (selectedRecords.length > 0) {
        const items = this.state.items.filter((item) => item.presented != "No" || selectedRecords.some((selected) => selected.id === item.id));
        this.props.onUpdate(items);
        console.log(items);
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
    { text: "Show Previously Presented", tooltipText: "Show only presented awards", prefixIcon: "e-filter icon", id: "show_presented" },
    { text: "Save Changes", tooltipText: "Mark selected awards presented", prefixIcon: "e-save icon", id: "present_awards", align: "Right" },
  ];

  selectionSettings = { checkboxOnly: true, type: "Multiple", mode: "Row" };

  rowDataBound = (args: RowDataBoundEventArgs) => {
    if ((args.data as SummitAchievement).presented !== "No") {
      this.selIndex.push(parseInt((args.row as HTMLTableRowElement).getAttribute("aria-rowindex") as string, 0) - 1);
    }
  };

  dataBound = (): void => {
    if (this.grid && this.selIndex.length) {
      this.grid.selectRows(this.selIndex.reverse());
      this.selIndex = [];
      if (this.filtering) {
        this.grid.filterByColumn("previouslyPresented", "equal", false);
      } else {
        this.grid.clearFiltering();
      }
    }
  };

  rowSelected = (args: RowSelectEventArgs) => {
    if (args.isInteracted) {
      const item = this.state.items.find((item) => item.id === (args.data as SummitAchievement).id);
      if (item) {
        item.presented = item.dateAwarded;
        this.setState({
          items: this.state.items.map((stateItem) => (stateItem.id === item.id ? item : stateItem)),
        });
      }
    }
  };

  rowDeselected = (args: RowSelectEventArgs) => {
    if (args.isInteracted) {
      const item = this.state.items.find((item) => item.id === (args.data as SummitAchievement).id);
      if (item) {
        item.presented = "No";
        this.setState({
          items: this.state.items.map((stateItem) => (stateItem.id === item.id ? item : stateItem)),
        });
      }
    }
  };

  dateUpdated = async (args: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, id: string) => {
    const item = this.state.items.find((item) => item.id === id);
    if (item) {
      // const newItem = { ...item, presented: moment(args.target.value).format("DD/MM/YY") };
      // console.log(id);
      // console.log(moment(args.target.value).format("DD/MM/YY"));
      // item.presented = moment(args.target.value).format("DD/MM/YY");
      // console.log(newItem);
      // console.log(item);

      item.updatePresented(moment(args.target.value).format("DD/MM/YY"));
      console.log(item.presented);
      this.setState({
        items: this.state.items.map((stateItem) => (stateItem.id === id ? item : stateItem)),
      });
      console.log(this.state.items.find((item) => item.id === id)?.presented);
    }
  };

  presentedCellTemplate = (props: SummitAchievement) => {
    // show text if presented is "No" otherwise show date picker
    return !props.presented || props.presented === "No" ? (
      <span>No</span>
    ) : (
      <span>
        <DatePickerComponent
          value={moment(props.presented ?? "01/01/2000", "DD/MM/YYYY").toDate()}
          format="dd/MM/yy"
          showClearButton={false}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => this.dateUpdated(e, props.id)}
        />
      </span>
    );
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
          dataBound={this.dataBound}
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
          filterSettings={{ type: "" }}
          toolbarClick={this.toolbarClick}
          ref={(g: GridComponent | null) => (this.grid = g)}
          rowSelected={this.rowSelected}
          rowDeselected={this.rowDeselected}
          allowPaging={true}
          pageSettings={{ pageSize: 100 }}
        >
          <ColumnsDirective>
            <ColumnDirective field="member" headerText="Name" width="100" textAlign="Left" />
            <ColumnDirective field="type" headerText="Type" width="100" textAlign="Left" />
            <ColumnDirective field="achievementName" headerText="Award" width="100" textAlign="Left" />
            <ColumnDirective field="dateAwarded" headerText="Date" width="100" textAlign="Left" />
            <ColumnDirective field="presented" headerText="Presented" width="100" template={this.presentedCellTemplate} />
            <ColumnDirective field="previouslyPresented" visible={false} />
            <ColumnDirective headerText="Present" width="50" type="checkbox" />
          </ColumnsDirective>
          <Inject services={[Toolbar, PdfExport, ExcelExport, Sort, Group, Filter, Page]} />
        </GridComponent>
      </>
    ) as React.ReactNode;
  }
}
