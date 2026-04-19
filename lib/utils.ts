import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const INR_CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINRCurrency(value: number) {
  return INR_CURRENCY_FORMATTER.format(value)
}
