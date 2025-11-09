import NewGridTable from '@components/grid-form/NewGridTable'
import { ICellRendererParams } from 'ag-grid-community'

export default function TablePage() {

  return (
    <div style={{ width: '500px', height: '500px' }}>
      <NewGridTable
        rowData={[
          { name: '김준서', phone: '010-1234-5678' },
          { name: '김철수', phone: '010-2234-5678' },
          { name: '박종연', phone: '010-5234-5678' },
          { name: '김종수', phone: '010-6234-5678' },
          { name: '나희', phone: '010-7723-5678' },
          { name: '존 보글', phone: '010-9234-5678' }
        ]}  
        columnDefs={[
          {
            headerName: 'Name',
            field: 'name',
            cellRenderer: (params: ICellRendererParams) => {
              return <div>{params.value}</div>;
            }
          }, {
            headerName: 'phone',
            field: 'phone',
            cellRenderer: (params: ICellRendererParams) => {
              return <div>{params.value}</div>;
            }
          }
        ]}
      />
    </div>
  )
}
