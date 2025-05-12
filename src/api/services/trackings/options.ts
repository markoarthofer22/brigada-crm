import { queryOptions } from '@tanstack/react-query'
import {
	getAnswersForSpecificTracking,
	getAnswersForSpecificZoneInTracking,
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
		queryFn: () => getAnswersForSpecificTracking(trackingId),
	})
}

export const getAnswerForSpecificZoneInTracking = (trackingId: number) => {
	return queryOptions({
		queryKey: ['trackings', 'answer-zones', trackingId],
		queryFn: () => getAnswersForSpecificZoneInTracking(trackingId),
	})
}

export const getZonesForTracking = (trackingId: number) => {
	return queryOptions({
		queryKey: ['trackings', 'zones', trackingId],
		queryFn: () => getZonesForActiveTracking(trackingId),
		enabled: !!trackingId,
	})
}
