/* eslint-disable @typescript-eslint/ban-ts-comment */
import { OasReportItem } from "../classes/OasReportItem"; //OasReportSubItem
//import { TableCellLayout, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, FluentProvider, TableColumnDefinition, createTableColumn, teamsLightTheme } from "@fluentui/react-components";
import React from "react";

interface MilestoneReportTableProps {
  items: OasReportItem[];
  onUpdate: (items: OasReportItem[]) => void;
  //sortState: Parameters<NonNullable<MilestoneReportTableProps["onSortChange"]>>[1];
}

export class MilestoneReportTable extends React.Component<MilestoneReportTableProps> {
  // columns: TableColumnDefinition<OasReportItem>[] = [
  //   createTableColumn<OasReportItem>({
  //     columnId: "name",
  //     compare: (a, b) => {
  //       return a.name.localeCompare(b.name);
  //     },
  //     renderHeaderCell: () => <b>Name</b>,
  //     renderCell: (item: OasReportItem) => {
  //       return <TableCellLayout>{item.name}</TableCellLayout>;
  //     },
  //   }),
  // ];

  constructor(props: MilestoneReportTableProps) {
    super(props);
    this.state = {
      items: props.items,
      sortState: { sortColumn: "file", sortDirection: "ascending" },
    };
    // ["bushwalking", "bushcraft", "camping", "alpine", "cycling", "vertical", "aquatics", "boating", "paddling"].forEach((activity) => {
    //   this.columns.push(
    //     createTableColumn<OasReportItem>({
    //       columnId: activity,
    //       renderHeaderCell: () => <b>{activity.charAt(0).toUpperCase() + activity.slice(1)}</b>,
    //       renderCell: (item: OasReportItem) => {
    //         item[activity]
    //           .map(
    //             (stream: OasReportSubItem) =>
    //               "<center style='line-height: 0.7'><b>" + stream.stage + "</b><br><span style='font-size:small'>" + stream.stream.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>",
    //           )
    //           .join("<br>");
    //       },
    //     }),
    //   );
    // });
  }

  // onSortChange = (e, nextSortState) => {
  //   this.setSortState(nextSortState);
  // };

  // setSortState = (nextSortState: Parameters<NonNullable<MilestoneReportTable["onSortChange"]>>[1]) => {
  //   this.setState({ sortState: nextSortState });
  // };

  render(): React.ReactNode {
    return (
      //   // @ts-ignore
      //   <FluentProvider theme={teamsLightTheme}>
      //     <DataGrid items={this.props.items} columns={this.columns} sortable sortState={this.props.sortState} onSortChange={this.onSortChange} getRowId={(item: OasReportItem) => item.name} focusMode="none" selectionAppearance="none">
      //       <DataGridHeader>
      //         <DataGridRow>{({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}</DataGridRow>
      //       </DataGridHeader>
      //       <DataGridBody<OasReportItem>>
      //         {({ item, rowId }: { item: OasReportItem; rowId: string }) => (
      //           <DataGridRow<OasReportItem> key={rowId}>
      //             {({ renderCell }) => (
      //               <DataGridCell align="center" valign="middle">
      //                 {renderCell(item)}
      //               </DataGridCell>
      //             )}
      //           </DataGridRow>
      //         )}
      //       </DataGridBody>
      //     </DataGrid>
      //   </FluentProvider>
      <></>
    ) as React.ReactNode;
  }
}
