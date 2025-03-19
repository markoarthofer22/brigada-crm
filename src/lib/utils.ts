import { ZodError } from 'zod'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { isAxiosError } from '@/api/axios.ts'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const getErrorMessage = (error: unknown) => {
	if (error instanceof ZodError) {
		return error.errors
			.map((err) => `${err.path.join('.').toUpperCase()}: ${err.message}`)
			.join('\n')
			.replace(',', '')
	}

	if (isAxiosError(error)) {
		return error?.response?.data?.StatusText?.Message || 'An error occurred'
	}

	if (error instanceof Error) {
		return error.message
	}

	if (typeof error === 'string') {
		return error
	}

	return 'An error occurred'
}

export const getInitials = (firstName: string, lastName: string) => {
	return `${firstName.charAt(0)}.${lastName.charAt(0)}.`
}

export const formatDate = (
	date: string | Date | null,
	options?: {
		locale?: string
		year?: 'numeric' | '2-digit'
		month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
		day?: 'numeric' | '2-digit'
		showTime?: boolean
	}
) => {
	if (!date) return ''

	const locale = options?.locale || 'en-US'
	const year =
		options?.year === undefined || options?.year === null
			? undefined
			: (options.year ?? 'numeric')

	const showTime = options?.showTime
		? {
				hour: 'numeric' as const,
				minute: 'numeric' as const,
				hour12: false,
			}
		: {}

	return new Intl.DateTimeFormat(locale, {
		year: year,
		month: options?.month ?? '2-digit',
		day: options?.day || '2-digit',
		...showTime,
	}).format(new Date(date))
}
