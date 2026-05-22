import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes safely using clsx and tailwind-merge.
 * Professional standard for dynamic styling.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}