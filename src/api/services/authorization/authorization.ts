import axios from '@/api/axios.ts'
import {
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
