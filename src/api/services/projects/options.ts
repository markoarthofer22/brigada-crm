import { queryOptions } from '@tanstack/react-query'
import {
	getProjectById as getProjectByIdApi,
	getProjects,
} from '@/api/services/projects/projects.ts'

export const getAllProjects = () => {
	return queryOptions({
		queryKey: ['projects'],
		queryFn: getProjects,
	})
}

export const getProjectById = (id: number) => {
	return queryOptions({
		queryKey: ['projects', id],
		queryFn: () => getProjectByIdApi(id),
	})
}
