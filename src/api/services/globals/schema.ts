import { z } from 'zod'
import { UserResponseSchema } from '@/api/services/user/schema.ts'
import { Languages } from '@/stores/authStore.ts'

export const LastUsersSchema = UserResponseSchema.omit({
	admin: true,
	email: true,
	firstname: true,
	lastname: true,
	active: true,
}).extend({
	firstname: z.string().nullable(),
	lastname: z.string().nullable(),
	time_since_last_log: z.object({
		period: z.number(),
		span: z.string(),
	}),
})

export type LastUsers = z.infer<typeof LastUsersSchema>

export const GlobalSettingsResponse = z.object({
	user: UserResponseSchema.nullable(),
	lang: z.nativeEnum(Languages),
	session_id: z.string(),
	last10Users: z.array(LastUsersSchema).nullable(),
	questions_types: z
		.array(
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

export type GlobalsSettings = z.infer<typeof GlobalSettingsResponse>
