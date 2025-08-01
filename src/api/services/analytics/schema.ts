import { z } from 'zod'

export const AnalyticsPayloadSchema = z.object({
	id_projects: z.number(),
	xfrom: z.string().datetime().optional(),
	xto: z.string().datetime().optional(),
	interval: z.number().optional(),
})

export type AnalyticsPayload = z.infer<typeof AnalyticsPayloadSchema>
