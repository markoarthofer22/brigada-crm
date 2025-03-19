'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { deleteProject } from '@/api/services/projects/projects.ts'
import { Project } from '@/api/services/projects/schema.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentRow: Project
}

export function ProjectsDeleteDialog({
	open,
	onOpenChange,
	currentRow,
}: Props) {
	const [value, setValue] = useState('')
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const { handleError } = useHandleGenericError()

	const projectDeleteMutation = useMutation({
		mutationFn: (id: number) => deleteProject(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['projects'],
			})

			toast.success(t('Projects.deleteSuccess', { value: currentRow.name }))

			onOpenChange(false)
		},
		onError: (error) => {
			handleError(error)
		},
	})

	const handleDelete = () => {
		if (value.trim() !== currentRow.name) return

		projectDeleteMutation.mutate(currentRow.id_projects)
	}

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleDelete}
			isLoading={projectDeleteMutation.isPending}
			disabled={value.trim() !== currentRow.name}
			title={
				<span className='text-destructive'>
					<IconAlertTriangle
						className='mr-1 inline-block stroke-destructive'
						size={18}
					/>{' '}
					{t('Projects.delete')}
				</span>
			}
			desc={
				<div className='space-y-4'>
					<Trans
						className='mb-2 block'
						i18nKey='Table.deleteDescription'
						components={[<span className='font-bold'></span>]}
						values={{
							name: currentRow.name,
						}}
					/>

					<Label className='my-2 block'>
						<span className='ml-1'>{t('Input.label.name')}:</span>
						<Input
							value={value}
							className='mt-2'
							onChange={(e) => setValue(e.target.value)}
							placeholder={t('Projects.deletePlaceholder')}
						/>
					</Label>

					<Alert variant='destructive'>
						<AlertTitle>{t('Global.warning')}</AlertTitle>
						<AlertDescription>{t('Global.deleteWarning')}</AlertDescription>
					</Alert>
				</div>
			}
			confirmText={t('Actions.delete')}
			destructive
		/>
	)
}
