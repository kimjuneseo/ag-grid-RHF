// import { useState } from 'react'
import './App.css'
import NewGridTable from '@components/grid-form/NewGridTable'
import { ICellRendererParams } from 'ag-grid-community'

function App() {

  return (
    <div style={{ width: '500px', height: '500px' }}>
      <NewGridTable
        rowData={[
          { name: 'John', phone: '010-1234-5678' },
          { name: 'Jane', phone: '010-1234-5678' },
          { name: 'Jim', phone: '010-1234-5678' },
          { name: 'Jill', phone: '010-1234-5678' },
          { name: 'John', phone: '010-1234-5678' },
          { name: 'Jane', phone: '010-1234-5678' },
          { name: 'Jim', phone: '010-1234-5678' },
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

export default App
