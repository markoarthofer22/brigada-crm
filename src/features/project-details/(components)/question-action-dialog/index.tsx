import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
	QuestionUpsertSchema,
	QuestionUpsertType,
} from '@/api/services/questions/schema.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface QuestionDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: QuestionUpsertType) => void
	defaultValues?: QuestionUpsertType
	projectId: number
	isEditing?: boolean
	isLoading?: boolean
	zoneId?: number
}

export function QuestionDialog({
	open,
	onOpenChange,
	onSubmit,
	defaultValues,
	projectId,
	isEditing = false,
	isLoading,
	zoneId,
}: QuestionDialogProps) {
	const { t } = useTranslation()
	const questionTypes = useAuthStore((state) => state.auth.questionTypes) ?? []
	const form = useForm<QuestionUpsertType>({
		resolver: zodResolver(QuestionUpsertSchema),
		defaultValues: {
			id_questions: defaultValues?.id_questions ?? undefined,
			id_projects: projectId,
			id_zones: zoneId ?? null,
			possible_answers: defaultValues?.possible_answers ?? [],
			label: defaultValues?.label ?? '',
			order: defaultValues?.order ?? undefined,
			id_questions_types:
				defaultValues?.id_questions_types ??
				questionTypes?.[0].id_questions_types ??
				0,
		},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		// @ts-expect-error - TS doesn't like the fact that we're using a string here
		name: 'possible_answers',
	})

	const watchQuestionType = form.watch('id_questions_types')
	const currentQuestionType = questionTypes.find(
		(type) => type.id_questions_types === watchQuestionType
	)

	const requiresPossibleAnswers = currentQuestionType?.free_input === false

	const handleSubmit = (data: QuestionUpsertType) => {
		if (!requiresPossibleAnswers) {
			data.possible_answers = []
		}

		onSubmit({
			...data,
			id_projects: projectId,
			id_zones: zoneId ?? null,
		})
	}

	const addPossibleAnswer = () => {
		append('')
	}

	const handleDialogOpenChange = (open: boolean) => {
		onOpenChange(open)
		form.reset()
	}

	useEffect(() => {
		if (!open) {
			form.reset()
		}
	}, [form, open])

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>
						{t(
							`ProjectDetails.questions.${isEditing ? 'editQuestion' : 'addQuestion'}`
						)}
					</DialogTitle>
					<DialogDescription>
						{t(
							`ProjectDetails.questions.${isEditing ? 'editQuestionDescription' : 'addQuestionDescription'}`
						)}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className='space-y-6'
					>
						<FormField
							control={form.control}
							name='label'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Input.label.questionTitle')}</FormLabel>
									<FormControl>
										<Input
											disabled={isLoading}
											placeholder={t('Input.placeholder.questionTitle')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='id_questions_types'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Input.label.questionTitle')}</FormLabel>
									<Select
										disabled={isLoading}
										onValueChange={(value) =>
											field.onChange(Number.parseInt(value))
										}
										defaultValue={field.value.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={t('Input.placeholder.questionTitle')}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{questionTypes.map((type) => (
												<SelectItem
													key={type.id_questions_types}
													value={type.id_questions_types.toString()}
												>
													{type.description}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{requiresPossibleAnswers && (
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<FormLabel>{t('Input.label.possibleAnswers')}</FormLabel>
									<Button
										disabled={isLoading}
										type='button'
										variant='outline'
										size='sm'
										onClick={addPossibleAnswer}
										className='flex items-center gap-1'
									>
										<PlusCircle className='h-4 w-4' />
										{t('ProjectDetails.questions.addOption')}
									</Button>
								</div>

								{fields.length === 0 && (
									<p className='text-sm text-muted-foreground'>
										{t('ProjectDetails.questions.noOption', {
											value: t('ProjectDetails.questions.addOption'),
										})}
									</p>
								)}

								{fields.map((field, index) => (
									<div key={field.id} className='flex items-center gap-2'>
										<FormField
											control={form.control}
											name={`possible_answers.${index}`}
											render={({ field }) => (
												<FormItem className='flex-1'>
													<FormControl>
														<Input
															disabled={isLoading}
															placeholder={`Option ${index + 1}`}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type='button'
											disabled={isLoading}
											variant='ghost'
											size='icon'
											onClick={() => remove(index)}
										>
											<Trash2 className='h-4 w-4 text-destructive' />
										</Button>
									</div>
								))}
							</div>
						)}

						<DialogFooter>
							<Button
								type='button'
								disabled={isLoading}
								variant='outline'
								onClick={() => handleDialogOpenChange(false)}
							>
								{t('Actions.cancel')}
							</Button>
							<Button disabled={isLoading} type='submit'>
								{t('Actions.submit')}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
