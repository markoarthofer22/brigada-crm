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
})

export type User = z.infer<typeof UserResponseSchema>
