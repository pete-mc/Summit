// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Item } from "../classes/Item";
import { DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, FluentProvider, TableColumnDefinition, createTableColumn, teamsLightTheme } from "@fluentui/react-components";
import React, { PureComponent } from "react";
import { ReactNode } from "react";

interface ReactTableProps {
  items: Item[];
  onUpdate: (items: Item[]) => void;
}

export class ReactTable extends PureComponent<ReactTableProps> {
  columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "name",
      renderHeaderCell: () => <b>Name</b>,
      renderCell: (item: Item) => item.name,
    }),
    createTableColumn<Item>({
      columnId: "age",
      renderHeaderCell: () => <b>Age</b>,
      renderCell: (item: Item) => item.age,
    }),
    createTableColumn<Item>({
      columnId: "personId",
      renderHeaderCell: () => <b>Person ID</b>,
      renderCell: (item: Item) => item.personId,
    }),
  ];

  constructor(props: ReactTableProps) {
    super(props);
    this.state = {
      items: props.items,
    };
  }
  render() {
    return (
      <FluentProvider theme={teamsLightTheme}>
        <DataGrid items={this.props.items} columns={this.columns} sortable getRowId={(item: Item) => item.name} focusMode="none" selectionAppearance="none">
          <DataGridHeader>
            <DataGridRow>{({ renderHeaderCell }: { renderHeaderCell: () => ReactNode }): JSX.Element => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}</DataGridRow>
          </DataGridHeader>
          <DataGridBody<Item>>{({ item, rowId }: { item: Item; rowId: string }) => <DataGridRow<Item> key={rowId}>{({ renderCell }: { renderCell: ReactNode }) => <DataGridCell>{renderCell(item)}</DataGridCell>}</DataGridRow>}</DataGridBody>
        </DataGrid>
      </FluentProvider>
    );
  }
}
