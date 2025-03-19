import { z } from 'zod'
import { MIN_PASSWORD_LENGTH } from '@/api/services/authorization/const.ts'

export const LoginSchema = z.object({
	username: z.string().nonempty({ message: 'Error.required' }),
	password: z
		.string()
		.nonempty({ message: 'Error.required' })
		.min(MIN_PASSWORD_LENGTH, {
			message: 'Error.password.min',
		}),
})

export type LoginPayload = z.infer<typeof LoginSchema>

export const LoginResponseSchema = z.object({
	lang: z.string(),
	session_id: z.string(),
	access_token: z.string(),
	refresh_token: z.string(),
})

export const GetRefreshTokenSchema = z.object({
	refresh_token: z.string().nonempty({ message: 'Error.required' }),
	access_token: z.string().nonempty({ message: 'Error.required' }),
})
