import { z } from 'zod'

export const ProjectResponseSchema = z.object({
	id_projects: z.number(),
	created_at: z.string(),
	name: z.string(),
})

export const AllProjectsResponseSchema = z.object({
	results: z.array(ProjectResponseSchema),
})

export type Project = z.infer<typeof ProjectResponseSchema>

export const ProjectUpsertSchema = z.object({
	id_projects: z.number().optional(),
	name: z.string(),
	otherField: z.string().optional(),
})

export type ProjectUpsert = z.infer<typeof ProjectUpsertSchema>
