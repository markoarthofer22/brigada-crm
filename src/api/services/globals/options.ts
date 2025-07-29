import { queryOptions } from '@tanstack/react-query'
import {
	getGlobalSettings as getGlobalsSettingsApi,
	pingServer as pingServerApi,
} from '@/api/services/globals/globals.ts'

export const getGlobalSettings = () => {
	return queryOptions({
		queryKey: ['globalSettings'],
		queryFn: getGlobalsSettingsApi,
	})
}

export const pingServer = () => {
	return queryOptions({
		queryKey: ['pingServer'],
		queryFn: pingServerApi,
		staleTime: 0,
		gcTime: 0,
		refetchInterval: 5000,
	})
}
