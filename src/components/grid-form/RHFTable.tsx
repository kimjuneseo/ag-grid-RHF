import NewGridTable from '@components/grid-form/Table';
import {
    RHFParams,
    RHFTableColumnProps,
    TableRHFProps,
    GridStatus,
    GridValues
} from '@type/grid-form-table.type';
import { Answer } from '@type/http'
import { formErrors } from '@utils/form.util';
import {
    ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams,
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
// 디버깅용
// import { DevTool } from '@hookform/devtools';

export interface RHFTableProps<T extends FieldValues> extends AgGridReactProps {
    // 유효성 검사 속성이 포함된 테이블 컬럼
    columns: RHFTableColumnProps<T>[];

    // 추가 컬럼 순서 설정
    columnAddOrder?: 'first' | 'last';

    // 행 추가 시 기본 파라미터
    dataDefault: T;

    // 기존 행 데이터
    dataExisting: T[];

    // 행 식별을 위한 데이터의 고유 키
    dataUniqueId: keyof T;

    // 행 유효성 검사를 위한 고유 컬럼명
    dataUniqueColNm?: keyof T;

    // 테이블명
    tableNm?: string;

    // 제출 버튼에 대한 선택적 참조
    submitRef: RefObject<HTMLButtonElement>;

    // 커스텀 추가 함수
    customAddFunction?: () => void;

    // 커스텀 삭제 함수
    customDeleteFunction?: (id: string | string[], params: ICellRendererParams) => Promise<string>;

    // 삭제 함수
    deleteFunction?: (id: string | string[]) => Promise<AxiosResponse<Answer<string>>>

    // 삭제 처리 함수
    onDelete?: (id?: string, methods?: UseFormReturn<RHFParams<T>>, params?: ICellRendererParams) => Promise<void>;

    // 폼 에러 처리 함수
    onFormError?: (errors: FieldErrors) => void;

    // 폼 메소드 값 처리 함수
    onFormMethodsReady?: (methods: UseFormReturn<RHFParams<T>>) => void;

    // 제출 처리 함수
    onSubmit?: (params: T[]) => Promise<void>;

    // 그리드 준비 완료 처리 함수
    onGridReady?:  (params: GridReadyEvent) => void;
}

export default function RHFTable<T extends GridValues>({
    columns,
    dataDefault,
    dataExisting,
    dataUniqueId,
    submitRef,
    customAddFunction,
    customDeleteFunction,
    deleteFunction,
    onDelete,
    onFormError,
    onFormMethodsReady,
    onSubmit,
    onGridReady,
    onRowClicked,
    ...agGridProps
}: RHFTableProps<T>) {
    // ref
    const onDeleteRef = useRef(onDelete); // onDelete 함수가 항상 최신 상태를 유지하도록 하기 위한 ref
    // hook-form
    const methods = useForm<RHFParams<T>>({
        defaultValues: { dataForm: {} }
    });
    // state
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    // 그리드 표시를 위한 상태 매핑
    const statusValue = {
        'default': {
            text: '',
            color: ''
        },
        'created': {
            text: "신규",
            color: 'red'
        },
        'modified': {
            text: "수정",
            color: 'blue'
        }
    };
    // ag-grid 변수
    const columnDefs = useMemo(() => {
        // 삭제 버튼 컬럼
        const columnAdd = [{
            field: 'addBtn',
            headerName: '',
            cellClass: 'justify-center items-center',
            minWidth: 80,
            maxWidth: 80,
            sortable: false,
            cellRenderer: (params: ICellRendererParams) => {
                const data: T = params.data;
                const rowId = data.rowId as string;

                return (
                    <button
                        onClick={() => handleRemove(params, data, params.node.id ?? '', rowId)}
                        className="retro-remove-btn"
                    >
                        삭제
                    </button>
                );
            },
            // '+' 행 추가 버튼
            headerComponent: () => (
                // 🚩 수정 2: 추가 버튼 스타일을 다크톤/모던 블루로 변경
                <button
                    onClick={handleAppend}
                    className="retro-add-btn"
                >
                    + 추가
                </button>
            )
        }];

       // 상태 컬럼
        const columnStatus = [{
            headerName: "상태",
            minWidth: 70,
            maxWidth: 70,
            sortable: false,
            cellRenderer: (params: ICellRendererParams) => {
                const statusData = statusValue[params.data.status as GridStatus ?? 'default'];

                if (!statusData.text) return null;

                // 🚩 수정 3: 상태 텍스트 색상을 블랙톤 배경에 맞게 조정
                const bgColor = statusData.color === 'green' ? '#166534' : '#854D0E'; // Dark Green, Dark Yellow
                const textColor = statusData.color === 'green' ? '#D9F99D' : '#FEF9C3'; // Light Green, Light Yellow

                return (
                    <span style={{
                        padding: '2px 4px',
                        backgroundColor: bgColor, 
                        color: textColor,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}>
                        {statusData.text}
                    </span>
                );
            }
        }];
        // 순번 외 컬럼
        const [noCols, otherCols] = partition(columns, (col) => col.field?.toLowerCase() === 'no');
        // 순번 컬럼
        const noCol = noCols[0] || null;  // 위치에 관계없이 첫 번째 순번 컬럼

        const columnFields: (ColDef | ColGroupDef)[] = [
            ...otherCols.map(({ cellRenderer, render, renderFunction, ...others }) => ({
                ...others,
                cellRenderer: (params: ICellRendererParams) => {
                    const { field } = others;
                    const data: T = params.data;
                    const rowId = data.rowId;
                    const fieldValue = field ? data[field] ?? dataDefault[field] : '';

                    if (render) {
                        const fieldName = `dataForm.${rowId}.${field}` as Path<RHFParams<T>>;
                        const RHFProps: TableRHFProps<RHFParams<T>> = {
                            name: fieldName,
                            control: methods.control,
                            inputRef: methods.register(fieldName, { value: fieldValue ?? '' }).ref
                        };
                        const renderedComponent = render({ methods, params, RHFProps });

                        return renderedComponent && React.cloneElement(renderedComponent, {
                            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                                renderedComponent.props?.onChange?.(event);
                                handleInputChange(field ?? '', params, event);
                            }
                        });
                    }
                    else if (renderFunction) {
                        const renderedComponent = renderFunction({ methods, params });

                        return renderedComponent && React.cloneElement(renderedComponent, {
                            onChange: (eventParams: T[]) => {
                                renderedComponent.props?.onChange?.(eventParams);
                                handleInputChange(field ?? '', params);
                            }
                        });
                    }

                    return cellRenderer ? cellRenderer(params) : fieldValue;
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
        return [...columnAdd, ...baseCols];
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
     * 기존 데이터 초기화 및 적용 처리
     * @param dataExisting 기존 행 데이터
     */
    async function resetAndApplyData(dataExisting: T[]) {
        if (!gridApi) {

            return;
        }

        methods.reset({ dataForm: {} });

        // 진행하기 전에 초기화가 완료되도록 보장
        // 다음 단계로 이동하기 전에 UI 및 상태 업데이트가 처리되도록 함
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
     * 폼 제출 처리
     * @param data 다중 데이터 파라미터
     */
    async function handleFormSubmit(data: RHFParams<T>) {
        const dataForm = data.dataForm ?? [];
        const filteredData = Object.values(dataForm);
        const cleanedData = filteredData.map((item) => omit(item, ['id', 'rowId', 'status', 'addBtn']));

        await onSubmit?.(cleanedData as T[]);
        methods.reset({ dataForm: dataForm });
    }

    /**
     * 알림을 통한 폼 에러 처리
     * @param errors 입력 에러 목록
     */
    function handleFormError(errors: FieldErrors) {
        onFormError?.(errors);
        formErrors<RHFParams<T>>(errors, methods);
    }

    /**
     * 폼 삭제 처리
     * @param params
     * @param nodeId 노드 고유 ID
     * @param rowId 행 고유 ID
     * @param data 행 데이터 정보
     */
    function handleRemove(params: ICellRendererParams, data: T, nodeId: string, rowId: string) {
        if (data[dataUniqueId]) {
            if (confirm("삭제하시겠습니다?")) {
                handleDelete?.(params, nodeId, rowId, data[dataUniqueId]);
            }
        }
        else {
            cleanupFieldArray(nodeId, rowId);
            onDeleteRef.current?.('', methods, params);
        }
    }

    /**
     * API를 통한 폼 삭제 처리
     * @param params
     * @param nodeId 노드 고유 ID
     * @param rowId 행 고유 ID
     * @param uniqueId 기본키 ID
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
     * 필드 배열 정리
     * @param nodeId 노드 고유 ID
     * @param rowId 행 고유 ID
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
        methods.unregister(`dataForm.${rowId}` as Path<RHFParams<T>>);
    }

    // 그리드 폼에 새 데이터 추가
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
     * 필드 입력 값 변경 처리
     * @param field 필드명
     * @param params 행 데이터 정보
     * @param event 이벤트 소스
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

        handleRowRefresh(params);
    }

    /**
     * 테이블 새로고침 처리
     * @param params 행 데이터 정보
     */
    function handleRowRefresh(params: ICellRendererParams) {
        params.api.refreshCells({
            rowNodes: [params.node],
            force: true
        });
    }

    /**
     * 그리드 초기화 완료 시 처리
     * @param params 이벤트 소스
     */
    function handleGridReady(params: GridReadyEvent) {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
        onGridReady?.(params);
    }

    /**
     * 행 드래그 이동 이벤트 핸들러
     * @param event 이벤트 소스
     * */
    function handleRowDragMove(event: RowDragMoveEvent) {
        // 순번 컬럼 데이터 갱신
        event.api.refreshCells({ columns: ['no'], force: true });
    }

    /**
     * 행 클릭 이벤트 핸들러
     * @param event 이벤트 소스
     */
    function handleRowClick(event: RowClickedEvent) {
        const targetEl = event.event?.target as HTMLElement;

        // 삭제 버튼 클릭 시 행 클릭 이벤트가 발생하지 않도록 수정
        if (targetEl?.className?.includes('remove-btn')) {
            return;
        }

        onRowClicked?.(event);
    }
    
    return (
        <div style={{ height: '100%', width: '100%' }}>
            {/* 디버깅 */}
            {/* <DevTool control={methods.control}/> */}
            <div className='ag-theme-alpine' style={{ height: '100%', width: '100%' }}>
                <NewGridTable
                    animateRows={false}
                    rowData={rowData}
                    onRowDragMove={handleRowDragMove}
                    columnDefs={columnDefs}
                    onGridReady={handleGridReady}
                    onRowClicked={handleRowClick}
                    {...agGridProps}
                />
            </div>
            {submitRef && (
                <button ref={submitRef} type="submit" style={{ display: 'none' }} onClick={methods.handleSubmit(handleFormSubmit, handleFormError)}/>
            )}
        </div>
    );
}