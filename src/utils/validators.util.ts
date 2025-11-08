import { hasBatchim } from '@utils/korean.util';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { GridFormParams } from '@type/grid-form-table.type';
import { GridFormFieldName } from '@type/grid-table.type';
import React from 'react';
import { formatOrdinal } from '@utils/english.util';
// import { useTranslation } from 'react-i18next';

// I18nContext 타입
// type UseTranslation = ReturnType<typeof useTranslation>;

// 패턴 정규식 타입
export type PatternType = 'UPPER-ALPHABET' | 'LOWER-ALPHABET' | 'NUMBER' | 'SPECIAL' | 'KOREA' | 'ENGLISH';

// 패턴 정규식 객체
const PATTERN_MAP: Record<PatternType, string> = {
    'UPPER-ALPHABET': 'A-Z',
    'LOWER-ALPHABET': 'a-z',
    'NUMBER': '0-9',
    'SPECIAL': '!@#$%^&*(),.?":{}|<>_\\[\\]/+=~`\'\\-;',
    'KOREA': '가-헿ㄱ-ㅎㅏ-ㅣ',
    'ENGLISH': 'a-zA-Z'
};

/**
 * 0일 때 걸러주는 유효성 검사
 * @param message 메세지
 * @returns
 */
export const mustBeGreaterThanZero = (message: string) => (value: unknown): true | string =>
    Number(value) === 0 ? message : true;

/**
 *
 * @param types 허용할 문자 타입
 * @param types 메세지
 * @param allowSpace 스페이스 허용 여부 (기본 허용)
 * @param requireAll 전부 포함 여부 (기본 부분 허용)
 * @returns
 */
export function combinePatternRegex(types: PatternType[], allowSpace: boolean, requireAll: boolean): RegExp{
    if (!types.length) {
        // 모든 문자 허용
        return /^.*$/;
    }

    const patternBody = types.map((type) => PATTERN_MAP[type])
        .join('');
    const space = allowSpace ? ' ' : '';

    // 전부 허용이 아니라 부분 허용일 때
    if (!requireAll) {
        // 허용된 문자들만 입력 가능
        return new RegExp(`^[${patternBody}${space}]+$`);
    }

    // 각 타입이 최소 한 번씩 포함되어야 함
    const lookaheads = types
        .map((type) => `(?=.*[${PATTERN_MAP[type]}])`)
        .join('');

    return new RegExp(`^${lookaheads}[${patternBody}${space}]+$`);
}

/**
 *
 * @param types 허용할 문자 타입
 * @param filedName 필드 이름
 * @param requireAll 전부 포함 여부 (기본 부분 허용)
 * @param t translation function from useTranslation()
 */
export const combinePatternRegexMessage = (
    types: PatternType[],
    filedName: string,
    requireAll: boolean,
    t: (key: string, options?: Record<string, unknown>) => string
) => {
    if (!types.length) {
        // 모든 문자 허용
        return '';
    }
    const labels = types.map((type) => t(type));
    const patternRegexLocaleId = requireAll ? 'must_include_all' : 'only_allow'; // 전체, 부분 허용 메시지 아이디

    return filedName + t(patternRegexLocaleId, {
        types: labels.join(', ')
    });
};

/**
 *
 * @param types 허용할 문자 타입
 * @param filedName 필드 이름
 * @param t translation function from useTranslation()
 * @param allowSpace 스페이스 허용 여부 (기본 허용)
 * @param requireAll 전부 포함 여부 (기본 부분 허용)
 * @returns
 */
export const combinePatternRegexWithMessage = (
    types: PatternType[],
    filedName: string,
    t: (key: string) => string,
    allowSpace = true,
    requireAll = false
) => ({
    value: combinePatternRegex(types, allowSpace, requireAll),
    message: combinePatternRegexMessage(types, filedName, requireAll, t)
});

/**
 * Replaces the placeholder '{min}' or '{max}' from the type parameter in the given message with the specified max value.
 * @param type min or max type to validate lengths
 * @param message error message
 * @param minMaxLength minimum or maximum length
 * @returns error message with the minimum or maximum length value inserted.
 */
export function combineMinMaxLengthMessage(type: 'min' | 'max', message: string, minMaxLength: number): string {
    return message.replace('{'+ type + '}', String(minMaxLength));
}

