// import { SelectChangeEvent } from '@mui/material';

/**
 * 특정 프로퍼티를 선택적으로 optionallType으로 변경해주는 타입입니다.
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ChangeEventType = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
export type StringType = string | string[];
// export type SelectChangeEventType = SelectChangeEvent<string>;

// Input Config Props 
export interface InputConfigProps {
    SPACING?: boolean;
    MAX?: number;
    CHAR?: 'NUMERIC' | 'ALPHA' | 'ALPHANUMERIC' | 'ALL';
    CASE?: 'UPPER' | 'LOWER'
}

export const codeInputConfig: InputConfigProps = {
    SPACING: false,
    MAX: 50,
    CHAR: 'ALPHANUMERIC',
    CASE: 'UPPER'
};