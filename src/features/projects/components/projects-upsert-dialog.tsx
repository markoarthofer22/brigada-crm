'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { upsertProject } from '@/api/services/projects/projects'
import {
	Project,
	ProjectUpsert,
	ProjectUpsertSchema,
} from '@/api/services/projects/schema.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error'
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
			name: currentRow?.name,
			id_projects: currentRow?.id_projects ?? undefined,
		},
	})

	const projectMutation = useMutation({
		mutationFn: (data: ProjectUpsert) => upsertProject(data),
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({
				queryKey: ['projects'],
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
						{t(`Projects.${isEdit ? 'edit' : 'add'}Description`)}
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className='-mr-4 h-[26.25rem] w-full py-1 pr-4'>
					<Form {...form}>
						<form
							id='user-form'
							onSubmit={form.handleSubmit(onSubmit)}
							className='space-y-4 p-0.5'
						>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem className='flex flex-col items-center gap-x-4 gap-y-1 space-y-0'>
										<FormLabel className='col-span-2 text-right'>
											{t('Input.label.name')}
										</FormLabel>
										<FormControl>
											<Input autoComplete='off' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</ScrollArea>
				<DialogFooter>
					<Button type='submit' form='user-form'>
						{t('Actions.submit')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
