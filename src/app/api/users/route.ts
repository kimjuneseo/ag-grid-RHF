import { PaginationData, SortData } from '@type/table.type';
import { NextResponse } from 'next/server';

interface ListRequestBody {
    pagination: PaginationData;

    sort?: SortData[]
}

// 1. 더미 데이터 (테스트를 위해 25개로 확장)
const DUMMY_USERS = [
    { id: 1, name: '김준서', phone: '010-1234-5678' },
    { id: 2, name: '김철수', phone: '010-2234-5678' },
    { id: 3, name: '박종연', phone: '010-5234-5678' },
    { id: 4, name: '김종수', phone: '010-6234-5678' },
    { id: 5, name: '나희', phone: '010-7723-5678' },
    { id: 6, name: '존 보글', phone: '010-9234-5678' },
    { id: 7, name: '이순신', phone: '010-1111-2222' },
    { id: 8, name: '유관순', phone: '010-3333-4444' },
    { id: 9, name: '강감찬', phone: '010-5555-6666' },
    { id: 10, name: '홍길동', phone: '010-7777-8888' },
    { id: 11, name: '제임스', phone: '010-9999-0000' },
    { id: 12, name: '앨리스', phone: '010-1212-3434' },
    { id: 13, name: '밥', phone: '010-5656-7878' },
    { id: 14, name: '찰리', phone: '010-1010-2020' },
    { id: 15, name: '다니엘', phone: '010-3030-4040' },
    { id: 16, name: '에밀리', phone: '010-5050-6060' },
    { id: 17, name: '프랭크', phone: '010-7070-8080' },
    { id: 18, name: '그레이스', phone: '010-9090-1111' },
    { id: 19, name: '해리', phone: '010-2222-3333' },
    { id: 20, name: '아이비', phone: '010-4444-5555' },
    { id: 21, name: '잭', phone: '010-6666-7777' },
    { id: 22, name: '카렌', phone: '010-8888-9999' },
    { id: 23, name: '리암', phone: '010-0000-1111' },
    { id: 24, name: '미아', phone: '010-1111-3333' },
    { id: 25, name: '노아', phone: '010-3333-5555' },
];

// 3. GET이 아닌 POST 함수로 변경합니다.
export async function POST(request: Request) {
    // 4. request.json()으로 Body 데이터를 파싱합니다.
    const body: ListRequestBody = await request.json();
    
    // 5. Body에서 파라미터를 추출합니다.
    const { currentPage, rowsPerPage } = body.pagination ?? {};
    const sort = body.sort || []; // 👈 정렬 배열
    const total = DUMMY_USERS.length;

    // 6. 정렬 로직 (배열 사용)
    // (AG Grid는 보통 첫 번째 정렬을 우선하므로, sort[0]을 사용)
    if (sort.length > 0) {
        const { sortName, isASC } = sort[0];
        
        if (sortName === 'name' || sortName === 'phone') {
            DUMMY_USERS.sort((a, b) => {
                const valA = a[sortName as keyof typeof a]; // 타입 추론
                const valB = b[sortName as keyof typeof b];
                
                if (valA < valB) return isASC ? -1 : 1;
                if (valA > valB) return isASC ? 1 : -1;
                return 0;
            });
        }
    }

    // 7. 페이지네이션
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = currentPage * rowsPerPage;
    const paginatedData = DUMMY_USERS.slice(startIndex, endIndex);

    // 8. 응답 반환 (동일)
    return NextResponse.json({
        data: paginatedData,
        pagination: {
            currentPage,
            rowsPerPage,
            totalPages: Math.ceil(total / rowsPerPage)
        },
    });
}