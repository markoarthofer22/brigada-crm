'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { User } from '@/api/services/user/schema.ts'
import { deleteUser } from '@/api/services/user/users.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
	const [value, setValue] = useState('')
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const { handleError } = useHandleGenericError()

	const userDeleteMutation = useMutation({
		mutationFn: (id: number) => deleteUser(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['users'],
			})

			toast.success(t('Users.deleteSuccess', { value: currentRow.email }))

			onOpenChange(false)
		},
		onError: (error) => {
			handleError(error)
		},
	})

	const handleDelete = () => {
		if (value.trim() !== currentRow.email) return

		userDeleteMutation.mutate(currentRow.id_users)
	}

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleDelete}
			isLoading={userDeleteMutation.isPending}
			disabled={value.trim() !== currentRow.email}
			title={
				<span className='text-destructive'>
					<IconAlertTriangle
						className='mr-1 inline-block stroke-destructive'
						size={18}
					/>{' '}
					{t('Users.delete')}
				</span>
			}
			desc={
				<div className='space-y-4'>
					<Trans
						className='mb-2 block'
						i18nKey='Table.deleteDescription'
						components={[<span className='font-bold'></span>]}
						values={{
							name: currentRow.email,
						}}
					/>

					<Label className='my-2 block'>
						<span className='ml-1'>{t('Input.label.email')}:</span>
						<Input
							value={value}
							className='mt-2'
							onChange={(e) => setValue(e.target.value)}
							placeholder={t('Users.deletePlaceholder')}
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
