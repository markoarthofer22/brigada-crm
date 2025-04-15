import axios from '@/api/axios.ts'
import {
	GetTrackingsResponseSchema,
	TrackingsSchema,
} from '@/api/services/trackings/schema.ts'

export async function getTrackings(projectId: number) {
	const response = await axios.get(`/tracking?id_projects=${projectId}`)

	const parsedData = GetTrackingsResponseSchema.parse(response.data)

	return parsedData.results
}

export async function getTrackingById(id: number) {
	const response = await axios.get(`/tracking/${id}`)

	return TrackingsSchema.parse(response.data)
}
