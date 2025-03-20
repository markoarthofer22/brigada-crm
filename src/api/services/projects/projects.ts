import axios from '@/api/axios.ts'
import {
	AllProjectsResponseSchema,
	ProjectResponseSchema,
	ProjectUpsert,
	ProjectUpsertSchema,
} from '@/api/services/projects/schema.ts'

export async function getProjects() {
	const response = await axios.get('/projects')

	const parsedData = AllProjectsResponseSchema.parse(response.data)

	return parsedData.results
}

export async function getProjectById(id: number) {
	const response = await axios.get(`/projects/${id}`)

	return ProjectResponseSchema.parse(response.data)
}

export async function upsertProject(model: ProjectUpsert) {
	const parsedData = ProjectUpsertSchema.parse(model)

	const { id_projects, name } = parsedData

	const response = id_projects
		? await axios.put(`/projects/${id_projects}`, { data: { name } })
		: await axios.post('/projects', { data: { name } })

	if (!id_projects) {
		return ProjectResponseSchema.parse(response.data)
	} else {
		return model
	}
}

export async function deleteProject(id: number) {
	await axios.delete(`/projects/${id}`)
}
