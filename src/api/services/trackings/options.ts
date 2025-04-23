import { queryOptions } from '@tanstack/react-query'
import {
	geAnswersForSpecificTracking,
	getTrackingById,
	getTrackings,
	getZonesForActiveTracking,
} from '@/api/services/trackings/trackings.ts'

export const getAllTrackings = (projectId: number) => {
	return queryOptions({
		queryKey: ['trackings', projectId],
		queryFn: () => getTrackings(projectId),
	})
}

export const getProjectById = (id: number) => {
	return queryOptions({
		queryKey: ['trackings', 'single-tracking', id],
		queryFn: () => getTrackingById(id),
	})
}

export const getAnswerForSpecificTracking = (trackingId: number) => {
	return queryOptions({
		queryKey: ['trackings', 'answers', trackingId],
		queryFn: () => geAnswersForSpecificTracking(trackingId),
	})
}

export const getZonesForTracking = (trackingId: number) => {
	return queryOptions({
		queryKey: ['trackings', 'zones', trackingId],
		queryFn: () => getZonesForActiveTracking(trackingId),
		enabled: !!trackingId,
	})
}
