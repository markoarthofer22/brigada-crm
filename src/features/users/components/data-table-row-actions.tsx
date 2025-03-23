import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useRouter } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { User } from '@/api/services/user/schema.ts'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUsers } from '../context/users-context'

interface DataTableRowActionsProps {
	row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
	const { setOpen, setCurrentRow } = useUsers()
	const { t } = useTranslation()
	const router = useRouter()

	return (
		<>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						onClick={(e) => e.stopPropagation()}
						variant='ghost'
						className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
					>
						<DotsHorizontalIcon className='h-4 w-4' />
						<span className='sr-only'>Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-[160px]'>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation()
							router.navigate({
								to: `/users/${row.original.id_users}`,
							})
						}}
					>
						{t('Actions.edit')}
						<DropdownMenuShortcut>
							<IconEdit size={16} />
						</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation()
							setCurrentRow(row.original)
							setOpen('delete')
						}}
						className='!text-destructive'
					>
						{t('Actions.delete')}
						<DropdownMenuShortcut>
							<IconTrash size={16} />
						</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}
