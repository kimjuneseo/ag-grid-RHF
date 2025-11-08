import { GridFormTableProps } from '@components/grid-form/NewGridFormTable';
// import { SelectChangeEvent } from '@mui/material';
import { FieldProps } from '@type/field.type';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import { JSX } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

// GridApi | null
export type GridApiType = GridApi | null;

export interface GridFormTableValidationProps<T extends FieldValues> extends FieldProps<T> {
    // handle input change
    // onChange?: (event: React.ChangeEvent<Element> | Event | SelectChangeEvent<string>) => void;
    onChange?: (event: React.ChangeEvent<Element> | Event) => void;
}

export interface GridFormTableColumnProps<T extends FieldValues> extends ColDef {
    // custom input field
    render?: (params: { 
        // form methods
        methods: UseFormReturn<GridFormParams<T>>,

        // ag-grid params
        params: ICellRendererParams,

        // valid data
        validationProps: GridFormTableValidationProps<GridFormParams<T>>
    }) => JSX.Element;

    // custom field for modal search input
    renderFunction?: (params: { 
        // form methods
        methods: UseFormReturn<GridFormParams<T>>,

        // ag-grid params
        params: ICellRendererParams
    }) => JSX.Element;
}

// grid status
export type GridStatus = 'default' | 'created' | 'modified'

// ag-grid multi data
export interface GridFormParams<T extends FieldValues> {
    dataForm: Record<string, T>;
}

// ag-grid state로 받을때 타입
export type GridStatePrams<T extends FieldValues> = UseFormReturn<GridFormParams<T>> | null;

export interface GridValues extends FieldValues {
    // grid row id
    rowId?: string;
}

export type ListGridFormTableProps<TData extends FieldValues = FieldValues> = Omit<GridFormTableProps<TData>, 'columns' | 'dataDefault' | 'dataUniqueId'> & {
    // 테이블명
    tableNm?: string;
};

export type GridFormMethods<TData extends FieldValues = FieldValues> = UseFormReturn<GridFormParams<TData>>;