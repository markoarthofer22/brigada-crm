import api from '@/api/axios.ts'
import { AnalyticsPayload } from '@/api/services/analytics/schema.ts'

export async function getAnalytics(payload: AnalyticsPayload) {
	const response = await api.post('/analytics', payload)

	return response.data
}
