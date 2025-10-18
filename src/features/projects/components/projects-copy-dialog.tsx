'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { duplicateProjectById } from '@/api/services/projects/projects.ts'
import { Project, ProjectType } from '@/api/services/projects/schema.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentRow: Project
}

export function ProjectCopyDialog({ open, onOpenChange, currentRow }: Props) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const { handleError } = useHandleGenericError()

	const projectCopyMutation = useMutation({
		mutationFn: (id: number) => duplicateProjectById(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['projects', ProjectType.PROJECT],
			})

			toast.success(t('Projects.copySuccess', { value: currentRow.name }))

			onOpenChange(false)
		},
		onError: (error) => {
			handleError(error)
		},
	})

	const handleCopy = () => {
		projectCopyMutation.mutate(currentRow.id_projects)
	}

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleCopy}
			isLoading={projectCopyMutation.isPending}
			title={t('Projects.copyProject', { value: currentRow.name })}
			desc={t('Projects.copyProjectDesc', { value: currentRow.name })}
			confirmText={t('Actions.copyProject')}
		/>
	)
}
