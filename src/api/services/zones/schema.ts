import { z } from 'zod'
import { QuestionItemResponseSchema } from '@/api/services/projects/schema.ts'

export const UpsertZoneSchema = z.object({
	id_zones: z.number().optional(),
	id_projects: z.number(),
	id_images: z.number(),
	name: z.string().nonempty({ message: 'Input.validation.required' }),
	questions: z.array(QuestionItemResponseSchema),
	coordinates: z.object({
		color: z.string().nonempty({ message: 'Input.validation.required' }),
		name: z.string().nonempty({ message: 'Input.validation.required' }),
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
