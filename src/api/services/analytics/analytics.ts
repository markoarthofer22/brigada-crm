import api from '@/api/axios.ts'
import {
	AnalyticsPayload,
	AnalyticsPayloadSchema,
} from '@/api/services/analytics/schema.ts'

export async function getAnalytics(payload: AnalyticsPayload) {
	const { extraQuery, ...rest } = AnalyticsPayloadSchema.parse(payload)

	const queryFromExtra = extraQuery
		? Object.fromEntries(
				Object.entries(extraQuery).map(([key, value]) => [key, value.join(',')])
			)
		: {}

	const queryString = new URLSearchParams(queryFromExtra).toString()

	const response = await api.post(
		`/analytics${queryString === '' ? '' : `?${queryString}`}`,
		rest
	)

	return response.data
}
