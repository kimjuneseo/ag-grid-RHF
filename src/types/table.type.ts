import { AgGridReactProps } from 'ag-grid-react';
import { Dispatch, SetStateAction } from 'react';

// 기본 유형 페이지 설정
export const DEFAULT_PAGINATION: PaginationData = {
    totalPages: 1,
    currentPage: 1,
    rowsPerPage: 10
};

export const DEFAULT_NO_PAGINATION: PaginationData = {
    totalPages: 1,
    currentPage: 1,
    rowsPerPage: 99999
};

// pagination information
export interface PaginationData {
    // total number of pages
    totalPages: number;
    
    // current page
    currentPage: number;

    // number of rows per page
    rowsPerPage: number;
}

// pagination props
export interface PaginationDataProps {
    // pagination information
    pagination: PaginationData;

    // handle change pagination values
    setPagination: Dispatch<SetStateAction<PaginationData>>;
}

// sort information
export interface SortData {
    // sort field key
    sortName: string;

    // sort order
    isASC: boolean;
}

// sort props
export interface SortDataProps {
    // sort information
    sort: SortData[];

    // handle change sorting values
    setSort: Dispatch<SetStateAction<SortData[]>>;
}

export interface GridTableProps extends AgGridReactProps {
    // pagination props
    paginationProps?: PaginationDataProps;
    
    // sort props
    sortProps?: SortDataProps;
}