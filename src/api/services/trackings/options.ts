import { queryOptions } from '@tanstack/react-query'
import {
	getTrackingById,
	getTrackings,
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
