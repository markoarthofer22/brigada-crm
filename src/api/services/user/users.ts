import axios from '@/api/axios.ts'
import {
	AllUsersResponseSchema,
	UserResponseSchema,
	UserType,
	UserUpsert,
	UserUpsertSchema,
} from '@/api/services/user/schema.ts'

export async function getUsers() {
	const response = await axios.get('/user')

	const parsedData = AllUsersResponseSchema.parse(response.data)

	return parsedData.results
}

export async function getUserById(id: number) {
	const response = await axios.get(`/user/${id}`)

	return UserResponseSchema.parse(response.data)
}

export async function upsertUser(model: UserUpsert) {
	const parsedData = UserUpsertSchema.parse(model)

	const { id_users, admin, ...rest } = parsedData

	const data = {
		data: {
			...rest,
		},
		admin: admin === UserType.ADMIN,
	}

	const response = id_users
		? await axios.put(`/user/${id_users}`, data)
		: await axios.post('/user', data)

	if (!id_users) {
		return UserResponseSchema.parse(response.data)
	} else {
		return model
	}
}

export async function deleteUser(id: number) {
	await axios.delete(`/user/${id}`)
}
