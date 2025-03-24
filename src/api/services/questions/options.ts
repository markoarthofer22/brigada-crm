import { queryOptions } from '@tanstack/react-query'
import { getAllQuestions as getAllQuestionsApi } from '@/api/services/questions/questions.ts'

export const getAllQuestions = () => {
	return queryOptions({
		queryKey: ['questions'],
		queryFn: getAllQuestionsApi,
	})
}
