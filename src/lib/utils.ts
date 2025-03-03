import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encode(buffer: Uint8Array): string {
  return Buffer.from(buffer).toString('base64');
}
