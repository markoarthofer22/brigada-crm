import { z } from 'zod'

export const AnalyticsPayloadSchema = z.object({
	id_projects: z.number(),
	from: z.string().datetime().optional(),
	to: z.string().datetime().optional(),
	interval: z.number().optional(),
	extraQuery: z.record(z.string(), z.array(z.string())).nullable(),
})

export type AnalyticsPayload = z.infer<typeof AnalyticsPayloadSchema>
