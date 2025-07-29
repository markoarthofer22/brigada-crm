import { z } from 'zod'

export const AnalyticsPayloadSchema = z.object({
	id_projects: z.string(),
	xfrom: z.string().datetime().optional(),
	xto: z.string().datetime().optional(),
	interval: z.union([z.literal(15), z.literal(30), z.literal(60)]).optional(),
})

export type AnalyticsPayload = z.infer<typeof AnalyticsPayloadSchema>
