import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ProjectDetails } from '@/api/services/projects/schema.ts'
import {
	deleteQuestion,
	upsertQuestion,
} from '@/api/services/questions/questions.ts'
import { QuestionUpsertType } from '@/api/services/questions/schema.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button'
import { QuestionDialog } from '@/features/project-details/(components)/question-action-dialog'
import { QuestionItem } from '@/features/project-details/(components)/question-item'

interface QuestionLayoutProps {
	questions?: ProjectDetails['questions']
	projectId: number
}

const QuestionLayout = ({ questions = [], projectId }: QuestionLayoutProps) => {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()
	const queryClient = useQueryClient()
	const { showLoader, hideLoader } = useLoader()
	const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false)

	const deleteQuestionMutation = useMutation({
		mutationFn: (id: number) => {
			showLoader()
			return deleteQuestion(id)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			})
			hideLoader()
			toast.success(t('ProjectDetails.questions.deleteSuccess'))
		},
		onError: (error) => {
			hideLoader()
			handleError(error)
		},
	})

	const upsertQuestionMutation = useMutation({
		mutationFn: (data: QuestionUpsertType) => {
			if (data.id_questions) {
				showLoader()
			}
			return upsertQuestion(data)
		},
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			})

			hideLoader()

			toast.success(
				t(
					`ProjectDetails.questions.${res.id_questions ? 'editSuccess' : 'addSuccess'}`
				)
			)

			setAddDialogOpen(false)
		},
		onError: (error) => {
			hideLoader()
			handleError(error)
		},
	})

	const handleUpsert = (data: QuestionUpsertType) => {
		upsertQuestionMutation.mutate(data)
	}

	const handleDelete = (id: number) => {
		deleteQuestionMutation.mutate(id)
	}

	return (
		<>
			<div className='mb-4 mt-6 flex justify-end'>
				<Button
					onClick={() => setAddDialogOpen(true)}
					className='flex items-center gap-1'
				>
					<IconCirclePlusFilled className='h-4 w-4' />
					{t('ProjectDetails.questions.addQuestion')}
				</Button>
			</div>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{questions?.map((question) => (
					<QuestionItem
						question={question}
						key={question.id_questions}
						isLoading={
							upsertQuestionMutation.isPending ||
							deleteQuestionMutation.isPending
						}
						onEdit={handleUpsert}
						onDelete={handleDelete}
					/>
				))}
			</div>

			<QuestionDialog
				open={addDialogOpen}
				isLoading={
					upsertQuestionMutation.isPending || deleteQuestionMutation.isPending
				}
				onOpenChange={setAddDialogOpen}
				onSubmit={handleUpsert}
				projectId={projectId}
				isEditing={false}
			/>
		</>
	)
}

export default QuestionLayout
