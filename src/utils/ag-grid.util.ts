import { GridApiType } from '@type/grid-form-table.type';
import { PaginationData } from '@type/table.type';
import { 
    GridApi, ICellRendererParams, IRowNode, RowClickedEvent, RowDataUpdatedEvent 
} from 'ag-grid-community';
import { FieldValues } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get actual row number
 * @param number index row
 * @returns actual row number
 */
export function getRowNumber(number: number | null) {
    return number as number + 1;
}

/**
 * 페이지 네이션 데이터를 받아 계산해 리턴함함
 * @param no params.node.rowIndex ag-grid 로우 인덱스
 * @param pagination 페이지네이션 데이터
 * @returns
 */
export function getRowPaginationNumber(no: number | null, pagination?: PaginationData | undefined) {
    const size = pagination?.rowsPerPage ?? 0;
    const page = pagination?.currentPage ?? 0;

    return (size * (page - 1)) + Number(no) + 1;
}

/**
 * 그리드에서 선택된 로우 선택
 * @param gridApi ag-grid api
 * @param key mngid 비교할 키
 * @param mngId mngid
 */
export function gridSelectRow(gridApi: GridApi, key: string, mngId: string) {
    const selectRow = getSelectRow(gridApi, key, mngId);

    if (selectRow){
        selectRow.setSelected(true);
    }
}

/**
 * 그리드에서 선택된 로우 반환
 * @param gridApi ag-grid api
 * @param key mngid 비교할 키
 * @param mngId mngid
 */
export function getSelectRow(gridApi: GridApi, key: string, mngId: string): IRowNode | null {
    let result: IRowNode | null = null;

    gridApi.forEachNode((node: IRowNode) => {
        if (node.data?.[key] === mngId) {
            result = node;
            return;
        }
    });

    return result;
}

/**
 * 그리드에서 선택된 로우 Ref에 저장하고 선택함
 * @param ref 선택된 로우를 저장할 ref
 * @param gridApi ag-grid api
 * @param key mngid 비교할 키
 * @param value mngid
 * @returns 선택된 로우
 */
export function gridSetSelectedRow(ref: React.MutableRefObject<IRowNode | null>, gridApi: GridApi, key: string, value: string) {
    const node = getSelectRow(gridApi, key, value);

    ref.current = node;
    node?.setSelected(true);
}

/**
 * 데이터 없을 때 출력되는 메세지 변경해주는 함수
 * @param message 출력 메세지
 * @param gridApi 그리드 API
 */
export function gridSetNoRowsMessage(message: string, gridApi: GridApiType) {
    if (!gridApi) {
        return;
    }

    gridApi.setGridOption('overlayNoRowsTemplate', `${message}`);
    gridApi.showNoRowsOverlay();
}

/**
 * 그리드 중 수정, 신규 row가 있는지 체크하는 함수
 * @param gridApis 그리드 API
 * @returns 수정, 신규 row가 있는지 여부
 */
export function gridGetHasUnsavedChangeGrid(gridApis: (GridApiType)[]): boolean {
    return gridApis.some((api) => {
        if (api?.getDisplayedRowCount() && api?.getDisplayedRowCount() > 0) {
            return api?.getRenderedNodes()
                .some((node) => node.data?.status);
        }

        return false;
    });
}

/**
 * Custom comparator for Ag-Grid columns
 * Currently returns 0 (no sorting effect)
 *
 * @returns Always returns 0
 */
export function customComparator() {
    return 0;
}

/**
 * 그리드에 신규 리스트 추가 함수
 * @param gridApi 그리드 API
 * @param rows 추가할 리스트
 */
export function gridAddNewRows(gridApi: GridApiType, rows: object[]) {
    if (!gridApi || !rows.length) {
        return;
    }

    const addList = rows.map((data) => ({ ...data, rowId: uuidv4(), status: 'created' }));

    gridApi?.applyTransaction({ add: addList });
}

/**
 * Handle file upload changed
 * @param id primary key
 * @param params event source
 */
export function handleFileUpload<T>(id: keyof T,params: ICellRendererParams) {
    const data: T = params.data;

    if (data[id]) {
        params.node.setData({
            ...data,
            status: 'modified'
        });
    }
}

/**
 * Triggered when a data row changes in the table
 * @param event event source
 * @param selectedRowId current selected row ID
 * @param primaryKey primary unique key
 * @param primaryId primary key value
 * @param gridApi grid Api
 * @param t - Translation function
 */
export function triggerRowSelection<T extends FieldValues>(event: RowDataUpdatedEvent, selectedRowId: string, primaryKey: keyof T, primaryId: string, gridApi?: GridApi | null, t?: (key: string) => string) {
    const selectedNodes = event.api.getSelectedNodes();
    const renderedNodes = event.api.getRenderedNodes();
    const targetedNode1 = renderedNodes.find((node) => node.data.rowId === selectedRowId);
    const targetedNode2 = renderedNodes.find((node) => node.data[primaryKey] === primaryId);
    const nodeSelected = selectedNodes.length ? selectedNodes[0] : targetedNode1 ? targetedNode1 : targetedNode2 ? targetedNode2 : renderedNodes.length ? renderedNodes[0] : '';

    if (gridApi && t && renderedNodes.length === 0) {
        gridSetNoRowsMessage(t('no_data'), gridApi);
    }

    if (nodeSelected) {
        const rowClickedEvent: RowClickedEvent = {
            type: 'rowClicked',
            node: nodeSelected,
            data: nodeSelected.data,
            rowIndex: nodeSelected.rowIndex,
            rowPinned: nodeSelected.rowPinned,
            api: event.api,
            context: event.api.getGridOption('context'),
            isEventHandlingSuppressed: false
        };

        nodeSelected.setSelected(true);
        event.api.dispatchEvent(rowClickedEvent);
    }
}