import { z } from 'zod'
import { QuestionResponseSchema } from '@/api/services/questions/schema.ts'

export const TrackingsSchema = z.object({
	id_tracking: z.number(),
	id_projects: z.number(),
	data: z.array(z.any()),
	started_at: z.string(),
	ended_at: z.string().nullable(),
	id_users: z.number().optional(),
	// test
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
	question: QuestionResponseSchema,
	answer: z.object({
		answer: z.string(),
	}),
	order: z.number().optional(),
})

export type TrackingsAnswerUpsert = z.infer<typeof TrackingAnswerUpsertSchema>
