import axios from '@/api/axios.ts'
import {
	GetRefreshTokenSchema,
	LoginPayload,
	LoginResponseSchema,
	LoginSchema,
} from '@/api/services/authorization/schema.ts'

export async function login(data: LoginPayload) {
	const parsedData = LoginSchema.parse(data)
	const response = await axios.post('/user/login', parsedData)

	return LoginResponseSchema.parse(response.data)
}

export async function logout() {
	const response = await axios.post('/user/logout', {})

	return response.data
}

export async function getUserRefreshToken(refresh_token: string) {
	const response = await axios.post('/user/refresh-token', { refresh_token })

	return GetRefreshTokenSchema.parse(response.data)
}