/**
 * Combine value and minimum or maximum length error message
 * @param type min or max type to validate lengths
 * @param minMaxLength minimum or maximum length
 * @param fieldName field param name
 * @param t translation function from useTranslation()
 * @returns
 */
export function combineMinMaxLengthWithMessage(type: 'min' | 'max', minMaxLength: number, fieldName: string, t: (key: string) => string) {
    const minMaxMessage = hasBatchim(fieldName) ? t('field_' + type + '_length_exceeded_1') : t('field_' + type + '_length_exceeded_2');

    return {
        value: minMaxLength,
        message: combineMinMaxLengthMessage(type, fieldName + minMaxMessage, minMaxLength)
    };
}

/**
 * Combine field name and required field message with trimmed string validation
 *
 * @param fieldName field param name
 * @returns
 */
export function getRequiredMessage(fieldName: string) {
    // const { t } = useTranslation();

    return (value: unknown): true | string => (typeof value === 'string' && value.trim() !== '') || (typeof value === 'number' && !isNaN(value)) ? true : combineEndingMessage(fieldName, 'field_required_form', t);
}

/**
 * 값 미입력 시, "필수값 입력 후 저장해주세요" 워딩 return 해주는 함수
 */
export function getDefaultRequiredMessage() {
    // const { t } = useTranslation();

    return (value: unknown): true | string => (typeof value === 'string' && value.trim() !== '') || (typeof value === 'number' && !isNaN(value)) ? true : t('field_required_valid_message');
}

/**
 * Combine field name and ending field message
 *
 * @param fieldName field param name
 * @param endingMessage ending field message
 * @param t translation function from useTranslation()
 * @returns
 */
// export const combineEndingMessage = (
//     fieldName: string,
//     endingMessage: string
//     // t: (key: string) => string
// ) => hasBatchim(fieldName) ? fieldName + t(`${endingMessage}_1`) : fieldName + t(`${endingMessage}_2`);

/**
 * Display ordinal message for localization
 * @param uniqueFieldNm unique field name
 * @param values 'start', 'end' and 'col' key-value map
 * @param i18nContext translation function context
 * */
export function getCodeDuplicatedMessage(
    uniqueFieldNm: string,
    values: Record<string, string | number>,
    i18nContext: UseTranslation
): string {
    const { t, i18n } = i18nContext;
    const locale = i18n.language.startsWith('ko') ? 'ko' : 'en'; // locale 구분자
    uniqueFieldNm = uniqueFieldNm.replace(/\(\*\)/g, ''); // (*) 부분 삭제
    const uniqueDuplicatedTemplate = hasBatchim(uniqueFieldNm) ? t('code_duplicated_2') : t('code_duplicated_1');

    return uniqueDuplicatedTemplate.replace(/{(.*?)}/g, (_, key) => {
        // col 일 때 (*) 삭제시킨 uniqueFieldNm 반환. 변환 될 값
        const val = key === 'col' ? uniqueFieldNm : values[key];

        // 첫 번째, 두 번째 중복된 행 인덱스 및 uniqueFieldNm template 값 변환
        return (key === 'start' || key === 'end') && typeof val === 'number' ? formatOrdinal(val + 1, locale) : val?.toString() ?? '';
    });
}

/**
 * ag-grid의 params.data 기반으로 react-hook-form register를 자동 호출하고 name을 리턴
 * @param methods useForm()으로 생성한 methods
 * @param params ag-grid ICellRendererParams (data 내부에 rowId 필수)
 * @param keys key array
 * @param defaultValues key만 추출 대상 필드로 사용됨
 * @returns defaultValues에 포함된 key들만 포함하는 field name map
 */
export function autoRegisterFieldNamesFromParams<
  T extends object,
  K extends keyof T & string = keyof T & string
>(
    methods: UseFormReturn<GridFormParams<T>>,
    params: { data: T & { rowId: string } },
    keys: K[],
    defaultValues?: Partial<T>
): Record<K, { name: GridFormFieldName; ref?: React.Ref<HTMLInputElement> }> {
    const { data } = params;
    const rowId = data.rowId;
    const result = {} as Record<K, { name: GridFormFieldName; ref?: React.Ref<HTMLInputElement> }>;
    const basePath = `dataForm.${rowId}` as const;

    keys.forEach((field) => {
        const fieldPath = `${basePath}.${field}` as Path<GridFormParams<T>>;
        type FieldValue = PathValue<GridFormParams<T>, typeof fieldPath>;

        const raw = data[field] ?? defaultValues?.[field];
        const value = (raw ?? '') as FieldValue;

        const { name, ref } = methods.register(fieldPath, { value });

        result[field] = {
            name: name as GridFormFieldName,
            ref
        };
    });

    return result;
}

