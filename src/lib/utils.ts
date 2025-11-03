import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDisplayAddress(address?: string | null): string {
  if (!address) return ""
  return address
    .replace(/\b\d{3}\s?\d{2}\b/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*,/g, ", ")
    .trim()
}
