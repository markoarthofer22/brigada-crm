import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import {
	closestCorners,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
	ProjectDetails,
	UpsertQuestionOrder,
} from '@/api/services/projects/schema.ts'
import {
	deleteQuestion,
	upsertQuestion,
	upsertQuestionOrder,
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

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

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

	const changeOrderMutation = useMutation({
		mutationFn: (data: UpsertQuestionOrder) => {
			showLoader()
			return upsertQuestionOrder(data)
		},
		onSuccess: async () => {
			hideLoader()
			toast.success(t('ProjectDetails.questions.orderUpdated'))
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

	const [draggableQuestions, setQuestions] = useState(
		questions.map((x) => ({ ...x, id: x.order }))
	)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over || !active) return

		if (active.id === over.id) return

		const findQuestionIndex = (id: number) =>
			draggableQuestions.findIndex((x) => x.id === id)

		const originalItem = findQuestionIndex(active.id as number)
		const newItem = findQuestionIndex(over.id as number)
		const newQuestionsArray = arrayMove(
			draggableQuestions,
			originalItem,
			newItem
		)

		setQuestions(newQuestionsArray)

		changeOrderMutation.mutate({
			id_questions: newQuestionsArray.map((x) => x.id_questions),
			id_projects: projectId,
		})
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
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragEnd={handleDragEnd}
			>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
					<SortableContext items={draggableQuestions}>
						{draggableQuestions?.map((question, index) => (
							<QuestionItem
								question={question}
								orderLabel={index + 1}
								key={question.id_questions}
								isLoading={
									upsertQuestionMutation.isPending ||
									deleteQuestionMutation.isPending
								}
								onEdit={handleUpsert}
								onDelete={handleDelete}
							/>
						))}
					</SortableContext>
				</div>
			</DndContext>

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
