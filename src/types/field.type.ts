// import { SelectProps } from '@mui/material';
// import { EgcSelectProps, ISelectItem } from 'egc-react-lib/dist/lib/components/select/EgcSelect';
import { Control, FieldValues, UseControllerProps } from 'react-hook-form';

export interface FieldProps<T extends FieldValues> extends Omit<UseControllerProps<T>, 'control' | 'defaultValue'> {
    // input reference
    inputRef?: React.Ref<HTMLElement>;

    // hook-form control
    control: Control<T>;
}

/**
 * API 검색 dto
 * */
export interface ApiSearchDto {
    // 검색 키워드
    searchKey?: string;
}


// input style alignment
export interface AlignmentStyleProps {
    // text alignment
    alignment?: 'left' | 'center' | 'right';
}