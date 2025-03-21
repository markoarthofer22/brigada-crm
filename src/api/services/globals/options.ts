import { queryOptions } from '@tanstack/react-query'
import { getGlobalSettings as getGlobalsSettingsApi } from '@/api/services/globals/globals.ts'

export const getGlobalSettings = () => {
	return queryOptions({
		queryKey: ['globalSettings'],
		queryFn: getGlobalsSettingsApi,
	})
}
