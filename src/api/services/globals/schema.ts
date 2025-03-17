import { z } from 'zod'
import { UserResponseSchema } from '@/api/services/user/schema.ts'
import { Languages } from '@/stores/authStore.ts'

export const GlobalSettingsResponse = z.object({
	user: UserResponseSchema.nullable(),
	lang: z.nativeEnum(Languages),
	session_id: z.string(),
	questions_types: z
		.record(
			z.string(),
			z.object({
				id_questions_types: z.number(),
				type: z.string(),
				description: z.string(),
				free_input: z.boolean(),
			})
		)
		.optional()
		.nullable(),
})
