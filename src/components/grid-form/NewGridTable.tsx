import NewPagination from '@components/pagination/NewPagination';
import { GridTableProps } from '@type/table.type';
import { classMerge } from '@utils/css.util';
import {
    AllCommunityModule, ColumnState, GridApi, GridReadyEvent, ICellRendererParams, ModuleRegistry, SortChangedEvent
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useRef } from 'react';


export default function NewGridTable({
    columnDefs,
    defaultColDef,
    paginationProps,
    sortProps,
    onRowDataUpdated,
    onGridReady,
    ...others
}: GridTableProps) {
    const gridRef = useRef<GridApi | null>(null);
    const setSort = sortProps?.setSort;
    const sort = sortProps?.sort;
    const stableColumnDefs = useMemo(() => columnDefs?.map((columnDef) => ({
        wrapText: true,
        autoHeight: true,
        ...columnDef,
        cellRenderer: (params: ICellRendererParams) => {
            // 하단 합계 데이터
            if (params.node.rowPinned) {
                const rawValue = params.value;
                const isNumeric = typeof params?.value === 'number' ? true : !isNaN(params?.value?.replaceAll(',', ''));

                // 합계 데이터가 없을시
                if (rawValue === undefined) {
                    return;
                }

                return (<div className={classMerge(
                    'flex',
                    // 숫자 오른쪽 정렬, 문자 가운데 정렬
                    isNumeric ? 'w-full justify-end pinnedCol' : ''
                )}
                >
                    <span className="flex items-center font-bold text-[#424242]">{rawValue}</span>
                </div>);
            }

            return 'cellRenderer' in columnDef
                ? columnDef.cellRenderer?.(params) ?? params.value
                : params.value;
        }
    })), [columnDefs]);

    useEffect(() => {
        renderSort();
    }, [sort]);

    ModuleRegistry.registerModules([AllCommunityModule]);

    /**
     * ag-grid에 정렬 세팅
     */
    function renderSort() {
        if (gridRef.current) {
            const defaultSort: ColumnState[] = sort?.map(({ isASC, sortName }) => ({
                colId: sortName,
                sort: isASC ? 'asc' : 'desc'
            })) ?? [];

            gridRef.current.applyColumnState({ state:  defaultSort });
        }
    }

    /**
     * 정렬 변경 이벤트 처리
     */
    function handleSortChanged(params: SortChangedEvent) {
        const colState = params.api.getColumnState();
        const sortRow = colState
            .filter((s) =>  s.sort !== null)
            .map((s) => ({
                sortName: s.colId,
                isASC: s.sort === 'asc'
            }));

        setSort?.(sortRow);
    }

    /**
     * 그리드 초기화 이벤트 처리
     */
    function handleGridReady(event: GridReadyEvent) {
        gridRef.current = event.api;

        event.api.sizeColumnsToFit();
        renderSort();
        onGridReady?.(event);
    }

    return (
        <div
            className="w-full h-full grid relative"
            style={{ gridTemplateRows: '1fr auto' }}
        >
            <AgGridReact
                defaultColDef={{
                    flex: 1,
                    ...defaultColDef
                }}
                rowSelection={{
                    mode: 'singleRow',
                    checkboxes: false,
                    enableClickSelection: true
                }}
                columnDefs={stableColumnDefs}
                onSortChanged={handleSortChanged}
                onGridReady={handleGridReady}
                suppressCellFocus={false}
                suppressDragLeaveHidesColumns={true}
                overlayNoRowsTemplate="데이터가 없습니다."
                overlayLoadingTemplate="로딩중입니다."
                onRowDataUpdated={onRowDataUpdated}
                {...others}
            />
            {paginationProps && <NewPagination paginationProps={paginationProps} /> }
        </div>
    );
}