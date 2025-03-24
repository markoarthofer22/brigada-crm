import { z } from 'zod'

export const UpsertZoneSchema = z.object({
	id_zones: z.number().optional(),
	id_projects: z.number(),
	id_images: z.number(),
	name: z.string().nonempty({ message: 'Input.validation.required' }),
	coordinates: z.object({
		color: z.string().nonempty({ message: 'Input.validation.required' }),
		name: z.string().nonempty({ message: 'Input.validation.required' }),
		radius: z.number().optional(),
		points: z.array(
			z.object({
				x: z.number(),
				y: z.number(),
			})
		),
	}),
	data: z.record(z.any()).optional(),
})

export type UpsertZone = z.infer<typeof UpsertZoneSchema>

export const UpsertZoneResponseSchema = z.object({
	id_zones: z.number().optional(),
	data: z.record(z.any()).optional().nullable(),
	id_images: z.number(),
	id_projects: z.number(),
	name: z.string(),
})
