import { queryOptions } from '@tanstack/react-query'
import {
	getUserById as getUserByIdApi,
	getUsers,
} from '@/api/services/user/users.ts'

export const getAllUsers = () => {
	return queryOptions({
		queryKey: ['users'],
		queryFn: getUsers,
	})
}

export const getUserById = (id: number) => {
	return queryOptions({
		queryKey: ['users', id],
		queryFn: () => getUserByIdApi(id),
	})
}
