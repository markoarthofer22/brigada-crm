import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { IconTemplate } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getAllProjects } from '@/api/services/projects/options.ts'
import { upsertProject } from '@/api/services/projects/projects.ts'
import {
	ActiveStatus,
	ProjectType,
	ProjectUpsert,
} from '@/api/services/projects/schema.ts'
import { upsertQuestion } from '@/api/services/questions/questions.ts'
import { QuestionUpsertType } from '@/api/services/questions/schema.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog.tsx'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'

const CreateProjectFromTemplate = () => {
	const { t } = useTranslation()
	const { showLoader, hideLoader } = useLoader()
	const router = useRouter()
	const { handleError } = useHandleGenericError()
	const queryClient = useQueryClient()
	const [open, setOpen] = useState<boolean>(false)

	const schema = z.object({
		name: z.string().nonempty(t('Input.validation.required')),
		templateId: z.string().nonempty(t('Input.validation.required')),
		active: z.nativeEnum(ActiveStatus).default(ActiveStatus.ACTIVE),
		type: z.nativeEnum(ProjectType).default(ProjectType.PROJECT),
	})

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			templateId: '',
			active: ActiveStatus.ACTIVE,
			type: ProjectType.PROJECT,
		},
	})

	const templatesQuery = useQuery({
		...getAllProjects(ProjectType.TEMPLATE),
	})

	const projectMutation = useMutation({
		mutationFn: (data: ProjectUpsert) => upsertProject(data),
		onError: (error: unknown) => handleError(error),
	})

	const upsertQuestionMutation = useMutation({
		mutationFn: (data: QuestionUpsertType) => upsertQuestion(data),
		onError: (error: unknown) => handleError(error),
	})

	const onSubmit = async (data: z.infer<typeof schema>) => {
		showLoader()
		try {
			const projectRes = await projectMutation.mutateAsync({
				name: data.name,
				type: data.type,
				active: data.active,
			})

			const activeTemplate = templatesQuery.data?.find(
				(template) => template.id_projects.toString() === data.templateId
			)

			if (activeTemplate?.questions?.length) {
				const newProjectId = projectRes.id_projects
				await Promise.all(
					activeTemplate.questions.map((question) => {
						const payload: QuestionUpsertType = {
							// id_questions: question.id_questions,
							id_projects: newProjectId!,
							id_zones: question.id_zones ?? null,
							id_questions_types: question.id_questions_types,
							order: question.order,
							label: question.label,
							possible_answers: Object.values(question.possible_answers),
							data: JSON.parse(question.data ?? '{}'),
						}
						return upsertQuestionMutation.mutateAsync(payload)
					})
				)
			}

			toast.success(t('Templates.creationSuccess'))
			setOpen(false)
			queryClient.invalidateQueries({
				queryKey: ['projects', ProjectType.PROJECT],
			})
			router.navigate({ to: `/admin/projects/${projectRes.id_projects}` })
		} catch {
			// Errors are handled in onError but need to catch to prevent unhandled promise rejections
		} finally {
			hideLoader()
		}
	}
	useEffect(() => {
		if (templatesQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [templatesQuery.isLoading])

	useEffect(() => {
		if (templatesQuery.isError && templatesQuery.isFetched) {
			handleError(templatesQuery.error)
		}
	}, [templatesQuery.isError, templatesQuery.isFetched])

	if (templatesQuery.isError && templatesQuery.isFetched) {
		return null
	}

	return (
		<>
			<Button
				variant='outline'
				className='space-x-1'
				onClick={() => setOpen(true)}
			>
				{t('Templates.createFromTemplate')}
				<IconTemplate />
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('Templates.title')}</DialogTitle>
						<DialogDescription>
							{t('Templates.modalDescription')}
						</DialogDescription>
					</DialogHeader>
					<ScrollArea className='-mr-4 w-full py-1 pr-4'>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className='space-y-4 p-0.5'
							>
								<FormField
									control={form.control}
									name='name'
									render={({ field }) => (
										<FormItem className='flex flex-col items-start'>
											<FormLabel>{t('Input.label.name')}</FormLabel>
											<FormControl>
												<Input
													// disabled={projectMutation.isPending}
													autoComplete='off'
													type='text'
													{...field}
												/>
											</FormControl>
											<FormMessage className='!mt-1' />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='templateId'
									render={({ field }) => (
										<FormItem className='flex flex-col items-start'>
											<FormLabel>{t('Input.label.templateId')}</FormLabel>
											<FormControl>
												<Select
													// disabled={isLoading}
													onValueChange={(value) => field.onChange(value)}
													defaultValue={field.value}
												>
													<SelectTrigger>
														<SelectValue
															placeholder={t('Input.placeholder.templateId')}
														/>
													</SelectTrigger>
													<SelectContent>
														{templatesQuery?.data?.map((template) => (
															<SelectItem
																key={template.id_projects}
																value={template.id_projects.toString()}
															>
																{template.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage className='!mt-1' />
										</FormItem>
									)}
								/>
							</form>
						</Form>
					</ScrollArea>

					<Button type='button' onClick={form.handleSubmit(onSubmit)}>
						{t('Actions.submit')}
					</Button>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default CreateProjectFromTemplate
