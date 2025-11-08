// import { AddressData } from '@components/modal/AddressModal';
// import { useAlertStore } from '@store/alert.store';
import { InputConfigProps } from '@type/common.type';
import { GridFormParams } from '@type/grid-table.type';
import { ChangeEvent } from 'react';
import {
    FieldErrors, UseFormReturn, FieldValues, Path, PathValue
} from 'react-hook-form';

/**
 * Handle form errors with alert.
 * @param errors list of input errors
 * @param methods useForm react hook form
 */
export function formErrors<T extends FieldValues>(
    errors: FieldErrors<T>,
    methods: UseFormReturn<T>
) {
    const error = checkForMessage<T>(errors);

    if (error) {
        // const { addAlert } =  useAlertStore.getState();
        alert(error.message)
        // addAlert({ message: error.message || '' });

        methods.setFocus(error.key);
    }
}

interface ErrorMessageProps<T> {
    // form key
    key: Path<T>;

    // error message
    message?: string;
}

/**
 * Recursive function to get first error message
 * @param errors list of input errors
 * @param path form key
 */
function checkForMessage<T extends FieldValues>(
    errors: FieldErrors,
    path = ''
): ErrorMessageProps<T> | null {
    if (Array.isArray(errors)) {
        for (let index = 0; index < errors.length; index++) {
            const result = checkForMessage<T>(errors[index], `${path}${path ? '.' : ''}${index}`);

            if (result) {
                return result;
            }
        }
    }
    else if (errors && typeof errors === 'object') {
        for (const key in errors) {
            if (Object.prototype.hasOwnProperty.call(errors, key)) {
                const newPath = path ? `${path}.${key}` : key;
                const value = errors[key];

                if (value && typeof value === 'object' && 'message' in value) {
                    return {
                        key: newPath as Path<T>,
                        message: value.message as string
                    };
                }

                const result = checkForMessage<T>(value as FieldErrors, newPath);

                if (result) {
                    return result;
                }
            }
        }
    }
    return null;
}


/**
 * Create default value for hook form
 * @param defaultValues default values
 * @returns
 */
export function getParams<T extends FieldValues>(defaultValues: T) {
    return { defaultValues: defaultValues };
}

/**
 * Create multi default value for hook form
 * @returns
 */
export function getMultiParams() {
    return {
        defaultValues: { data: [] }
    };
}

/**
 * Cleanup field array
 * @param methods form methods
 * @param fields form field array
 */
export function cleanupFieldArray<Data>(methods: UseFormReturn<GridFormParams<Data>>, fields: Data[]) {
    if (fields.length <= 1) {
        methods.reset({ data: [] });
    }
}

/**
 * Handles input change event to enforce a maximum length on a form field's value.
 * If the input value exceeds the specified maxLength, it truncates the value
 * and updates the form state using react-hook-form's setValue method with validation.
 *
 * @param methods react-hook-form methods
 * @param formName name of the form
 * @param e change event
 * @param maxLength maximum allowed length for the input
 */
export function handleMaxLength<T extends FieldValues>(
    methods: UseFormReturn<T>,
    formName: Path<T>,
    e: ChangeEvent,
    maxLength: number
) {
    const target = e.target as HTMLInputElement;
    let value = target.value;

    if (value.length > maxLength) {
        value = value.slice(0, maxLength);
    }

    methods.setValue(formName, value as PathValue<T, Path<T>>, { shouldValidate: true });
}

/**
 * String validation utility.
 * @param methods react-hook-form methods
 * @param formName form field name
 * @param e Input event
 * @param config Configuration for validation
 */
export function handleStringInput<T extends FieldValues>(
    methods: UseFormReturn<T>,
    formName: Path<T>,
    e: ChangeEvent<Element>,
    config: InputConfigProps
): void {
    const target = e.target as HTMLInputElement;
    let value = target.value;

    const allowSpacing = config.SPACING !== false;
    const maxLength = config.MAX;
    const charType = config.CHAR || 'ALL';

    let pattern: string;
    switch (charType) {
    case 'NUMERIC':
        pattern = allowSpacing ? '[0-9 ]' : '[0-9]';
        break;
    case 'ALPHA':
        pattern = allowSpacing ? '[A-Za-z ]' : '[A-Za-z]';
        break;
    case 'ALPHANUMERIC':
        pattern = allowSpacing ? '[A-Za-z0-9 ]' : '[A-Za-z0-9]';
        break;
    case 'ALL':
    default:
        pattern = allowSpacing ? '[\\s\\S]' : '[^ ]';
        break;
    }

    const regex = new RegExp(pattern, 'g');
    const matched = value.match(regex);
    value = matched ? matched.join('') : '';

    if (config.CASE === 'UPPER') {
        value = value.toUpperCase();
    }
    else if (config.CASE === 'LOWER') {
        value = value.toLowerCase();
    }

    if (typeof maxLength === 'number' && value.length > maxLength) {
        value = value.slice(0, maxLength);
    }

    target.value = value;
    methods.setValue(formName, value as PathValue<T, Path<T>>, { shouldValidate: true });
}