'use client'; 

import { useState, useEffect } from 'react';
import { SortData } from '@type/table.type';
import GridFormTable from '@components/grid-form/GridFormTable';

export default function RHFTablePage() {
    const [rowData, setRowData] = useState([]);
    const [sort, setSort] = useState<SortData[]>([]);

    const fetchData = async () => {
        // 1. API에 보낼 Body 객체를 준비합니다.
        const requestBody = { sort };

        // 2. fetch를 POST 방식으로 변경합니다.
        const res = await fetch(
            '/api/users', // 👈 새 API 엔드포인트
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody), // 👈 Body에 JSON으로 실어 보냄
            }
        );
        
        const result = await res.json();

        setRowData(result.data);
    };

    // 3. 정렬이나 페이지가 변경되면 데이터 다시 호출 (동일)
    useEffect(() => {
        fetchData();
      }, [sort]);

    return (
        <div className="ag-theme-alpine" style={{ width: '500px', height: '500px' }}>
            <GridFormTable
                columns={[
                    { headerName: 'Name', field: 'name' },
                    { headerName: 'phone', field: 'phone' }
                ]}
                
                rowData={rowData}
                sortProps={{ sort, setSort }}
            />
        </div>
    );
}