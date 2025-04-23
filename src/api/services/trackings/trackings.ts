import axios from '@/api/axios.ts'
import {
	GetTrackingsResponseSchema,
	GetTrackingZonesForTrackingResponseSchema,
	StartZonePayload,
	TrackingAnswerUpsertSchema,
	TrackingsAnswerUpsert,
	TrackingsSchema,
	TrackingZonesForTrackingSchema,
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

export async function addTrackingAnswer(data: TrackingsAnswerUpsert) {
	const parsedData = TrackingAnswerUpsertSchema.parse(data)

	const { id_tracking_answers, ...rest } = parsedData

	const response = id_tracking_answers
		? await axios.put(`/tracking/answers/${id_tracking_answers}`, rest)
		: await axios.post('/tracking/answers', rest)

	if (!id_tracking_answers) {
		return TrackingAnswerUpsertSchema.parse(response.data)
	} else {
		return parsedData
	}
}

export async function geAnswersForSpecificTracking(trackingId: number) {
	const response = await axios.get(
		`/tracking/answers?id_tracking=${trackingId}`
	)

	return TrackingAnswerUpsertSchema.array().parse(response.data.results)
}

export async function startNewTackingEvent(
	projectId: number,
	data?: Record<string, any>
) {
	const response = await axios.post(`/tracking`, {
		id_projects: projectId,
		data,
	})

	return TrackingsSchema.parse(response.data)
}

export async function closeTrackingEvent(trackingId: number) {
	const response = await axios.post('/tracking/end/' + trackingId)

	return response.data
}

export async function getZonesForActiveTracking(trackingId: number) {
	const response = await axios.get(`/tracking/zones?id_tracking=${trackingId}`)

	return GetTrackingZonesForTrackingResponseSchema.parse(response.data)
}

export async function startNewZoneTracking(model: StartZonePayload) {
	const response = await axios.post(`/tracking/zones`, model)

	return TrackingZonesForTrackingSchema.parse(response.data)
}

export async function closeZoneTracking(trackingId: number) {
	const response = await axios.post(`/tracking/zones/end/${trackingId}`)

	return response.data
}
