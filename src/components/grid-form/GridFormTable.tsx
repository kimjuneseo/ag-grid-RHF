import GridAddButton from '@components/grid-form/GridAddButton';
import GridRemoveButton from '@components/grid-form/GridRemoveButton';
import NewGridTable from '@components/grid-form/NewGridTable';
import {
    GridFormParams,
    GridFormTableColumnProps,
    GridFormTableValidationProps,
    GridStatus,
    GridValues
} from '@type/grid-form-table.type';
import { Answer } from '@type/http';
import { SortDataProps } from '@type/table.type';
import { gridGetHasUnsavedChangeGrid } from '@utils/ag-grid.util';
import { formErrors } from '@utils/form.util';
import {
    ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams,
    SortChangedEvent, ColumnState,
    RowDragMoveEvent,
    RowClickedEvent
} from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';
import { AxiosResponse } from 'axios';
import { omit, partition } from 'lodash';
import React, {
    RefObject, useEffect, useMemo, useRef, useState
} from 'react';
import {
    FieldErrors, FieldValues, Path, useForm, UseFormReturn
} from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
// 디버깅용 삭제 x
// import { DevTool } from '@hookform/devtools';

type RenderType = 'DEFALUT' | 'MULTIPLE-TABLE' | 'MULTIPLE-TABLE-READONLY';

export interface GridFormTableProps<T extends FieldValues> extends AgGridReactProps {
    // 에러 타입
    validationAlertType?: 'single' | 'multi';

    // 테이블 보더 행, 열
    borderMode?: 'insert' | 'select';

    // Columns for the table with validation properties
    columns: GridFormTableColumnProps<T>[];

    // Check to set an add column order
    columnAddOrder?: 'first' | 'last';

    // Default parameter for adding rows
    dataDefault: T;

    // Existing rows
    dataExisting: T[];

    // Unique key in data for identifying rows
    dataUniqueId: keyof T;

    // Table name
    tableNm?: string;

    // Show add button
    hasAddBtn?: boolean;

    // Show remove button
    hasRemoveBtn?: boolean;

    // Show status column
    hasStatusColumn?: boolean;

    // Draggable table
    isDraggable?: boolean;

    // 선택시에만 수정가능한 로우로 변경할지 여부
    renderType?: RenderType;

    // Optional reference for submit button
    submitRef?: RefObject<HTMLButtonElement>;

    // sort props
    sortProps?: SortDataProps;

    // Custom add function
    customAddFunction?: () => void;

    // Custom delete function
    customDeleteFunction?: (id: string | string[], params: ICellRendererParams) => Promise<string>;

    // Delete function
    deleteFunction?: (id: string | string[]) => Promise<AxiosResponse<Answer<string>>>

    // Unique conditional function to hide remove btn
    isHideRemoveBtn?: (value: T) => boolean;

    // Handle delete function
    onDelete?: (id?: string, methods?: UseFormReturn<GridFormParams<T>>, params?: ICellRendererParams) => Promise<void>;

    // Handle form error
    onFormError?: (errors: FieldErrors) => void;

    // Handle form methods values
    onFormMethodsReady?: (methods: UseFormReturn<GridFormParams<T>>) => void;

    // Handle submit function
    onSubmit?: (params: T[]) => Promise<void>;

    // Handle GridReady function
    onGridReady?:  (params: GridReadyEvent) => void;

    // Grid 테이블에 데이터 값이 변경될때마다 실행되는 함수
    onGridDataChange?: () => void;
}

