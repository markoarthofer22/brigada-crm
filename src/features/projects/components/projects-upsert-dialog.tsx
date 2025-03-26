'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { upsertProject } from '@/api/services/projects/projects'
import {
	ActiveStatus,
	Project,
	ProjectUpsert,
	ProjectUpsertSchema,
} from '@/api/services/projects/schema.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ProjectsUpsertDialogProps {
	currentRow?: Project
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ProjectsUpsertDialog({
	currentRow,
	open,
	onOpenChange,
}: ProjectsUpsertDialogProps) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const { handleError } = useHandleGenericError()

	const isEdit = !!currentRow
	const form = useForm<ProjectUpsert>({
		resolver: zodResolver(ProjectUpsertSchema),
		defaultValues: {
			otherField: currentRow?.otherField ?? '',
			name: currentRow?.name ?? '',
			active: currentRow?.active ?? ActiveStatus.ACTIVE,
			id_projects: currentRow?.id_projects ?? undefined,
		},
	})

	const projectMutation = useMutation({
		mutationFn: (data: ProjectUpsert) => upsertProject(data),
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({
				queryKey: ['projects'],
				exact: false,
			})

			toast.success(
				t(isEdit ? 'Projects.updateSuccess' : 'Projects.createSuccess', {
					value: res.name,
				})
			)

			onOpenChange(false)
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const onSubmit = (data: ProjectUpsert) => {
		projectMutation.mutate(data)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(state) => {
				form.reset()
				onOpenChange(state)
			}}
		>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader className='text-left'>
					<DialogTitle>{t(`Projects.${isEdit ? 'edit' : 'add'}`)}</DialogTitle>
					<DialogDescription>
						{t(`Projects.${isEdit ? 'editDescription' : 'addDescription'}`)}
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className='-mr-4 w-full py-1 pr-4'>
					<Form {...form}>
						<form
							id='projects-form'
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
												disabled={projectMutation.isPending}
												autoComplete='off'
												type='text'
												{...field}
											/>
										</FormControl>
										<FormMessage className='!mt-1adsdas' />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='active'
								render={({ field }) => (
									<FormItem className='flex flex-row items-center gap-x-4 space-y-0 rounded-md border border-primary/20 p-4 transition-all duration-300 hover:border-primary hover:shadow-xl'>
										<FormControl>
											<Checkbox
												className='size-5'
												checked={field.value === ActiveStatus.ACTIVE}
												onCheckedChange={(checked) => {
													field.onChange(
														checked
															? ActiveStatus.ACTIVE
															: ActiveStatus.INACTIVE
													)
												}}
											/>
										</FormControl>
										<FormLabel>
											<div className='cursor-pointer space-y-2 leading-4'>
												{t('Input.label.active')}
												<FormDescription>
													{t('Input.description.active')}
												</FormDescription>
											</div>
										</FormLabel>
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</ScrollArea>
				<DialogFooter>
					<Button
						disabled={projectMutation.isPending}
						type='submit'
						form='projects-form'
					>
						{t('Actions.submit')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
