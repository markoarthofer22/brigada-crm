import { queryOptions } from '@tanstack/react-query'
import { getGlobalSettings } from '@/api/services/globals/globals.ts'

export const useGetGlobalSettings = () => {
	return queryOptions({
		queryKey: ['globalSettings'],
		queryFn: getGlobalSettings,
	})
}