/**
 * Combine field name and required field message
 *
 * @param fieldName field param name
 * @param t translation function from useTranslation()
 * @returns
 */
export function getRequiredErrorMessage(fieldName: string, t: (key: string) => string) {
    return combineEndingMessage(fieldName, 'field_required_form', t);
}

/**
 * Returns a translated duplicate code message with row numbers and column label.
 * The message key depends on whether the column name ends with a batchim (받침).
 *
 * @param start - Row number of the first occurrence
 * @param end - Row number of the duplicate occurrence
 * @param col - Column name to include in the message
 * @param t - Translation function
 * @returns Translated and formatted duplicate error message
 */
export function getDuplicateCodeMessage(
    start: number,
    end: number,
    col: string,
    t: (key: string) => string
): string {
    const key = hasBatchim(col) ? 'code_duplicated_2' : 'code_duplicated_1';

    return t(key)
        .replace('{start}', String(start))
        .replace('{end}', String(end))
        .replace('{col}', col);
}

/**
 * Returns a validation function to check for duplicate values in a given field across a data form.
 *
 * @param dataForm - The form data object where each key maps to a form row
 * @param key - The key within the form row to check for duplicates
 * @param label - The column label for displaying in error messages
 * @param t - Translation function for localization
 * @returns A function to validate whether the value is duplicated; returns true if valid or an error message if duplicate
 */
export function getDuplicateMessage<T extends FieldValues, K extends keyof T>(
    dataForm: Record<string, T> | undefined,
    key: K,
    label: string,
    t: (key: string) => string
): (value: unknown) => true | string {
    return (): true | string => {
        if (!dataForm || Object.keys(dataForm).length === 0) {
            return true;
        }

        const seen = new Map<T[K], number>();
        const entries = Object.entries(dataForm);

        for (let i = 0; i < entries.length; i++) {
            const [, item] = entries[i];
            const value = item[key];

            if (seen.has(value)) {
                const firstIndex = seen.get(value);

                if (firstIndex !== undefined) {
                    const firstRow = firstIndex + 1;
                    const secondRow = i + 1;

                    return getDuplicateCodeMessage(firstRow, secondRow, label, t);
                }
            }

            seen.set(value, i);
        }

        return true;
    };
}

/**
 * 에디터 글자수 제한 로직
 * @param node html tag 노드
 * @param limit 최대 값
 * */
export function trimNodeToLimit(node: Node, limit: number): Node | null {
    // 제한 글자 수가 0 이하이면 더 이상 클론하지 않고 null 반환
    if (limit <= 0) {
        return null;
    }

    // 텍스트 노드인 경우 (nodeType 3)
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';  // 텍스트 내용을 가져옴

        // 남은 글자 수 만큼 텍스트를 자른 후 텍스트 노드로 반환
        return document.createTextNode(text.slice(0, limit));
    }

    // 엘리먼트 노드인 경우 (nodeType 1)
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        // 노드의 태그는 그대로 복제 (자식 노드는 복제하지 않음)
        const clone = element.cloneNode(false) as HTMLElement;

        // 자식 노드들에 대해서 재귀적으로 처리
        for (const child of Array.from(element.childNodes)) {
            // 제한을 다 사용했으면 반복 종료
            if (limit <= 0) {
                break;
            }

            // 자식 노드를 제한에 맞게 클론
            const trimmed = trimNodeToLimit(child, limit);

            if (trimmed) {
                // 남은 글자 수에서 자식 노드의 텍스트 길이만큼 차감
                limit -= trimmed.textContent?.length || 0;
                // 제한에 맞게 자른 자식 노드를 클론에 추가
                clone.appendChild(trimmed);
            }
        }

        return clone; // 클론된 엘리먼트 노드 반환
    }

    // 텍스트나 엘리먼트가 아닌 노드(예: 주석)는 무시하고 null 반환
    return null;
}