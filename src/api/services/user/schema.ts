import { z } from 'zod'

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
	created_at: z.string().optional(),
})

export const AllUsersResponseSchema = z.object({
	results: z.array(UserResponseSchema),
})

export type User = z.infer<typeof UserResponseSchema>
