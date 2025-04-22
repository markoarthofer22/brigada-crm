import { z } from 'zod'

export const QuestionUpsertSchema = z.object({
	id_questions: z.number().optional(),
	id_projects: z.number(),
	id_questions_types: z.number(),
	order: z.number().optional(),
	id_zones: z.number().optional().nullable(),
	label: z.string(),
	possible_answers: z.array(z.string()).optional(),
})

export const QuestionResponseSchema = QuestionUpsertSchema.omit({
	possible_answers: true,
}).extend({
	possible_answers: z.record(z.string()),
})

export type QuestionUpsertType = z.infer<typeof QuestionUpsertSchema>

export const UpsertQuestionOrderSchema = z.object({
	id_questions: z.array(z.number()),
	id_projects: z.number(),
})

export type UpsertQuestionOrder = z.infer<typeof UpsertQuestionOrderSchema>
