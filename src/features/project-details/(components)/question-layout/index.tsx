import { useState } from 'react'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { ProjectDetails } from '@/api/services/projects/schema.ts'
import { Button } from '@/components/ui/button'
import { QuestionDialog } from '@/features/project-details/(components)/question-action-dialog'
import { QuestionItem } from '@/features/project-details/(components)/question-item'

interface QuestionLayoutProps {
	questions?: ProjectDetails['questions']
	projectId: number
}

const QuestionLayout = ({ questions = [], projectId }: QuestionLayoutProps) => {
	const { t } = useTranslation()

	const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false)

	const handleAddQuestion = (data: any) => {
		console.log('data', data)
	}

	const handleEditQuestion = (data: any) => {
		console.log('data', data)
	}

	const handleDeleteQuestion = (data: any) => {
		console.log('data', data)
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
						disabled
						question={question}
						key={question.id_questions}
						onEdit={handleEditQuestion}
						onDelete={handleDeleteQuestion}
					/>
				))}
			</div>

			<QuestionDialog
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
				onSubmit={handleAddQuestion}
				projectId={projectId}
				isEditing={false}
			/>
		</>
	)
}

export default QuestionLayout
