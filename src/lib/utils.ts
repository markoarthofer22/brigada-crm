import { ZodError } from 'zod'
import axios from 'axios'
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
		return (
			error?.response?.data?.StatusText?.Message ??
			error.message ??
			'An error occurred'
		)
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

export const convertUrlToFile = async (
	url?: string | null
): Promise<File[] | null> => {
	try {
		if (!url) {
			return null
		}

		const response = await axios.get(url, {
			responseType: 'blob',
		})

		const blob = response.data
		const file = new File([blob], 'image', { type: blob.type })

		return [file]
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Error converting URL to file:', error)
		throw error
	}
}

export const hexToRgba = (hex: string, alpha: number): string => {
	let cleaned = hex.replace('#', '')
	if (cleaned.length === 3) {
		cleaned = cleaned
			.split('')
			.map((char) => char + char)
			.join('')
	}
	const r = parseInt(cleaned.substring(0, 2), 16)
	const g = parseInt(cleaned.substring(2, 4), 16)
	const b = parseInt(cleaned.substring(4, 6), 16)
	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const getRandomHexColor = (): string => {
	return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

export const getContrastColor = (hex: string): string => {
	const color = hex.replace('#', '')

	if (color.length !== 6) {
		throw new Error('Invalid hex color format. Expected a 6-digit hex.')
	}

	const r = parseInt(color.substring(0, 2), 16)
	const g = parseInt(color.substring(2, 4), 16)
	const b = parseInt(color.substring(4, 6), 16)

	const brightness = (r * 299 + g * 587 + b * 114) / 1000
	return brightness > 128 ? '#000000' : '#FFFFFF'
}

export function isIOS() {
	const { userAgent } = window.navigator
	return /iphone|ipad|ipod/i.test(userAgent)
}

export function isAndroid() {
	const { userAgent } = window.navigator
	return /(android)/i.test(userAgent)
}

export const isInStandaloneMode = () =>
	'standalone' in window.navigator &&
	(window.navigator as any).standalone === true
