import { PaginationData, SortData } from '@type/table.type';
import { Dispatch, SetStateAction } from 'react';

/**
 * Updates the sorting state in the table
 * @param setSort state setter function for the sort data
 * @param key specific key in the `SortData` to update
 * @param value new value for the key
 */
export function changeSort<K extends keyof SortData>(
    setSort: Dispatch<SetStateAction<SortData[]>>,
    key: K,
    value: SortData[K]
) {
    setSort((prev) => ({
        ...prev,
        [key]: value
    }));
}

/**
 * Updates the pagination state in the table
 * @param setPagination state setter function for the pagination data
 * @param key The specific key in the `PaginationData` to update
 * @param value new value for the key
 */
export function changePagination<K extends keyof PaginationData>(
    setPagination: Dispatch<SetStateAction<PaginationData>>,
    key: K,
    value: PaginationData[K]
) {
    setPagination((prev) => ({
        ...prev,
        [key]: value
    }));
}