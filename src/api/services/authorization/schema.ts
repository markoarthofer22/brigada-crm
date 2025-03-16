import { z } from 'zod'
import { MIN_PASSWORD_LENGTH } from '@/api/services/authorization/const.ts'

export const LoginSchema = z.object({
  username: z.string().nonempty({ message: 'error.required' }),
  password: z
    .string()
    .nonempty({ message: 'error.required' })
    .min(MIN_PASSWORD_LENGTH, {
      message: 'error.password.min',
    }),
})

export type LoginPayload = z.infer<typeof LoginSchema>

export const LoginResponseSchema = z.object({
  username: z.string().optional(),
})
