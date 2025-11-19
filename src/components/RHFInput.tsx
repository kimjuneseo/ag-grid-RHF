import { classMerge } from "@utils/css.util";
import { Control, FieldValues, UseControllerProps, useController } from "react-hook-form";


export interface FieldProps<T extends FieldValues> extends Omit<UseControllerProps<T>, 'control' | 'defaultValue'> {
    // input reference
    inputRef?: React.Ref<HTMLElement>;

    // hook-form control
    control: Control<T>;
}

export default function RHFInput<T extends FieldValues>({
    name,
    control,
    rules,
    onChange: onDefaultChange,
    ...props
}: FieldProps<T> & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>) {
    // React Hook Form의 useController를 사용하여 상태 관리
    const { field: { value, onChange }, fieldState: { error } } = useController({ name, control, rules });

    /**
     * Handle selection changed
     * @param event event source
     */
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
        onDefaultChange?.(event);
    }
    
    return (
        <>
            <input
                {...props} 
                className={classMerge("w-full", 
                    props.className,
                    error ? '!border-[red] !border' : ''
                )}
                style={{
                    width: '100%',
                    outline: 'none',
                    background: '#1a1a1a',
                    border:'1px solid #ffff00 !important',
                    color: '#ffff00',
                    padding: '4px'
                }}
                type="text" 
                value={value as string} 
                onChange={handleChange}
            />
        </>
    );
};