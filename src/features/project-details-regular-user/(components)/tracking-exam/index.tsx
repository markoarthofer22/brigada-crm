import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ProjectDetails } from '@/api/services/projects/schema'
import { getAnswerForSpecificTracking } from '@/api/services/trackings/options.ts'
import { TrackingsAnswerUpsert } from '@/api/services/trackings/schema.ts'
import { addTrackingAnswer } from '@/api/services/trackings/trackings.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { cn } from '@/lib/utils.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { GlobalLoader } from '@/components/global-loader.tsx'

interface TrackingExamProps {
	questions: ProjectDetails['questions']
	projectId: number
	trackingId: number
	examName?: string
	onValidityChange?: (isValid: boolean) => void
}

export function TrackingExam({
	questions,
	examName,
	trackingId,
	projectId,
	onValidityChange,
}: TrackingExamProps) {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()
	const [isFullscreen, setIsFullscreen] = useState(false)

	const questionTypes = useAuthStore((state) => state.auth.questionTypes)

	const trackingAnswersQuery = useQuery({
		...getAnswerForSpecificTracking(trackingId),
		enabled: !!trackingId,
	})

	const answerQuestionMutation = useMutation({
		mutationFn: (data: TrackingsAnswerUpsert) => {
			return addTrackingAnswer(data)
		},
		onSuccess: (data) => {
			toast.success(
				t(
					`ProjectDetailsRegularUser.Exam.${data?.id_tracking_answers ? 'questionUpdated' : 'questionSaved'}`
				)
			)
			trackingAnswersQuery.refetch()
		},
		onError: (err: unknown) => {
			handleError(err)
		},
	})

	const getQuestionType = (typeId: number) => {
		return (
			questionTypes?.find((type) => type.id_questions_types === typeId) ??
			questionTypes?.[0]
		)
	}

	const schema = useMemo(() => {
		const shape: Record<string, z.ZodTypeAny> = {}

		for (const q of questions) {
			const name = `q_${trackingId}_${q.id_questions}`
			const qType = getQuestionType(q.id_questions_types)

			if (qType?.type === 'checkbox') {
				shape[name] = z
					.array(z.string(), {
						required_error: t('Input.validation.required'),
						invalid_type_error: t('Input.validation.invalid'),
					})
					.min(1, { message: t('Input.validation.required') })
			} else {
				shape[name] = z
					.string({
						required_error: t('Input.validation.required'),
						invalid_type_error: t('Input.validation.invalid'),
					})
					.min(1, { message: t('Input.validation.required') })
			}
		}

		return z.object(shape)
	}, [questions, questionTypes, t])

	const answerMap = useMemo(() => {
		const map = new Map<number, number>()
		trackingAnswersQuery.data?.forEach((entry) => {
			if (entry.id_tracking_answers) {
				map.set(entry.id_questions, entry.id_tracking_answers)
			}
		})
		return map
	}, [trackingAnswersQuery.data])

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		mode: 'onBlur',
	})

	const { setValue, watch, trigger, getValues } = form

	const handleBlurSubmit = async (name: string, id: number) => {
		const isValid = await trigger(name)
		if (isValid) {
			const value = getValues(name) as string | string[]
			const activeQuestion = questions.find((q) => q.id_questions === id)

			if (!activeQuestion) {
				toast.error(t('ProjectDetailsRegularUser.Exam.questionNotFound'))
				return
			}

			const data: TrackingsAnswerUpsert = {
				id_questions: id,
				id_tracking: trackingId,
				id_projects: projectId,
				order: activeQuestion?.order,
				id_tracking_answers: answerMap.get(id), // <-- this is important
				question: activeQuestion,
				answer: {
					answer: Array.isArray(value) ? value.join(',') : value,
				},
			}
			answerQuestionMutation.mutate(data)
		}
	}

	const renderField = (question: ProjectDetails['questions'][number]) => {
		const name = `q_${trackingId}_${question.id_questions}`
		const qType = getQuestionType(question.id_questions_types)
		const possibleAnswers = Object.values(question.possible_answers || {})

		if (!qType) return null

		switch (qType.type) {
			case 'input':
				return (
					<FormField
						control={form.control}
						name={name}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										{...field}
										value={field.value || ''}
										onBlur={() => handleBlurSubmit(name, question.id_questions)}
										placeholder={t('Input.placeholder.questionText')}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)

			case 'text':
				return (
					<FormField
						control={form.control}
						name={name}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										value={field.value || ''}
										onBlur={() => handleBlurSubmit(name, question.id_questions)}
										placeholder={t('Input.placeholder.questionText')}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)

			case 'select':
				return (
					<FormField
						control={form.control}
						name={name}
						render={({ field }) => (
							<FormItem>
								<Select
									key={field.value || 'empty'}
									value={field.value || ''}
									onValueChange={(val) => {
										field.onChange(val)
										handleBlurSubmit(name, question.id_questions)
									}}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue
												placeholder={t('Input.placeholder.select')}
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{possibleAnswers.map((a, i) => (
											<SelectItem key={i} value={a}>
												{a}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)

			case 'radio':
				return (
					<FormField
						control={form.control}
						name={name}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<RadioGroup
										value={field.value}
										onValueChange={(val) => {
											field.onChange(val)
											handleBlurSubmit(name, question.id_questions)
										}}
									>
										{possibleAnswers.map((a, i) => (
											<div key={i} className='flex items-center space-x-2'>
												<RadioGroupItem value={a} id={`${name}-${i}`} />
												<FormLabel htmlFor={`${name}-${i}`}>{a}</FormLabel>
											</div>
										))}
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)

			case 'checkbox':
				return (
					<FormField
						control={form.control}
						name={name}
						render={() => {
							const selected: string[] = watch(name) || []
							return (
								<FormItem>
									<FormControl>
										<div className='space-y-2'>
											{possibleAnswers.map((answer, i) => {
												const checked = selected.includes(answer)

												return (
													<div key={i} className='flex items-center space-x-2'>
														<Checkbox
															checked={checked}
															onCheckedChange={(isChecked) => {
																const updated = isChecked
																	? [...selected, answer]
																	: selected.filter((x) => x !== answer)

																setValue(name, updated, {
																	shouldValidate: true,
																})
																handleBlurSubmit(name, question.id_questions)
															}}
														/>
														<FormLabel>{answer}</FormLabel>
													</div>
												)
											})}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)
						}}
					/>
				)

			default:
				return <p className='text-sm text-red-500'>Unknown question type</p>
		}
	}

	useEffect(() => {
		if (!trackingAnswersQuery.data) return
		if (trackingAnswersQuery.data.length === 0) {
			const values: Record<string, string | string[]> = {}

			for (const entry of questions) {
				const name = `q_${trackingId}_${entry.id_questions}}`
				const qType = getQuestionType(entry.id_questions_types)

				values[name] = qType?.type === 'checkbox' ? [] : ''
			}

			form.reset(values)
			return
		}

		if (trackingAnswersQuery.data.length) {
			const values: Record<string, string | string[]> = {}

			for (const entry of trackingAnswersQuery.data) {
				const name = `q_${trackingId}_${entry.id_questions}`
				const raw = entry.answer?.answer ?? ''
				const qType = getQuestionType(entry.question?.id_questions_types)

				values[name] = qType?.type === 'checkbox' ? raw.split(',') : raw
			}

			form.reset(values)
		}
	}, [trackingAnswersQuery.data, questionTypes])

	useEffect(() => {
		if (onValidityChange) {
			const formIsValid = form.formState.isValid
			onValidityChange(formIsValid)
		}
	}, [form.formState.isValid, onValidityChange])

	if (trackingAnswersQuery.isLoading) {
		return <GlobalLoader />
	}

	return (
		<div
			className={`${
				isFullscreen
					? 'fixed inset-0 z-50 overflow-y-auto bg-background p-6'
					: 'relative pb-4'
			}`}
		>
			<div className='mx-auto max-w-4xl space-y-6'>
				<div className='flex items-center justify-between'>
					{examName && (
						<>
							<h2 className='w-fit text-2xl font-bold'>
								{t('ProjectDetails.title')} {examName}
							</h2>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setIsFullscreen((v) => !v)}
							>
								{isFullscreen
									? t('ProjectDetailsRegularUser.Exam.minimize')
									: t('ProjectDetailsRegularUser.Exam.fullscreen')}
							</Button>
						</>
					)}
				</div>

				<Form {...form}>
					<form
						className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', {
							'sm:grid-cols-1': questions.length === 1 || isFullscreen,
						})}
					>
						{questions.map((q) => (
							<Card key={q.id_questions}>
								<CardHeader className='px-4 pb-1.5 pt-4'>
									{/*add required*/}
									<CardTitle className='capitalize'>{q.label}</CardTitle>
								</CardHeader>
								<CardContent className='px-4 py-3'>
									{renderField(q)}
								</CardContent>
							</Card>
						))}
					</form>
				</Form>
			</div>
		</div>
	)
}
