/* eslint-disable react/jsx-closing-bracket-location */
import React from 'react';
import { L10n } from '@syncfusion/ej2-base';
import { ColumnDirective, ColumnsDirective, ExcelExport, GridComponent, Group, Inject, PdfExport, Sort, Toolbar } from '@syncfusion/ej2-react-grids';
import { TerrainEvent } from '@/types/terrainTypes';
import SummitAchievement from '../models/SummitAchievement';

// Define custom text for 'EmptyRecord'
L10n.load({
  'en-US': {
    grid: {
      EmptyRecord: 'Loading Records...',
    },
  },
});

interface AwardsTableState {
  items: SummitAchievement[];
}

interface AwardsTableProps {
  items: SummitAchievement[];
  // eslint-disable-next-line react/no-unused-prop-types, no-unused-vars
  onUpdate: (storeEvent: TerrainEvent) => void;
}

export default class AwardsTable extends React.Component<AwardsTableProps, AwardsTableState> {
  constructor(props: AwardsTableProps) {
    super(props);
    this.state = {
      items: props.items,
    };
  }

  componentDidUpdate(prevProps: AwardsTableProps) {
    const { items } = this.props;
    if (items !== prevProps.items) {
      this.setState({
        items,
      });
    }
  }

  render(): React.ReactNode {
    const { items } = this.state;
    return (
      <GridComponent
        id="Grid"
        dataSource={items}
        allowResizing
        allowGrouping
        toolbar={['Print', 'PdfExport', 'ExcelExport']}
        allowPdfExport
        allowExcelExport
        allowSorting
        locale="en-US"
        groupSettings={{
          columns: ['member'],
        }}>
        <ColumnsDirective>
          <ColumnDirective field="member" headerText="Name" width="100" textAlign="Left" />
          <ColumnDirective field="type" headerText="Type" width="100" textAlign="Left" />
          <ColumnDirective field="achievementName" headerText="Award" width="100" textAlign="Left" />
          <ColumnDirective field="dateAwarded" headerText="Date" width="100" textAlign="Left" />
          <ColumnDirective field="presented" headerText="Presented" width="100" textAlign="Left" />
        </ColumnsDirective>
        <Inject services={[Toolbar, PdfExport, ExcelExport, Sort, Group]} />
      </GridComponent>
    ) as React.ReactNode;
  }
}
