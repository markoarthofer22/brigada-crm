import { useCallback } from 'react'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'

export const useHandleGenericError = () => {
	const { t, i18n } = useTranslation()

	const handleError = useCallback(
		(error: unknown): Record<string, string> | void => {
			if (isAxiosError(error) && error.response?.status === 422) {
				const { errors } = error.response.data
				const formErrors: Record<string, string> = {}
				errors.forEach(({ param, msg }: { param: string; msg: string }) => {
					formErrors[param] = msg
				})
				return formErrors
			}

			const errorMessage = getErrorMessage(error)

			if (errorMessage) {
				toast.error(i18n.exists(errorMessage) ? t(errorMessage) : errorMessage)
			}
		},
		[t, i18n]
	)

	return { handleError }
}
