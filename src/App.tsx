import { ColumnDirective, ColumnsDirective, GridComponent } from '@syncfusion/ej2-react-grids'
import React from 'react'

interface MilestoneReportTableProps {
  data: any[]
}

export default function MilestoneReportTable ({ data }: MilestoneReportTableProps): JSX.Element {
  return (
    <GridComponent dataSource={data}>
      <ColumnsDirective>
        <ColumnDirective field='id' headerText='ID' width='100' textAlign='Right' />
        <ColumnDirective field='name' headerText='Name' width='150' />
        <ColumnDirective field='status' headerText='Status' width='150' />
        {/* Add more columns as needed */}
      </ColumnsDirective>
    </GridComponent>
  )
}
