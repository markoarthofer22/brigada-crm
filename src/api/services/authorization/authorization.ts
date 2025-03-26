import axios from 'axios'
import api from '@/api/axios.ts'
import {
	GetRefreshTokenSchema,
	LoginPayload,
	LoginResponseSchema,
	LoginSchema,
} from '@/api/services/authorization/schema.ts'

export async function login(data: LoginPayload) {
	const parsedData = LoginSchema.parse(data)
	const response = await api.post('/user/login', parsedData)

	return LoginResponseSchema.parse(response.data)
}

export async function logout() {
	const response = await api.post('/user/logout', {})

	return response.data
}

export async function getUserRefreshToken(refresh_token: string) {
	const response = await axios.post(
		import.meta.env.VITE_DOMAIN_PATH + '/user/refresh-token',
		{ refresh_token }
	)

	return GetRefreshTokenSchema.parse(response.data)
}
