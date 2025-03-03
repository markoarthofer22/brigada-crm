import { ZodError } from 'zod'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { isAxiosError } from '@/api/axios.ts'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.errors
      .map((err) => `${err.path.join('.').toUpperCase()}: ${err.message}`)
      .join('\n')
      .replace(',', '')
  }

  if (isAxiosError(error)) {
    return error.response?.data?.StatusText?.Message || 'An error occurred'
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An error occurred'
}
