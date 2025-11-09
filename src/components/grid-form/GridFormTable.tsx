import GridAddButton from '@components/grid-form/GridAddButton';
import GridRemoveButton from '@components/grid-form/GridRemoveButton';
import NewGridTable from '@components/grid-form/NewGridTable';
import { CommTableValidationColumn, CommValidationProps, GridStatus } from '@type/grid-table.type';
import { ColDef, ColGroupDef, ICellRendererParams } from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';
import {
    RefObject, useEffect, useMemo, useState
} from 'react';
import {
    FieldArrayPath, FieldArrayWithId, FieldErrors, FieldValues, FormProvider, Path, PathValue, UseFormReturn
} from 'react-hook-form';

const EXCEPTS_KEYS = [
    'no',
    'delYn',
    'useYn',
    'mdfrId',
    'mdfcnDt',
    'mdfrNm',
    'cnsmrPrc',
    'sort'
];

export interface GridFormTableProps<MultiData extends FieldValues, Data extends FieldValues, TKeyName extends string = 'id'> extends AgGridReactProps {
    // Check to set an add column order
    addColOrder?: 'first' | 'last';

    // 테이블 보더 행, 열
    borderMode?: 'insert' | 'select';

    // Columns for the table with validation properties
    columns: CommTableValidationColumn<MultiData>[];

    // Default parameter for adding rows
    defaultRows?: Data;

    // Existing rows
    existingRows?: RefObject<Record<string, Data>>;

    // Fields used for form handling with react-hook-form
    fields: FieldArrayWithId<MultiData, FieldArrayPath<MultiData>, TKeyName>[];

    // Hide add button
    isHideAddBtn?: boolean;

    // Show row status
    isShowStatus?: boolean;

    // Show checkbox instead of text
    isShowStatusCheckbox?: boolean;

    // Methods from react-hook-form to manage form state
    methods: UseFormReturn<MultiData>;

    // field to sort
    sortField?: string;

    // sorting orientation
    sortOrder?: 'asc' | 'desc';

    // Optional reference for submit button
    submitRef?: RefObject<HTMLButtonElement>;

    // Unique key in data for identifying rows
    unique: keyof Data;

    // Unique conditional function
    isHideRemoveBtn?: (value: Data) => boolean;

    // Function to append new data to the grid
    onAppend: (value: Data | Data[]) => void;

    // Handle existing row updated
    onFieldsChanged?: (unique: string) => void;

    // Function to handle form errors
    onFormError?: (errors: FieldErrors) => void;

    // Function to handle form submission
    onFormSubmit?: (data: MultiData) => void;

    // Function to remove data from the grid
    onRemove?: (value: number | number[], data?: Data) => void;
}

/**
 * A grid table component for rendering editable rows with validation.
 */
