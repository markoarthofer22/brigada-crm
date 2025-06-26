import { queryOptions } from '@tanstack/react-query'
import {
	getProjectById as getProjectByIdApi,
	getProjects,
} from '@/api/services/projects/projects.ts'
import { ProjectType } from '@/api/services/projects/schema.ts'

export const getAllProjects = (type: ProjectType) => {
	const _type = type || ProjectType.PROJECT

	return queryOptions({
		queryKey: ['projects', _type],
		queryFn: () => getProjects(_type),
	})
}

export const getProjectById = (id: number) => {
	return queryOptions({
		queryKey: ['projects', id],
		queryFn: () => getProjectByIdApi(id),
	})
}
