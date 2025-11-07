import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
	ProjectDetails,
	StaticQuestionItem,
} from '@/api/services/projects/schema'
import {
	getAnswerForSpecificTracking,
	getAnswerForSpecificZoneInTracking,
} from '@/api/services/trackings/options.ts'
import { TrackingsAnswerUpsert } from '@/api/services/trackings/schema.ts'
import {
	addTrackingAnswer,
	invalidateTracking,
} from '@/api/services/trackings/trackings.ts'
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
import { ConfirmDialog } from '@/components/confirm-dialog.tsx'
import { GlobalLoader } from '@/components/global-loader.tsx'

interface TrackingExamProps {
	questions: ProjectDetails['questions']
	staticQuestions: StaticQuestionItem[]
	projectId: number
	trackingId: number
	zoneId?: number
	examName?: string
	onValidityChange?: (isValid: boolean) => void
	trackingZoneId?: number
}

/** helpers to safely parse answer payloads coming back from API */
function safeParseJson<T = unknown>(raw: unknown): T | unknown {
	if (typeof raw !== 'string') return raw
	try {
		const once = JSON.parse(raw)
		if (
			typeof once === 'string' &&
			(once.startsWith('{') || once.startsWith('['))
		) {
			try {
				return JSON.parse(once)
			} catch {
				return once
			}
		}
		return once
	} catch {
		return raw
	}
}
function parseAnswerArray(raw: unknown): Array<Record<string, string>> {
	const val = safeParseJson(raw)
	if (Array.isArray(val)) return val as Array<Record<string, string>>
	if (val && typeof val === 'object') return [val as Record<string, string>]
	return []
}

/** Are all static questions (and required sub-questions) filled? */
function areStaticQuestionsComplete(
	allValues: Record<string, any>,
	staticQuestions: StaticQuestionItem[],
	trackingId: number
) {
	if (!staticQuestions || staticQuestions.length === 0) return true
	for (const sq of staticQuestions) {
		const mainFieldName = `q_${trackingId}_${sq.id_questions}`
		const mainValue = allValues[mainFieldName]
		const empty =
			mainValue == null ||
			(typeof mainValue === 'string' && mainValue.trim() === '') ||
			(Array.isArray(mainValue) && mainValue.length === 0)
		if (empty) return false

		const count = Number(mainValue) || 0
		if (sq.subquestions && count > 0) {
			for (let i = 1; i <= count; i++) {
				for (const sub of sq.subquestions) {
					const subFieldName = `q_sub_${trackingId}_${sub.label}_${i}`
					const v = allValues[subFieldName]
					const missing =
						v == null ||
						(typeof v === 'string' && v.trim() === '') ||
						(Array.isArray(v) && v.length === 0)
					if (sub.data?.required && missing) return false
				}
			}
		}
	}
	return true
}