export default function GridFormTable<MultiData extends FieldValues, Data extends FieldValues>({
    addColOrder,
    borderMode = 'insert',
    columns,
    defaultRows,
    existingRows,
    fields,
    isHideAddBtn = false,
    isShowStatus = false,
    methods,
    submitRef,
    unique,
    isHideRemoveBtn,
    onAppend,
    onFieldsChanged,
    onFormError,
    onFormSubmit,
    onRemove,
    onRowDataUpdated,
    ...agGridProps
}: GridFormTableProps<MultiData, Data>) {
    // hook-form
    const { watch } = methods;
    const newRows = watch();
    // state
    const [status, setStatus] = useState<Record<string, GridStatus>>({});
    // custom variable
    const statusValue = {
        'default': {
            text: '',
            color: ''
        },
        'modified': {
            text: '수정',
            color: 'blue'
        },
        'new': {
            text: '추가',
            color: 'red'
        }
    };

    const columnAddCol = {
        maxWidth: 75,
        headerComponent: () => {
            return (
                <GridAddButton
                    onAppend={() => defaultRows && handleAppend(defaultRows)}
                />
            );
        },
        sortable: false,
        cellRenderer: (params: ICellRendererParams) => {
            const rowIndex = params.node.rowIndex as number;
            const data = params.data;
            const tableId = data.id;
            const uniqueId = data[unique];

            if (uniqueId && uniqueId in status === false) {
                setStatus((prev) => ({
                    ...prev,
                    [uniqueId]: 'default'
                }));
            }
            else if (!uniqueId && tableId in status === false) {
                setStatus((prev) => ({
                    ...prev,
                    [tableId]: uniqueId ? 'default' : 'new'
                }));
            }

            if (isHideRemoveBtn && isHideRemoveBtn(data)) {
                return;
            }

            if (uniqueId) {
                return  (
                    <GridRemoveButton
                        onRemove={() => onRemove?.(rowIndex, data)}
                    />
                );
            }

            return (
                <GridRemoveButton
                    onRemove={() => onRemove?.(rowIndex)}
                />
            );
        },
        cellClass: 'justify-center items-center'
    };

    const columnStatus = {
        headerName: '상태',
        maxWidth: 75,
        sortable: false,
        cellRenderer: (params: ICellRendererParams) => {
            const data: Data = params.data;
            const statusId = data[unique] || data.id;

            if (statusId in status) {
                const statusData = statusValue[status[statusId]];

                return <div style={{ color: statusData.color }}>{statusData.text}</div>;
            }

            return '';
        }
    };

    const columnArr: (ColDef | ColGroupDef)[] = useMemo(() => [
        ...columns.map(({ render, rules, renderFunction, ...other }, index) => {
            return {
                ...other,
                suppressKeyboardEvent: () => true,
                cellRenderer: (params: ICellRendererParams) => {
                    const { field } = other;
                    const data: Data = params.data;
                    const colValue = data[field ?? ''];
                    const rowIndex = params.node.rowIndex as number;

                    if (!index) {
                        handleAppendFields(data, rowIndex);
                    }
                    if (render) {
                        const fieldNm = field as keyof Data;
                        const {
                            name
                        } = methods.register(`data.${rowIndex}.${String(fieldNm)}` as Path<MultiData>, {
                            value: data[fieldNm] as PathValue<MultiData, Path<MultiData>>
                        });
                        const validationProps: CommValidationProps<MultiData> = {
                            control: methods.control,
                            id: name,
                            name: name,
                            rules: rules ?? {}
                        };

                        return render({ value: colValue, validationProps, params });
                    }
                    else if (renderFunction) {
                        return renderFunction(params);
                    }
                    else {
                        return colValue;
                    }
                }
            };
        })
    ], [fields]);

    const columnDefs: (ColDef | ColGroupDef)[] = useMemo(() => {
        if (!isHideAddBtn && addColOrder) {
            if (addColOrder === 'last' && isShowStatus) {
                return [...columnArr, columnStatus, columnAddCol];
            }
            else if (addColOrder === 'last') {
                return [...columnArr, columnAddCol];
            }
            else if (isShowStatus) {
                return [columnAddCol, columnStatus, ...columnArr];
            }
            else {
                return [columnAddCol, ...columnArr];
            }
        }
        else if (isShowStatus) {
            return [columnAddCol, columnStatus, ...columnArr];
        }
        else {
            return columnArr;
        }
    }, [fields, status]);

    useEffect(() => {
        const values: Data[] = newRows.data;

        if (!existingRows || !values) {
            return;
        }

        values.forEach((data) => {
            const uniqueId = data[unique];
            let isChange = false;

            if (!uniqueId) return;

            for (const key of Object.keys(data)) {
                if (EXCEPTS_KEYS.includes(key)) continue;
                if (existingRows.current[uniqueId] && existingRows.current[uniqueId][key] !== undefined) {
                    const currentValue = existingRows.current[uniqueId][key];
                    const newValue = data[key];

                    if (Array.isArray(currentValue) && Array.isArray(newValue)) {
                        const sortedCurrent = [...currentValue].sort();
                        const sortedNew = [...newValue].sort();

                        if (JSON.stringify(sortedCurrent) !== JSON.stringify(sortedNew)) {
                            updateStatus(uniqueId, 'modified');
                            onFieldsChanged?.(uniqueId);

                            isChange = true;

                            break;
                        }
                    }
                    else if (currentValue != newValue) {
                        updateStatus(uniqueId, '1');
                        onFieldsChanged?.(uniqueId);

                        isChange = true;

                        break;
                    }
                }
            }

            if (!isChange) {
                updateStatus(uniqueId, '0');
            }
        });
    }, [newRows]);

    /**
     * Update row status
     * @param id row number
     * @param status 0 => existing rows, 1 => existing with updated rows, 2 => new rows
     */
    function updateStatus(id: string, newValue: GridStatus) {
        setStatus((prev) => {
            if (prev[id] === newValue) {
                return prev;
            }

            return {
                ...prev,
                [id]: newValue
            };
        });
    }

    /**
     * Append new data to the grid
     * @param value data to append
     */
    function handleAppend(value: Data | Data[]) {
        onAppend(value);
    }

    /**
     * 폼 서브밋 핸들러
     * @param data 폼 데이터
     */
    function handleSubmit(data: MultiData) {
        onFormSubmit?.(data);
    }

    /**
     * Append existing fields to form
     * @param data fields value
     * @param rowIndex row index number
     */
    function handleAppendFields(data: Data, rowIndex: number) {
        Object.keys(data)
            .forEach((key) => {
                if (key !== 'id') {
                    methods.register(`data[${rowIndex}].${key}` as Path<MultiData>, {
                        value: data[key] as PathValue<MultiData, Path<MultiData>>
                    });
                }
            });
    }

    return (
        <FormProvider {...methods}>
            <form className="h-full" onSubmit={methods.handleSubmit(handleSubmit, onFormError)}>
                <div className={`ag-theme-alpine !rounded-[0px] ${borderMode}`}>
                    <NewGridTable
                        {...agGridProps}
                        rowData={fields}
                        columnDefs={columnDefs}
                        onRowDataUpdated={onRowDataUpdated}
                    />
                </div>
                {submitRef && (
                    <button ref={submitRef} className="hidden" />
                )}
            </form>
        </FormProvider>
    );
}