import { z } from 'zod'

export const TrackingsSchema = z.object({
	id_tracking: z.number(),
	id_projects: z.number(),
	data: z.union([
		z.array(z.any()), // []
		z.record(z.any()), // {}
	]),
	started_at: z.string(),
	ended_at: z.string().nullable(),
	id_users: z.number().optional(),
	id_tracking_count: z.number().optional(),
	color: z.string().optional(),
	zones: z.array(z.any()).optional(),
})

export type Trackings = z.infer<typeof TrackingsSchema>

export const GetTrackingsResponseSchema = z.object({
	results: z.array(TrackingsSchema),
})

export const TrackingAnswerUpsertSchema = z.object({
	id_tracking: z.number(),
	id_tracking_answers: z.number().optional(),
	id_projects: z.number(),
	id_questions: z.number(),
	id_zones: z.number().optional().nullable(),
	id_tracking_zones: z.number().optional().nullable(),
	question: z.any(),
	answer: z.object({
		answer: z.string(),
	}),
	order: z.number().optional(),
})

export type TrackingsAnswerUpsert = z.infer<typeof TrackingAnswerUpsertSchema>

export const TrackingZonesForTrackingSchema = z.object({
	id_tracking_zones: z.number(),
	id_zones: z.number(),
	id_tracking: z.number(),
	id_projects: z.number(),
	started_at: z.string(),
	ended_at: z.string().nullable(),
	name: z.string().optional(),
})

export type StartZonePayload = {
	id_tracking: number
	id_projects: number
	id_zones: number
}

export const GetTrackingZonesForTrackingResponseSchema = z.object({
	results: z.array(TrackingZonesForTrackingSchema),
})

export const getTrackingZoneAnswersForTrackingSchema = z.object({
	id_projects: z.number(),
	id_tracking: z.number(),
	id_questions: z.number().optional(),
	id_tracking_zones: z.number(),
	id_zones: z.number(),
	started_at: z.string(),
	ended_at: z.string().nullable(),
	answers: z.array(TrackingAnswerUpsertSchema),
})
