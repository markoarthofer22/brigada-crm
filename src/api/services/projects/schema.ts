import { z } from 'zod'
import { MAX_FILE_UPLOAD_SIZE, MAX_FILES } from '@/consts/dropzone-defaults'

export enum ActiveStatus {
	INACTIVE,
	ACTIVE,
}

export enum TabsEnum {
	IMAGE = 'image',
	QUESTIONS = 'questions',
	ZONES = 'zones',
}

export enum ProjectType {
	PROJECT = '1',
	TEMPLATE = '2',
}

export const ProjectResponseSchema = z.object({
	id_projects: z.number(),
	created_at: z.string(),
	name: z.string(),
	active: z.nativeEnum(ActiveStatus).default(ActiveStatus.ACTIVE),
	otherField: z.string().optional(),
})

export const StaticQuestionItemResponseSchema = z.object({
	data: z
		.object({
			required: z.boolean().optional(),
		})
		.optional()
		.nullable(),
	id_projects: z.number(),
	id_questions: z.number(),
	id_questions_types: z.number(),
	label: z.string(),
	possible_answers: z.array(z.union([z.number(), z.string()])),
	subquestions: z.array(
		z.object({
			possible_answers: z.array(z.union([z.number(), z.string()])),
			id_questions_types: z.number(),
			label: z.string(),
			data: z
				.object({
					required: z.boolean().optional(),
				})
				.optional()
				.nullable(),
		})
	),
})

export type StaticQuestionItem = z.infer<
	typeof StaticQuestionItemResponseSchema
>

export const QuestionItemResponseSchema = z.object({
	id_questions: z.number(),
	id_projects: z.number(),
	id_zones: z.number().optional().nullable(),
	id_questions_types: z.number(),
	order: z.number(),
	label: z.string(),
	possible_answers: z.record(z.string()),
	required: z.boolean().optional(),
	data: z
		.object({
			required: z.boolean().optional(),
		})
		.optional()
		.nullable(),
})

export const ProjectDetailsResponseSchema = ProjectResponseSchema.extend({
	path: z.string().optional(),
	type: z.nativeEnum(ProjectType),
	images: z
		.array(
			z.object({
				id_images: z.number(),
				name: z.string(),
				data: z.object({
					height: z.number(),
					width: z.number(),
					file_name: z.string(),
				}),
			})
		)
		.optional(),
	zones: z.array(
		z.object({
			id_zones: z.number(),
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
			id_images: z.number(),
			id_projects: z.number(),
			questions: z.array(QuestionItemResponseSchema),
		})
	),
	questions: z.array(QuestionItemResponseSchema),
	static_questions: z.array(StaticQuestionItemResponseSchema),
})

export const AllProjectsResponseSchema = z.object({
	results: z.array(ProjectDetailsResponseSchema),
})

export type Project = z.infer<typeof ProjectResponseSchema>

export type ProjectDetails = z.infer<typeof ProjectDetailsResponseSchema>

export const ProjectUpsertSchema = z.object({
	id_projects: z.number().optional(),
	name: z.string(),
	active: z.nativeEnum(ActiveStatus).default(ActiveStatus.ACTIVE),
	otherField: z.string().optional(),
	type: z.nativeEnum(ProjectType).default(ProjectType.PROJECT),
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
