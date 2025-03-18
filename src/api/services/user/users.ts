import axios from '@/api/axios.ts'
import { AllUsersResponseSchema } from '@/api/services/user/schema.ts'

export async function getUsers() {
	const response = await axios.get('/user')

	const parsedData = AllUsersResponseSchema.parse(response.data)

	return parsedData.results
}
