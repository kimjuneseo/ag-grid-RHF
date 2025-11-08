import { GridFormTableProps } from '@components/grid-form/GridFormTable';
import { FieldProps } from '@type/field.type';
import { MakeOptional } from '@type/common.type';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { 
    ChangeHandler, FieldValues, RegisterOptions,Path, UseFormReturn 
} from 'react-hook-form';
import { JSX } from 'react';

export type CommTableColumnType = 'text' | 'number' | 'email' | 'tel' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'button' | 'iconButton' | 'hidden' | 'input' | 'serch-input' | 'serch-code-input'

export interface CommInsertTableForm<T, K> {
    // 새로 추가될 데이터
    create: T;

    // 변경 데이터
    update: K;
}

export interface CommTableValidationColumn<T extends FieldValues = FieldValues, I = unknown> extends ColDef {
    // 입력 props
    inputProps?: I;
    
    // 필수 여부
    required?: boolean;

    // 유효성
    rules?: Omit<RegisterOptions<T, Path<T>>, 'setValueAs' | 'disabled' | 'valueAsNumber' | 'valueAsDate'>;

    // 출력 타입
    render?: (params: { 
        value: string | number | boolean | undefined, 
        validationProps: CommValidationProps<T>, 
        params: ICellRendererParams
    }) => JSX.Element;

    // custom output type
    renderFunction?: (
        params: ICellRendererParams
    ) => JSX.Element;
}

export interface CommValidationProps<T extends FieldValues = FieldValues> extends FieldProps<T> {
    id?: string;
    onChange?: ChangeHandler;
}

export interface GridFormProps<MultiData extends FieldValues, Data extends FieldValues> {
    gridProps: MakeOptional<GridFormTableProps<MultiData, Data>, 'defaultRows' | 'fields' | 'columns' | 'methods' | 'unique' | 'onAppend' | 'onRemove'>;
    methods: UseFormReturn<MultiData>;
}

export type GridStatus = '0' | '1' | '2'

export interface GridFormData {
    status?: GridStatus
}

export interface GridFormParams<TData> {
    data: TData[];
}

// 그리드 폼 필드 이름
export type GridFormFieldName = `dataForm.${string}`;