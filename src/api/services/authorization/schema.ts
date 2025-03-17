import { z } from 'zod'

export const LoginSchema = z.object({
	username: z.string().nonempty({ message: 'Error.required' }),
	password: z.string().nonempty({ message: 'Error.required' }),
	// .min(MIN_PASSWORD_LENGTH, {
	// 	message: 'Error.password.min',
	// }),
})

export type LoginPayload = z.infer<typeof LoginSchema>

export const LoginResponseSchema = z.object({
	lang: z.string(),
	session_id: z.string(),
	token: z.string(),
})
