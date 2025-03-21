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

export const getFileExtensionHelperText = (
	availableExtensions: string[],
	toUpperCase = true
) => {
	if (!availableExtensions || availableExtensions.length === 0) return undefined

	return (
		availableExtensions
			.slice(0, -1)
			.map((ext) => (toUpperCase ? ext.toUpperCase() : ext))
			.join(', ') +
		' or ' +
		availableExtensions[availableExtensions.length - 1].toUpperCase()
	)
}

export const bytesToMB = (bytes: number, round = true) => {
	if (round) {
		return Math.round(bytes / (1024 * 1024)).toString()
	}

	return (bytes / (1024 * 1024)).toFixed(2)
}
