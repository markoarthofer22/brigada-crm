import { queryOptions } from '@tanstack/react-query'
import { getUsers } from '@/api/services/user/users.ts'

export const useGetAllUsers = () => {
	return queryOptions({
		queryKey: ['users'],
		queryFn: getUsers,
	})
}