export function TrackingExam({
	questions,
	examName,
	trackingId,
	projectId,
	onValidityChange,
	zoneId,
	trackingZoneId,
	staticQuestions,
}: TrackingExamProps) {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()
	const queryClient = useQueryClient()
	const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
	const [isInvalidateDialogOpen, setIsInvalidateDialogOpen] =
		useState<boolean>(false)

	const questionTypes = useAuthStore((state) => state.auth.questionTypes)

	// queries
	const trackingAnswersQuery = useQuery({
		...getAnswerForSpecificTracking(trackingId),
		enabled: !!trackingId && !zoneId,
	})

	const trackingAnswersZoneQuery = useQuery({
		...getAnswerForSpecificZoneInTracking(trackingId),
		enabled: !!trackingId && !!zoneId,
	})

	const activeQuestionAnswers = zoneId
		? trackingAnswersZoneQuery
		: trackingAnswersQuery

	const answerQuestionMutation = useMutation({
		mutationFn: (data: TrackingsAnswerUpsert) => addTrackingAnswer(data),
		onSuccess: async (data, req) => {
			if (!req.isStatic) {
				toast.success(
					t(
						`ProjectDetailsRegularUser.Exam.${
							data?.id_tracking_answers ? 'questionUpdated' : 'questionSaved'
						}`
					)
				)
			}
			await activeQuestionAnswers.refetch()
			await queryClient.invalidateQueries({
				queryKey: ['trackings', projectId],
			})
		},
		onError: (err: unknown) => handleError(err),
	})

	const invalidateTrackingMutation = useMutation({
		mutationFn: (id: number) => invalidateTracking(id),
		onSuccess: async () => {
			toast.success(t('ProjectDetailsRegularUser.trackingInvalidated'))
			await queryClient.invalidateQueries({
				queryKey: ['trackings', projectId],
			})
		},
		onError: (err: unknown) => handleError(err),
	})

	const getQuestionType = useCallback(
		(typeId: number) => {
			return (
				questionTypes?.find((type) => type.id_questions_types === typeId) ??
				questionTypes?.[0]
			)
		},
		[questionTypes]
	)

	const schema = useMemo(() => {
		const shape: Record<string, z.ZodTypeAny> = {}

		// static questions
		for (const q of staticQuestions) {
			const name = `q_${trackingId}_${q.id_questions}`
			const qType = getQuestionType(q.id_questions_types)
			const isCheckbox = qType?.type === 'checkbox'
			const isOptional =
				!q.data?.required || qType?.type === 'input' || qType?.type === 'text'

			let s: any = isCheckbox
				? z.array(z.string(), {
						required_error: t('Input.validation.required'),
						invalid_type_error: t('Input.validation.invalid'),
					})
				: z.string({
						required_error: t('Input.validation.required'),
						invalid_type_error: t('Input.validation.invalid'),
					})

			if (!isOptional) s = s.min(1, { message: t('Input.validation.required') })
			if (isOptional) s = s.optional()
			shape[name] = s
		}

		// dynamic questions
		for (const q of questions) {
			const name = `q_${trackingId}_${q.id_questions}`
			const qType = getQuestionType(q.id_questions_types)
			const isCheckbox = qType?.type === 'checkbox'
			const isTriviallyOptional =
				!q.required || qType?.type === 'input' || qType?.type === 'text'

			let s: any = isCheckbox
				? z.array(z.string(), {
						invalid_type_error: t('Input.validation.invalid'),
					})
				: z.string({
						invalid_type_error: t('Input.validation.invalid'),
					})

			if (!isTriviallyOptional) {
				s = s.min(1, { message: t('Input.validation.required') })
			}
			if (isTriviallyOptional) s = s.optional()

			shape[name] = s
		}

		return z.object(shape)
	}, [questions, staticQuestions, trackingId, getQuestionType, t])

	const answerMap = useMemo(() => {
		const map = new Map<number, number>()
		let arr: any[] | undefined

		if (zoneId) {
			arr = activeQuestionAnswers.data
				?.find(
					(entry: any) =>
						entry.id_zones === zoneId && entry.id_tracking === trackingId
				)
				// @ts-expect-error API shape
				?.answers?.filter((x: any) => x.id_tracking_zones === trackingZoneId)
		} else {
			arr = activeQuestionAnswers.data as any[]
		}

		arr?.forEach((entry: any) => {
			if (entry.id_tracking_answers) {
				map.set(entry.id_questions, entry.id_tracking_answers)
			}
		})
		return map
	}, [activeQuestionAnswers.data, zoneId, trackingId, trackingZoneId])

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		mode: 'onTouched',
		reValidateMode: 'onChange',
	})

	const {
		setValue,
		watch,
		trigger,
		getValues,
		formState: { isValid },
	} = form

	/** Derive static validity from current form values (no setState in render) */
	const watchedAllValues = watch()
	const isStaticValid = useMemo(
		() =>
			areStaticQuestionsComplete(watchedAllValues, staticQuestions, trackingId),
		[watchedAllValues, staticQuestions, trackingId]
	)

	const handleBlurSubmit = async (
		name: string,
		id: number,
		isStatic = false
	) => {
		const ok = await trigger(name)
		const value = getValues(name) as string | string[]

		if (
			!value ||
			(typeof value === 'string' && value === '') ||
			(Array.isArray(value) && value.length === 0)
		) {
			return
		}
		if (!ok) return

		if (!isStatic) {
			// NON-STATIC: keep plain string (checkbox -> comma-joined)
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
				id_tracking_zones: trackingZoneId,
				id_zones: zoneId,
				id_tracking_answers: answerMap.get(id),
				question: {
					...activeQuestion,
					data: activeQuestion?.data ?? {},
				},
				answer: {
					answer: Array.isArray(value) ? value.join(',') : value,
				},
			}
			answerQuestionMutation.mutate(data)
			return
		}

		// STATIC: always JSON.stringify an array of objects
		const staticQuestion = staticQuestions.find((q) => q.id_questions === id)
		if (!staticQuestion) {
			toast.error(t('ProjectDetailsRegularUser.Exam.questionNotFound'))
			return
		}

		const allFormValues = getValues()
		const mainFieldName = `q_${trackingId}_${staticQuestion.id_questions}`
		const mainVal = allFormValues[mainFieldName]

		const subAnswers: Array<Record<string, string>> = []

		if (
			staticQuestion.subquestions &&
			staticQuestion.subquestions.length > 0 &&
			Number(mainVal) > 0
		) {
			// N groups; each group keyed by sub-question label
			for (let i = 1; i <= Number(mainVal); i++) {
				const group: Record<string, string> = {}
				staticQuestion.subquestions.forEach((subQuestion) => {
					const subFieldName = `q_sub_${trackingId}_${subQuestion.label}_${i}`
					const subValue = allFormValues[subFieldName]
					if (
						subValue !== undefined &&
						subValue !== null &&
						String(subValue) !== ''
					) {
						group[subQuestion.label] = Array.isArray(subValue)
							? subValue.map(String).join(',')
							: String(subValue)
					}
				})
				if (Object.keys(group).length > 0) subAnswers.push(group)
			}
		} else {
			// No subquestions -> single object with the static question label as key
			const val = allFormValues[mainFieldName]
			subAnswers.push({
				[staticQuestion.label]: Array.isArray(val)
					? val.map(String).join(',')
					: String(val ?? ''),
			})
		}

		const data: TrackingsAnswerUpsert = {
			isStatic: true,
			id_questions: id,
			id_tracking: trackingId,
			id_projects: projectId,
			order: 1,
			id_tracking_zones: trackingZoneId,
			id_zones: zoneId,
			id_tracking_answers: answerMap.get(id),
			question: { ...staticQuestion, data: staticQuestion?.data ?? {} },
			// EXACT shape: {"answer": "[{...},{...}]"}
			answer: { answer: JSON.stringify(subAnswers) },
		}
		answerQuestionMutation.mutate(data)
	}

	const renderStaticField = (
		staticQuestion: StaticQuestionItem,
		recursive = false,
		parentIndex?: number,
		parentQuestion?: StaticQuestionItem
	) => {
		const name = !recursive
			? `q_${trackingId}_${staticQuestion.id_questions}`
			: `q_sub_${trackingId}_${staticQuestion.label}_${parentIndex}`

		const qType = getQuestionType(staticQuestion.id_questions_types)
		const possibleAnswers = Object.values(staticQuestion.possible_answers || {})
		const watchField = watch(name)
		let mainField

		if (!qType) return null

		const checkAllFieldsFilled = () => {
			const allFormValues = getValues()
			const mainFieldName = `q_${trackingId}_${staticQuestion.id_questions}`
			const mainValue = allFormValues[mainFieldName]
			if (!mainValue) return false

			if (staticQuestion.subquestions && Number(mainValue) > 0) {
				for (let i = 1; i <= Number(mainValue); i++) {
					for (const subQuestion of staticQuestion.subquestions) {
						const subFieldName = `q_sub_${trackingId}_${subQuestion.label}_${i}`
						const subValue = allFormValues[subFieldName]
						if (
							subQuestion.data?.required &&
							(!subValue || (Array.isArray(subValue) && subValue.length === 0))
						) {
							return false
						}
					}
				}
			}
			return true
		}

		switch (qType.type) {
			case 'select':
				mainField = (
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
										if (recursive && parentQuestion) {
											handleBlurSubmit(
												`q_${trackingId}_${parentQuestion.id_questions}`,
												parentQuestion.id_questions,
												true
											)
										} else if (checkAllFieldsFilled()) {
											handleBlurSubmit(name, staticQuestion.id_questions, true)
										}
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
											<SelectItem
												key={i}
												value={typeof a === 'string' ? a : String(a)}
											>
												{String(a)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)
				break
			case 'radio':
				mainField = (
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
										}}
									>
										{possibleAnswers.map((a, i) => (
											<div key={i} className='flex items-center space-x-2'>
												<RadioGroupItem
													value={typeof a === 'string' ? a : String(a)}
													id={`${name}-${i}`}
												/>
												<FormLabel htmlFor={`${name}-${i}`}>
													{String(a)}
												</FormLabel>
											</div>
										))}
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)
				break
			case 'checkbox':
				mainField = (
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
												const val =
													typeof answer === 'string' ? answer : String(answer)
												const checked = selected.includes(val)
												return (
													<div key={i} className='flex items-center space-x-2'>
														<Checkbox
															id={`${name}-${i}`}
															checked={checked}
															onCheckedChange={(isChecked) => {
																const updated = isChecked
																	? [...selected, val]
																	: selected.filter((x) => x !== val)
																setValue(name, updated, {
																	shouldValidate: true,
																})
															}}
														/>
														<FormLabel htmlFor={`${name}-${i}`}>
															{val}
														</FormLabel>
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
				break
			default:
				mainField = (
					<p className='text-sm text-red-500'>Unknown question type</p>
				)
				break
		}

		if (recursive) return mainField

		return (
			<div className='flex flex-col gap-y-4'>
				{mainField}
				{staticQuestion.subquestions &&
					watchField &&
					Number(watchField) > 0 && (
						<div className='space-y-4'>
							{Array.from({ length: Number(watchField) }, (_, i) => (
								<div key={i} className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
									{staticQuestion.subquestions!.map((subQuestion, subIndex) => {
										const subQuestionId =
											staticQuestion.id_questions * 1000 + subIndex * 10 + i + 1
										return (
											<div key={subIndex}>
												<FormLabel className='text-sm font-medium'>
													{subQuestion.label} #{i + 1}
												</FormLabel>
												{renderStaticField(
													{
														...subQuestion,
														id_questions: subQuestionId,
														id_projects: projectId,
														subquestions: [],
													},
													true,
													i + 1,
													staticQuestion
												)}
											</div>
										)
									})}
								</div>
							))}
						</div>
					)}
			</div>
		)
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
											<SelectItem key={i} value={String(a)}>
												{String(a)}
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
												<RadioGroupItem value={String(a)} id={`${name}-${i}`} />
												<FormLabel htmlFor={`${name}-${i}`}>
													{String(a)}
												</FormLabel>
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
												const val = String(answer)
												const checked = selected.includes(val)
												return (
													<div key={i} className='flex items-center space-x-2'>
														<Checkbox
															id={`${name}-${i}`}
															checked={checked}
															onCheckedChange={(isChecked) => {
																const updated = isChecked
																	? [...selected, val]
																	: selected.filter((x) => x !== val)
																setValue(name, updated, {
																	shouldValidate: true,
																})
																handleBlurSubmit(name, question.id_questions)
															}}
														/>
														<FormLabel htmlFor={`${name}-${i}`}>
															{val}
														</FormLabel>
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
		if (!activeQuestionAnswers.data) return
		if ((activeQuestionAnswers.data as any[]).length === 0) {
			const values: Record<string, string | string[]> = {}

			// dynamic questions
			for (const entry of questions) {
				const name = `q_${trackingId}_${entry.id_questions}`
				const qType = getQuestionType(entry.id_questions_types)
				values[name] = qType?.type === 'checkbox' ? [] : ''
			}
			// static main fields
			for (const sq of staticQuestions) {
				const name = `q_${trackingId}_${sq.id_questions}`
				const qType = getQuestionType(sq.id_questions_types)
				values[name] = qType?.type === 'checkbox' ? [] : ''
			}

			form.reset(values)
			return
		}

		if ((activeQuestionAnswers.data as any[]).length > 0) {
			const values: Record<string, string | string[]> = {}
			let arr: any[] | undefined

			if (zoneId && trackingZoneId) {
				arr = (activeQuestionAnswers.data as any[])
					.find(
						(entry: any) =>
							entry.id_zones === zoneId && entry.id_tracking === trackingId
					)
					?.answers?.filter((x: any) => x.id_tracking_zones === trackingZoneId)
			} else {
				arr = activeQuestionAnswers.data as any[]
			}
			if (!arr) return

			for (const entry of arr) {
				if (entry?.id_questions < 1000) {
					// STATIC
					const staticQuestion = staticQuestions.find(
						(q) => q.id_questions === entry.id_questions
					)
					if (!staticQuestion) continue

					const name = `q_${trackingId}_${entry.id_questions}`

					const answerArray = parseAnswerArray(entry?.answer?.answer)

					if (
						staticQuestion.subquestions &&
						staticQuestion.subquestions.length > 0
					) {
						// main value = count of groups
						const currentMainValue = getValues(name)
						const mainValue =
							currentMainValue && Number(currentMainValue) > answerArray.length
								? currentMainValue
								: answerArray.length
						const qType = getQuestionType(staticQuestion.id_questions_types)
						values[name] =
							qType?.type === 'checkbox'
								? [String(mainValue)]
								: String(mainValue)

						// set subquestion values per group
						answerArray.forEach(
							(group: Record<string, string>, index: number) => {
								staticQuestion.subquestions!.forEach((subQuestion) => {
									const subFieldName = `q_sub_${trackingId}_${subQuestion.label}_${index + 1}`
									const subValue = group[subQuestion.label]
									if (subValue != null) {
										const subQType = getQuestionType(
											subQuestion.id_questions_types
										)
										values[subFieldName] =
											subQType?.type === 'checkbox'
												? String(subValue).split(',')
												: String(subValue)
									}
								})
							}
						)
					} else {
						// NO subquestions: main control should show the single value under the static label
						const first = answerArray[0] ?? {}
						const rawVal = first[staticQuestion.label] ?? ''
						const qType = getQuestionType(staticQuestion.id_questions_types)
						values[name] =
							qType?.type === 'checkbox' ? [String(rawVal)] : String(rawVal)
					}
				} else {
					// DYNAMIC
					const name = `q_${trackingId}_${entry.id_questions}`
					const raw = entry.answer?.answer ?? ''
					const qType = getQuestionType(entry.question?.id_questions_types)
					values[name] =
						qType?.type === 'checkbox' ? String(raw).split(',') : String(raw)
				}
			}

			Object.entries(values).forEach(([name, val]) => {
				setValue(name, val, {
					shouldDirty: true,
					shouldTouch: true,
				})
			})
		}
	}, [
		activeQuestionAnswers.data,
		questionTypes,
		zoneId,
		trackingZoneId,
		trackingId,
		questions,
		staticQuestions,
		form,
		getQuestionType,
		setValue,
		getValues,
	])

	useEffect(() => {
		if (onValidityChange) {
			onValidityChange(isValid && isStaticValid)
		}
	}, [isStaticValid, isValid, onValidityChange])

	if (activeQuestionAnswers.isLoading) {
		return <GlobalLoader />
	}

	return (
		<>
			<div
				className={`${
					isFullscreen
						? 'fixed inset-0 z-50 overflow-y-auto bg-background p-6'
						: 'relative pb-4'
				}`}
			>
				<div className='mx-auto max-w-4xl space-y-6 max-md:pr-3'>
					<div className='flex items-center justify-between'>
						{examName && (
							<>
								<h2 className='w-fit text-2xl font-bold'>
									{t('ProjectDetails.title')} {examName}
								</h2>
								<div className='flex items-center gap-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setIsFullscreen((v) => !v)}
									>
										{isFullscreen
											? t('ProjectDetailsRegularUser.Exam.minimize')
											: t('ProjectDetailsRegularUser.Exam.fullscreen')}
									</Button>
									<Button
										variant='destructive'
										size='sm'
										onClick={() => setIsInvalidateDialogOpen(true)}
									>
										{t('ProjectDetailsRegularUser.invalidateTracking')}
									</Button>
								</div>
							</>
						)}
					</div>

					<Form {...form}>
						<form
							className={cn('grid grid-cols-1 gap-4 sm:grid-cols-3', {
								'sm:grid-cols-1': questions.length === 1 || isFullscreen,
							})}
						>
							{staticQuestions.map((q) => (
								<Card key={q.id_questions} className='sm:col-span-3'>
									<CardHeader className='px-4 pb-1.5 pt-4'>
										<CardTitle>
											{q.label}{' '}
											{q.data?.required && (
												<sup className='text-destructive'>*</sup>
											)}
										</CardTitle>
									</CardHeader>
									<CardContent className='px-4 py-3'>
										{renderStaticField(q)}
									</CardContent>
								</Card>
							))}

							{questions.map((q) => (
								<Card key={q.id_questions}>
									<CardHeader className='px-4 pb-1.5 pt-4'>
										<CardTitle>
											{q.label}{' '}
											{q.required && <sup className='text-destructive'>*</sup>}
										</CardTitle>
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

			<ConfirmDialog
				open={isInvalidateDialogOpen}
				onOpenChange={setIsInvalidateDialogOpen}
				handleConfirm={() => {
					invalidateTrackingMutation.mutate(trackingId)
				}}
				isLoading={invalidateTrackingMutation.isPending}
				title={
					<span className='flex items-center gap-2'>
						<IconAlertTriangle size={18} />
						{t('ProjectDetailsRegularUser.invalidateTracking')}
					</span>
				}
				desc={
					<div className='flex flex-col space-y-2'>
						<p className='font-semibold text-red-600'>
							{t('ProjectDetailsRegularUser.invalidateTrackingDescription')}
						</p>
					</div>
				}
				confirmText={t('Actions.delete')}
				destructive
			/>
		</>
	)
}
