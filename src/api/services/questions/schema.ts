import { z } from 'zod'

export const QuestionUpsertSchema = z.object({
	id_projects: z.number(),
	label: z.string(),
	id_questions_types: z.number(),
	id_questions: z.number().optional(),
	order: z.number().optional(),
	possible_answers: z.array(z.string()).optional(),
})

export const QuestionResponseSchema = QuestionUpsertSchema.omit({
	possible_answers: true,
}).extend({
	possible_answers: z.record(z.string()),
})

export type QuestionUpsertType = z.infer<typeof QuestionUpsertSchema>
