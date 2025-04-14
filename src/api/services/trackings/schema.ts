import { z } from 'zod'

export const TrackingsSchema = z.object({
	id_trackings: z.number(),
	id_projects: z.number(),
	data: z.record(z.any()).optional(),
	started_at: z.string(),
	ended_at: z.string().nullable(),
})

export type Trackings = z.infer<typeof TrackingsSchema>

export const GetTrackingsResponseSchema = z.object({
	results: z.array(TrackingsSchema),
})