export default function GridFormTable<T extends GridValues>({
    borderMode = 'insert',
    columns,
    columnAddOrder = 'first',
    dataDefault,
    dataExisting,
    dataUniqueId,
    hasAddBtn = true,
    hasRemoveBtn = true,
    hasStatusColumn = true,
    isDraggable = false,
    submitRef,
    sortProps,
    customAddFunction,
    customDeleteFunction,
    deleteFunction,
    isHideRemoveBtn,
    onRowClicked,
    onDelete,
    onFormError,
    onFormMethodsReady,
    onSubmit,
    onGridReady,
    onGridDataChange,
    ...agGridProps
}: GridFormTableProps<T>) {
    // ref
    const selectRowIdRef = useRef(''); // 선택시에만 수정 가능한 행으로 랜더링 해주기 위해 현재 선택된 행 rowId를 위한 ref
    const onDeleteRef = useRef(onDelete); // onDelete 함수가 항상 최신 상태를 유지하도록 하기 위한 ref
    const prevSortModelRef = useRef<ColumnState[]>([]); // 이전 정렬 상태 저장용 ref
    const isRestoringSortRef = useRef(false); // 정렬 복구 중인지 여부
    // hook-form
    const methods = useForm<GridFormParams<T>>({
        defaultValues: { dataForm: {} }
    });
    // state
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    // status mapping for grid display
    const statusValue = {
        'default': {
            text: '',
            color: ''
        },
        'created': {
            text: '신규',
            color: 'red'
        },
        'modified': {
            text: '수정',
            color: 'blue'
        }
    };
    // 유틸함수
    const asSafeText = (v: unknown) => (v == null || typeof v === 'object') ? '' : String(v);
    // ag-grid variables
    const columnDefs = useMemo(() => {
        // 행 추가 컬럼
        const columnAdd = (hasAddBtn || hasRemoveBtn) ? [{
            field: 'addBtn',
            headerName: '',
            cellClass: 'justify-center items-center',
            minWidth: 60,
            maxWidth: 60,
            sortable: false,
            // '-' 행 삭제 버튼
            ...(hasRemoveBtn && {
                cellRenderer: (params: ICellRendererParams) => {
                    const data: T = params.data;
                    const rowId = data.rowId;
                    const isHideButton = rowId === undefined || isHideRemoveBtn?.(data);
                    const isRemovable = data['removable'] ?? true; // 항목의 removable 속성 가져오기 (없으면 true 설정)

                    // 삭제 버튼이 선택시에만 생겨야하는 경우
                    // 1. readonly, multi table 랜더링 = 행 선택시, 신규행
                    // 2. defaltu = isHideButton 빼고 모든 행
                    return isHideButton || !isRemovable ? null
                        : <GridRemoveButton onRemove={() => handleRemove(params, data, params.node.id ?? '', rowId)} />;
                }
            }),
            // '+' 행 추가 버튼
            ...(hasAddBtn && {
                headerComponent: () => <GridAddButton onAppend={handleAppend} />
            })
        }] : [];
        // 상태 컬럼
        const columnStatus = hasStatusColumn ? [{
            headerName: '상태',
            minWidth: 70,
            maxWidth: 70,
            sortable: false,
            cellRenderer: (params: ICellRendererParams) => {
                const statusData = statusValue[params.data.status as GridStatus ?? 'default'];

                return <div style={{ color: statusData.color }}>{statusData.text}</div>;
            }
        }] : [];
        // 순번 외 컬럼
        const [noCols, otherCols] = partition(columns, (col) => col.field?.toLowerCase() === 'no');
        // 순번 컬럼
        const noCol = noCols[0] || null;  // First 'no' column regardless of position

        // 순번이 있고, draggable 이면
        if (noCol) {
            noCol.rowDrag = isDraggable;
        }

        const columnFields: (ColDef | ColGroupDef)[] = [
            ...otherCols.map(({ cellRenderer, render, renderFunction, ...others }) => ({
                ...others,
                cellRenderer: (params: ICellRendererParams) => {
                    const { field } = others;
                    const data: T = params.data;
                    const currntRowId = data.rowId;
                    const fieldValue = field ? data[field] ?? dataDefault[field] : '';
                    
                    let content: React.ReactNode;

                    if (render) {
                        const fieldName = `dataForm.${currntRowId}.${field}` as Path<GridFormParams<T>>;
                        const validationProps: GridFormTableValidationProps<GridFormParams<T>> = {
                            name: fieldName,
                            control: methods.control,
                            inputRef: methods.register(fieldName, { value: fieldValue ?? '' }).ref
                        };
                        const renderedComponent = render({ methods, params, validationProps });

                        content = renderedComponent && React.cloneElement(renderedComponent, {
                            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                                renderedComponent.props?.onChange?.(event);
                                handleInputChange(field ?? '', params, event);
                            }
                        });
                    }
                    else if (renderFunction) {
                        const renderedComponent = renderFunction({ methods, params });

                        content = renderedComponent && React.cloneElement(renderedComponent, {
                            onChange: (eventParams: T[]) => {
                                renderedComponent.props?.onChange?.(eventParams);
                                handleInputChange(field ?? '', params);
                            }
                        });
                    }
                    else {
                        content = cellRenderer ? cellRenderer(params) : <span>{asSafeText(fieldValue)}</span>;
                    }

                    return content;
                },
                suppressKeyboardEvent: () => true
            }))
        ];
        // 순번 컬럼이 있을 때 앞에 붙여넣기
        const baseCols = [
            ...(noCol ? [noCol] : []),
            ...columnStatus,
            ...columnFields
        ];

        //'+' 버튼 순서에 따라 첫번 째, 마지막 배치
        return columnAddOrder === 'first' ? [...columnAdd, ...baseCols] : [...baseCols, ...columnAdd];
    }, [dataExisting, gridApi, methods]);
    const rowData = useMemo<T[]>(() => {
        return [];
    }, [dataExisting]);

    useEffect(() => {
        onFormMethodsReady?.(methods);
    }, []);

    useEffect(() => {
        resetAndApplyData(dataExisting);
    }, [dataExisting, gridApi]);

    useEffect(() => {
        onDeleteRef.current = onDelete;
    }, [onDelete]);

    /**
     * Handle reset and apply existing data
     * @param dataExisting Existing rows
     */
    async function resetAndApplyData(dataExisting: T[]) {
        if (!gridApi) {

            return;
        }

        methods.reset({ dataForm: {} });

        // Ensures the reset completes before proceeding
        // This allows the UI and state updates to process before moving on
        await Promise.resolve();

        if (dataExisting?.length) {
            const updatedData = dataExisting.reduce<Record<string, T>>((acc, item) => {
                const rowId = uuidv4();
                acc[rowId] = { ...item, rowId };
                return acc;
            }, {});

            methods.reset({ dataForm: updatedData });
            gridApi.applyTransaction({ add: Object.values(updatedData) });
        }
        else {
            methods.reset({ dataForm: {} });
        }
    }

    /**
     * Handle form submission
     * @param data multi data params
     */
    async function handleFormSubmit(data: GridFormParams<T>) {
        const dataForm = data.dataForm ?? [];
        const filteredData = Object.values(dataForm);
        const cleanedData = filteredData.map((item) => omit(item, ['id', 'rowId', 'status', 'addBtn']));

        await onSubmit?.(cleanedData as T[]);
        methods.reset({ dataForm: dataForm });
    }

    /**
     * Handle form errors with alert
     * @param errors list of input errors
     */
    function handleFormError(errors: FieldErrors) {
        onFormError?.(errors);
        formErrors<GridFormParams<T>>(errors, methods);
    }

    /**
     * Handle form delete
     * @param params
     * @param nodeId node unique id
     * @param rowId row unique id
     * @param data row data information
     */
    function handleRemove(params: ICellRendererParams, data: T, nodeId: string, rowId: string) {
        if (data[dataUniqueId]) {
            if (confirm('삭제하시겠습니다?')) {
                handleDelete?.(params, nodeId, rowId, data[dataUniqueId]);
            }
        }
        else {
            cleanupFieldArray(nodeId, rowId);
            onDeleteRef.current?.('', methods, params);
        }
    }

    /**
     * Handle form delete from API
     * @param params
     * @param nodeId node unique id
     * @param rowId row unique id
     * @param uniqueId primary id
     */
    async function handleDelete(params: ICellRendererParams, nodeId: string, rowId: string, uniqueId: string) {
        let isSuccess = '';

        if (customDeleteFunction) {
            isSuccess = await customDeleteFunction(uniqueId, params);
        }
        else if (deleteFunction) {
            isSuccess = await deleteFunction?.(uniqueId)
                .then(({ data }) => data.result);
        }

        if (isSuccess) {
            alert(isSuccess)
            cleanupFieldArray(nodeId, rowId);
            onDeleteRef.current?.(uniqueId, methods, params);
            
        }
    }

    /**
     * Cleanup field array
     * @param nodeId node unique id
     * @param rowId row unique id
     */
    function cleanupFieldArray(nodeId: string, rowId: string) {
        if (!gridApi) {
            return;
        }

        const rowNode = gridApi.getRowNode(nodeId);

        if (!rowNode) {
            return;
        }

        gridApi.applyTransaction({ remove: [rowNode.data] });
        methods.unregister(`dataForm.${rowId}` as Path<GridFormParams<T>>);
    }

    // Append new data to the grid form
    function handleAppend() {
        if (customAddFunction) {
            customAddFunction();

            return;
        }
        if (!gridApi) {
            return;
        }

        const { add: [newRow] = [] } = gridApi.applyTransaction({
            add: [{ ...dataDefault, rowId: uuidv4(), status: 'created' }]
        }) || {};

        // 행 이동
        if (newRow) {
            gridApi.ensureNodeVisible(newRow, 'bottom');
        }
    }

    /**
     * Handle field input value change
     * @param event event source
     * @param field field name
     * @param params row data information
     */
    function handleInputChange(field: string, params: ICellRendererParams, event?: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        if (!gridApi) {
            return;
        }

        const tableId = params.node.id;

        if (!tableId) {
            return;
        }

        const data: T = params.data;

        if (event) {
            const newVal = event.target?.value ?? '';
            const preVal = data[field];

            const isFalsy = (val: unknown) => val == null || val === false || val === 0 || val === '0' || val === '';

            let newData = {
                ...data,
                [field]: newVal
            };

            if (!(isFalsy(preVal) && isFalsy(newVal)) && preVal != newVal && data[dataUniqueId]) {
                newData = {
                    ...newData,
                    status: 'modified'
                };
            }

            params.node.setData(newData);
        }
        else if (data[dataUniqueId]) {
            params.node.setData({ ...data, status: 'modified' });
        }

        onGridDataChange?.(); // 데이터 값 변경 함수 실행
        handleRowRefresh(params);
    }

    /**
     * Handle sort changed
     * @param params event source
     */
    function handleSortChanged(params: SortChangedEvent) {
        if (isRestoringSortRef.current) {
            // 복구 중이면 alert 안 띄우고 flag 해제 후 종료
            isRestoringSortRef.current = false;

            return;
        }

        // 수정이나 신규 상태인 로우 있는지 확인
        if (gridGetHasUnsavedChangeGrid([gridApi])) {
            isRestoringSortRef.current = true; // 정렬 복구 (이벤트 재발 방지를 위해 flag 사용)
            alert('테이블에 신규 또는 수정 중인 항목이 있어 정렬을 진행할 수 없습니다');
            params.api.applyColumnState({ 
                state: prevSortModelRef.current, 
                // prevSortModelRef가 없을때는 무조건 모든 sort null 처리
                ...(prevSortModelRef.current && { defaultState: { sort: null } })
            });

            return;
        }

        // 현재 정렬 상태 저장
        prevSortModelRef.current = params.api.getColumnState();

        const colState = params.api.getColumnState();
        const sortRow = colState
            .filter((s) => s.sort !== null)
            .map((s) => ({
                sortName: s.colId,
                isASC: s.sort === 'asc'
            }));

        sortProps?.setSort?.(sortRow);
    }

    /**
     * Handle table refresh
     * @param params row data information
     */
    function handleRowRefresh(params: ICellRendererParams) {
        params.api.refreshCells({
            rowNodes: [params.node],
            force: true
        });
    }

    /**
     * Handle when grid has initialised
     * @param params event source
     */
    function handleGridReady(params: GridReadyEvent) {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
        onGridReady?.(params);
    }

    /**
     * 행 드래그 이동 이벤트 핸들러
     * @param event event source
     * */
    function handleRowDragMove(event: RowDragMoveEvent) {
        // 순번 컬럼 데이터 제번
        event.api.refreshCells({ columns: ['no'], force: true });
    }

    /**
     * 행 클릭 이벤트 핸들러
     * @param event event source
     */
    function handleRowClick(event: RowClickedEvent) {
        selectRowIdRef.current = event.data?.rowId;

        event.api.refreshCells({ force: true });
        onRowClicked?.(event);
    }

    return (
        <div className="h-full">
            {/* 디버깅용 삭제 x */}
            {/* <DevTool control={methods.control}/> */}
            <div className={`ag-theme-alpine !rounded-[0px] ${borderMode}`}>
                <NewGridTable
                    // 가상 렌더링 위 아래로 50개씩 렌더링해둠
                    rowBuffer={50}
                    animateRows={false}
                    rowData={rowData}
                    rowDragManaged={isDraggable}
                    onRowDragMove={handleRowDragMove}
                    columnDefs={columnDefs}
                    sortProps={sortProps}
                    onRowClicked={handleRowClick}
                    onGridReady={handleGridReady}
                    onSortChanged={handleSortChanged}
                    {...agGridProps}
                />
            </div>
            {submitRef && (
                <button ref={submitRef} type="submit" className="hidden" onClick={methods.handleSubmit(handleFormSubmit, handleFormError)}/>
            )}
        </div>
    );
}