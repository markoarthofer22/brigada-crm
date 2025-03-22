import { z } from 'zod'
import { MAX_FILE_UPLOAD_SIZE, MAX_FILES } from '@/consts/dropzone-defaults'

export const ProjectResponseSchema = z.object({
	id_projects: z.number(),
	created_at: z.string(),
	name: z.string(),
	otherField: z.string().optional(),
})

export const ProjectDetailsResponseSchema = ProjectResponseSchema.extend({
	path: z.string().optional(),
	images: z
		.array(
			z.object({
				id_images: z.number(),
				name: z.string(),
			})
		)
		.optional(),
	zones: z.array(
		z.object({
			name: z.string(),
			coordinates: z.object({
				color: z.string(),
				name: z.string(),
				points: z.array(
					z.object({
						x: z.number(),
						y: z.number(),
					})
				),
			}),
			id_images: z.number().optional(),
			id_projects: z.number(),
		})
	),
	questions: z.array(
		z.object({
			id_questions: z.number(),
			id_projects: z.number(),
			id_questions_types: z.number(),
			order: z.number(),
			label: z.string(),
			possible_answers: z.object({}).nullable(),
		})
	),
})

export const AllProjectsResponseSchema = z.object({
	results: z.array(ProjectResponseSchema),
})

export type Project = z.infer<typeof ProjectResponseSchema>

export type ProjectDetails = z.infer<typeof ProjectDetailsResponseSchema>

export const ProjectUpsertSchema = z.object({
	id_projects: z.number().optional(),
	name: z.string(),
	otherField: z.string().optional(),
})

export type ProjectUpsert = z.infer<typeof ProjectUpsertSchema>

export const UpsertImageForProject = z.object({
	id: z.number(),
	file: z
		.array(
			z.instanceof(File).refine((file) => file.size < MAX_FILE_UPLOAD_SIZE, {
				message: 'Input.validation.fileSize',
			})
		)
		.max(MAX_FILES, {
			message: 'Input.validation.maxFiles',
		})
		.min(1, { message: 'Input.validation.required' }),
})

export type UpsertImageForProjectType = z.infer<typeof UpsertImageForProject>

export const UpsertImageForProjectResponseSchema = z.object({
	name: z.string(),
	id_images: z.number(),
})
