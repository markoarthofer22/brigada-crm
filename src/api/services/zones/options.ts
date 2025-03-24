import { queryOptions } from '@tanstack/react-query'
import { getAllZones as getAllZonesApi } from '@/api/services/zones/zones.ts'

export const getAllZones = () => {
	return queryOptions({
		queryKey: ['zones'],
		queryFn: getAllZonesApi,
	})
}
