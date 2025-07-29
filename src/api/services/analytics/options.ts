import { queryOptions } from '@tanstack/react-query'
import { getAnalytics } from '@/api/services/analytics/analytics.ts'
import { AnalyticsPayload } from '@/api/services/analytics/schema.ts'

export const getAnalyticsForProject = (payload: AnalyticsPayload) => {
	return queryOptions({
		queryKey: ['analytics', payload],
		queryFn: () => getAnalytics(payload),
	})
}
