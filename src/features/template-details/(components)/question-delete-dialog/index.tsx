import { IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

interface DeleteConfirmationProps {
	handleDelete: () => void
	disabled?: boolean
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function DeleteConfirmation({
	handleDelete,
	disabled,
	open,
	onOpenChange,
}: DeleteConfirmationProps) {
	const { t } = useTranslation()

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button
					disabled={disabled}
					variant='outline'
					size='sm'
					onClick={() => onOpenChange(true)}
					className='flex items-center gap-1 text-destructive hover:text-destructive'
				>
					<IconTrash className='size-5' />
					{t('Actions.delete')}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>
						{t('ProjectDetails.questions.confirmDelete')}
					</DialogTitle>
					<DialogDescription>
						{t('ProjectDetails.questions.confirmDeleteDescription')}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={disabled}
					>
						{t('Actions.cancel')}
					</Button>
					<Button
						variant='destructive'
						onClick={() => {
							handleDelete()
						}}
						disabled={disabled}
					>
						{t('Actions.delete')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
