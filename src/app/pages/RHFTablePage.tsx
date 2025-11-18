'use client'; 

import { useState, useEffect } from 'react';
import { SortData } from '@type/table.type';
import GridFormTable from '@components/grid-form/GridFormTable';
import { GridFormTableColumnProps } from '@type/grid-form-table.type';
import RHFInput from '@components/RHFInput';

interface UserData {
    userIndex?: string;
    
    name?: string;

    phone?: string;
}

export default function RHFTablePage() {
    const [rowData, setRowData] = useState<UserData[]>([{
        userIndex: '1',
        name: '김준서',
        phone: '010-1111-2222'
    }, {
        userIndex: '2',
        name: '김철수',
        phone: '010-3333-5555'
    }, {
        userIndex: '3',
        name: '박철수',
        phone: '010-0000-0000'
    }, {
        userIndex: '4',
        name: '김영히',
        phone: '010-5512-9999'
    }
]);
    const [sort, setSort] = useState<SortData[]>([]);

    // const fetchData = async () => {
    //     // 1. API에 보낼 Body 객체를 준비합니다.
    //     const requestBody = { sort };

    //     // 2. fetch를 POST 방식으로 변경합니다.
    //     const res = await fetch(
    //         '/api/users', // 👈 새 API 엔드포인트
    //         {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(requestBody), // 👈 Body에 JSON으로 실어 보냄
    //         }
    //     );
        
    //     const result = await res.json();

    //     setRowData(result.data);
    // };

    const columns: GridFormTableColumnProps<UserData>[] = [
        { 
            headerName: 'Name', 
            field: 'name',
            render: ({ RHFProps }) => {
                return <RHFInput
                    {...RHFProps}
                />;
            }
        },
        { 
            headerName: 'phone', 
            field: 'phone',
            render: ({ RHFProps }) => {
                return <RHFInput
                    {...RHFProps}
                />;
            }
        }
    ]

    // 3. 정렬이나 페이지가 변경되면 데이터 다시 호출 (동일)
    // useEffect(() => {
    //     fetchData();
    //   }, [sort]);

    return (
        <div className="ag-theme-alpine" style={{ width: '500px', height: '500px' }}>
            <GridFormTable<UserData>
                dataUniqueId='userIndex'
                dataExisting={[]}
                dataDefault={{
                    name: '',
                    phone: ''
                }}
                columns={columns}
                rowData={rowData}
                sortProps={{ sort, setSort }}
            />
        </div>
    );
}