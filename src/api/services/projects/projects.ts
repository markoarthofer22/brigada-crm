import axios from '@/api/axios.ts'
import {
	AllProjectsResponseSchema,
	ProjectDetails,
	ProjectDetailsResponseSchema,
	ProjectResponseSchema,
	ProjectUpsert,
	ProjectUpsertSchema,
	UpsertImageForProject,
	UpsertImageForProjectResponseSchema,
	UpsertImageForProjectType,
} from '@/api/services/projects/schema.ts'

export async function getProjects() {
	const response = await axios.get('/projects')

	const data = response.data.results.map((project: ProjectDetails) => ({
		...project,
		zones: project.zones.map((zone) => ({
			...zone,
			coordinates: {
				...zone.coordinates,
				points:
					typeof zone.coordinates.points === 'object'
						? Object.values(zone.coordinates.points)
						: zone.coordinates.points,
			},
		})),
	}))

	const parsedData = AllProjectsResponseSchema.parse({ results: data })

	return parsedData.results
}

export async function getProjectById(id: number) {
	const response = await axios.get(`/projects/${id}`)

	const data = {
		...response.data,
		questions: response.data.questions.map(
			(question: ProjectDetails['questions'][number]) => ({
				...question,
				required:
					question.id_questions_types === 1 || question.id_questions_types === 2
						? false
						: (JSON.parse(question?.data ?? '{}')?.required ?? false),
			})
		),
		zones: response.data.zones.map((zone: ProjectDetails['zones'][number]) => ({
			...zone,
			questions: zone.questions.map(
				(question: ProjectDetails['questions'][number]) => ({
					...question,
					required:
						question.id_questions_types === 1 ||
						question.id_questions_types === 2
							? false
							: (JSON.parse(question?.data ?? '{}')?.required ?? false),
				})
			),
			coordinates: {
				...zone.coordinates,
				points:
					typeof zone.coordinates.points === 'object'
						? Object.values(zone.coordinates.points)
						: zone.coordinates.points,
			},
		})),
	}

	return ProjectDetailsResponseSchema.parse(data)
}

export async function upsertProject(model: ProjectUpsert) {
	const parsedData = ProjectUpsertSchema.parse(model)

	const { id_projects, name, active } = parsedData

	const response = id_projects
		? await axios.put(`/projects/${id_projects}`, { data: { name, active } })
		: await axios.post('/projects', { data: { name, active } })

	if (!id_projects) {
		return ProjectResponseSchema.parse(response.data)
	} else {
		return model
	}
}

export async function deleteProject(id: number) {
	await axios.delete(`/projects/${id}`)
}

export async function upsertImageForProject(data: UpsertImageForProjectType) {
	const { id, file } = UpsertImageForProject.parse(data)

	const formData = new FormData()

	file.forEach((file) => {
		formData.append('file', file)
	})

	const response = await axios.post(`/projects/${id}/image`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	})

	return UpsertImageForProjectResponseSchema.parse(response.data)
}

export async function deleteImageForProject(
	projectId: number,
	imageId: number
) {
	await axios.delete(`/projects/${projectId}/image/${imageId}`)
}
