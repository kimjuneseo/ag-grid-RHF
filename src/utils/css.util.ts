import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { ClassValue } from 'class-variance-authority/types';

function classMerge(...classes: ClassValue[]) {
    return twMerge(clsx(classes));
}

export { classMerge };