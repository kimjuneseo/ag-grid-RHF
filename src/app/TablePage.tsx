'use client'; 

import NewGridTable from '@components/grid-form/NewGridTable';
import { useState, useEffect } from 'react';
import { DEFAULT_PAGINATION, PaginationData, SortData } from '@type/table.type';
import { changePagination } from '@utils/table.util';

export default function TablePage() {
    const [rowData, setRowData] = useState([]);
    const [pagination, setPagination] = useState<PaginationData>(DEFAULT_PAGINATION);
    const [sort, setSort] = useState<SortData[]>([]);

    const fetchData = async () => {
        // 1. API에 보낼 Body 객체를 준비합니다.
        const requestBody = { pagination, sort };

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
        changePagination(setPagination, 'totalPages', result.pagination.totalPages);
    };

    // 3. 정렬이나 페이지가 변경되면 데이터 다시 호출 (동일)
    useEffect(() => {
        fetchData();
      }, [pagination.currentPage, pagination.rowsPerPage, sort]);

    return (
        <div className="ag-theme-alpine" style={{ width: '500px', height: '500px' }}>
            <NewGridTable
                rowData={rowData}
                columnDefs={[
                    { headerName: 'Name', field: 'name' },
                    { headerName: 'phone', field: 'phone' }
                ]}
                sortProps={{ sort, setSort }}
                paginationProps={{ pagination, setPagination }}
            />
        </div>
    );
}