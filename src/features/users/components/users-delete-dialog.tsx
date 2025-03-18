'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { User } from '@/api/services/user/schema.ts'
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

	const handleDelete = () => {
		if (value.trim() !== currentRow.firstname) return

		onOpenChange(false)
	}

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleDelete}
			disabled={value.trim() !== currentRow.firstname}
			title={
				<span className='text-destructive'>
					<IconAlertTriangle
						className='mr-1 inline-block stroke-destructive'
						size={18}
					/>{' '}
					Delete User
				</span>
			}
			desc={
				<div className='space-y-4'>
					<p className='mb-2'>
						Are you sure you want to delete{' '}
						<span className='font-bold'>
							{currentRow.firstname} {currentRow.lastname}
						</span>
						?
						<br />
						This action will permanently remove the user with the role of{' '}
						<span className='font-bold'>
							{t('Users.admin.' + currentRow.admin)}
						</span>{' '}
						from the system. This cannot be undone.
					</p>

					<Label className='my-2'>
						Username:
						<Input
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder='Enter username to confirm deletion.'
						/>
					</Label>

					<Alert variant='destructive'>
						<AlertTitle>Warning!</AlertTitle>
						<AlertDescription>
							Please be carefull, this operation can not be rolled back.
						</AlertDescription>
					</Alert>
				</div>
			}
			confirmText='Delete'
			destructive
		/>
	)
}
