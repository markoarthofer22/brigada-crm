import axios from '@/api/axios.ts'
import {
	QuestionResponseSchema,
	QuestionUpsertSchema,
	QuestionUpsertType,
	UpsertQuestionOrder,
} from '@/api/services/questions/schema.ts'

export async function upsertQuestion(model: QuestionUpsertType) {
	const parsedData = QuestionUpsertSchema.parse(model)

	const { id_questions, ...rest } = parsedData

	const response = id_questions
		? await axios.put(`/questions/${id_questions}`, rest)
		: await axios.post('/questions', rest)

	if (!id_questions) {
		return QuestionResponseSchema.parse(response.data)
	} else {
		return parsedData
	}
}

export async function deleteQuestion(id: number) {
	await axios.delete(`/questions/${id}`)
}

export async function upsertQuestionOrder(model: UpsertQuestionOrder) {
	await axios.post(`/questions/order`, model)
}

export async function getAllQuestions() {
	const response = await axios.get('/questions')
	return QuestionResponseSchema.array().parse(response.data.results)
}
