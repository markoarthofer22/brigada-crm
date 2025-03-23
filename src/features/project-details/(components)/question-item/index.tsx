import { useState } from 'react'
import { IconEdit } from '@tabler/icons-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { InfoIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProjectDetails } from '@/api/services/projects/schema.ts'
import { QuestionUpsertType } from '@/api/services/questions/schema.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { QuestionDialog } from '@/features/project-details/(components)/question-action-dialog'
import { DeleteConfirmation } from '@/features/project-details/(components)/question-delete-dialog'

interface QuestionItemProps {
	question: ProjectDetails['questions'][number]
	onChange?: (questionId: number, value: unknown) => void
	onEdit?: (updatedQuestion: QuestionUpsertType) => void
	onDelete?: (questionId: number) => void
	disabled?: boolean
	isLoading?: boolean
	orderLabel?: string | number
}

export function QuestionItem({
	question,
	onChange,
	onEdit,
	onDelete,
	disabled,
	isLoading,
	orderLabel,
}: QuestionItemProps) {
	const { t } = useTranslation()
	const questionTypes = useAuthStore((state) => state.auth.questionTypes)
	const {
		attributes,
		listeners,
		setNodeRef,
		transition,
		transform,
		isDragging,
	} = useSortable({
		id: question.order,
		transition: null,
	})

	const questionTypeOptions = questionTypes?.map((questionType) => ({
		value: questionType.id_questions_types,
		label: questionType.description,
		type: questionType.type,
		free_input: questionType.free_input,
	}))

	const [value, setValue] = useState<string | null>(null)
	const [checkboxValues, setCheckboxValues] = useState<Record<string, boolean>>(
		{}
	)
	const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

	const handleDialogOpenChange = (open: boolean) => {
		setEditDialogOpen(open)

		if (!open) {
			setValue(null)
			setCheckboxValues({})
		}
	}

	const getQuestionType = (typeId: number) => {
		return (
			questionTypeOptions?.find((type) => type.value === typeId) ||
			questionTypeOptions?.[0]
		)
	}

	const questionType = getQuestionType(question.id_questions_types)

	const handleValueChange = (newValue: any) => {
		setValue(newValue)
		if (onChange) {
			onChange(question.id_questions, newValue)
		}
	}

	const handleCheckboxChange = (answer: string, checked: boolean) => {
		const newValues = { ...checkboxValues, [answer]: checked }
		setCheckboxValues(newValues)

		if (onChange) {
			const selectedValues = Object.entries(newValues)
				.filter(([_, isChecked]) => isChecked)
				.map(([answer]) => answer)

			onChange(question.id_questions, selectedValues)
		}
	}

	const handleEditSubmit = (data: QuestionUpsertType) => {
		if (onEdit) {
			onEdit(data)
		}

		setEditDialogOpen(false)
	}

	const handleDelete = () => {
		if (onDelete) {
			onDelete(question.id_questions)
			setDeleteDialogOpen(false)
		}
	}

	const renderQuestionInput = () => {
		const questionType = getQuestionType(question.id_questions_types)

		switch (questionType?.type) {
			case 'input':
				return (
					<div className='space-y-2'>
						<Input
							disabled={disabled}
							placeholder={t('Input.placeholder.questionText')}
							value={value || ''}
							onChange={(e) => handleValueChange(e.target.value)}
						/>
						<p className='flex items-center gap-1 text-sm text-muted-foreground'>
							<InfoIcon className='size-5' />{' '}
							{t('ProjectDetails.questions.freeInput')}
						</p>
					</div>
				)

			case 'text':
				return (
					<div className='space-y-2'>
						<Textarea
							disabled={disabled}
							placeholder={t('Input.placeholder.questionText')}
							value={value || ''}
							onChange={(e) => handleValueChange(e.target.value)}
						/>
						<p className='flex items-center gap-1 text-sm text-muted-foreground'>
							<InfoIcon className='size-5' />{' '}
							{t('ProjectDetails.questions.freeTextArea')}
						</p>
					</div>
				)

			case 'radio':
				return (
					<RadioGroup value={value || ''} onValueChange={handleValueChange}>
						{Object.values(question.possible_answers)?.map((answer, index) => (
							<div key={index} className='flex items-center space-x-2'>
								<RadioGroupItem
									disabled={disabled}
									value={answer}
									id={`radio-${question.id_questions}-${index}`}
								/>
								<Label htmlFor={`radio-${question.id_questions}-${index}`}>
									{answer}
								</Label>
							</div>
						))}
					</RadioGroup>
				)

			case 'checkbox':
				return (
					<div className='space-y-2'>
						{Object.values(question.possible_answers)?.map((answer, index) => (
							<div key={index} className='flex items-center space-x-2'>
								<Checkbox
									disabled={disabled}
									id={`checkbox-${question.id_questions}-${index}`}
									checked={checkboxValues[answer] || false}
									onCheckedChange={(checked) =>
										handleCheckboxChange(answer, checked as boolean)
									}
								/>
								<Label htmlFor={`checkbox-${question.id_questions}-${index}`}>
									{answer}
								</Label>
							</div>
						))}
					</div>
				)

			case 'select':
				return (
					<Select
						disabled={disabled}
						value={value || ''}
						onValueChange={handleValueChange}
					>
						<SelectTrigger>
							<SelectValue placeholder={t('Input.placeholder.select')} />
						</SelectTrigger>
						<SelectContent>
							{Object.values(question.possible_answers)?.map(
								(answer, index) => (
									<SelectItem key={index} value={answer}>
										{answer}
									</SelectItem>
								)
							)}
						</SelectContent>
					</Select>
				)

			default:
				return <p>Unknown question type</p>
		}
	}

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	}

	return (
		<>
			<Card
				ref={setNodeRef}
				{...attributes}
				{...listeners}
				style={style}
				className={cn('grab touch-none shadow-sm transition-colors', {
					'grabbing border-2 border-dashed border-muted-foreground bg-muted shadow-lg':
						isDragging,
				})}
			>
				<CardHeader>
					<CardTitle className='flex items-center gap-1.5 text-lg capitalize'>
						{orderLabel && <span className='text-base'>{orderLabel}.</span>}
						{question.label}
					</CardTitle>
					<CardDescription>{questionType?.label}</CardDescription>
				</CardHeader>
				<CardContent>{renderQuestionInput()}</CardContent>
				{(onEdit || onDelete) && (
					<CardFooter className='flex justify-end gap-2'>
						{onEdit && (
							<Button
								disabled={isLoading}
								variant='outline'
								size='sm'
								onClick={() => setEditDialogOpen(true)}
								className='flex items-center gap-1'
							>
								<IconEdit className='size-5' />
								{t('Actions.edit')}
							</Button>
						)}
						{onDelete && (
							<DeleteConfirmation
								disabled={isLoading}
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								handleDelete={handleDelete}
							/>
						)}
					</CardFooter>
				)}
			</Card>
			<QuestionDialog
				open={editDialogOpen}
				onOpenChange={handleDialogOpenChange}
				onSubmit={handleEditSubmit}
				isLoading={isLoading}
				defaultValues={{
					id_questions: question.id_questions,
					id_projects: question.id_projects,
					label: question.label,
					id_questions_types: question.id_questions_types,
					possible_answers:
						Object.values(question.possible_answers).map((x) => x) || [],
				}}
				projectId={question.id_projects}
				isEditing={true}
			/>
		</>
	)
}
