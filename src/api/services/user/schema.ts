import { z } from 'zod'
import { MIN_PASSWORD_LENGTH } from '@/api/services/authorization/const.ts'

export enum UserType {
	REGULAR,
	ADMIN,
}

export const UserResponseSchema = z.object({
	id_users: z.number(),
	admin: z.nativeEnum(UserType),
	email: z.string().email(),
	firstname: z.string(),
	lastname: z.string(),
	created_at: z.string(),
})

export const AllUsersResponseSchema = z.object({
	results: z.array(UserResponseSchema),
})

export type User = z.infer<typeof UserResponseSchema>

export const UserUpsertSchema = z.object({
	id_users: z.number().optional(),
	email: z.string().email({ message: 'Input.validation.email' }),
	firstname: z.string().nonempty({ message: 'Input.validation.required' }),
	lastname: z.string().nonempty({ message: 'Input.validation.required' }),
	password: z
		.string()
		.min(MIN_PASSWORD_LENGTH, {
			message: 'Input.validation.password.min',
		})
		.optional()
		.or(z.literal('')),
	admin: z.nativeEnum(UserType).default(UserType.ADMIN),
})

export type UserUpsert = z.infer<typeof UserUpsertSchema>
