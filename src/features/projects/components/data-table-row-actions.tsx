import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useRouter } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Project } from '@/api/services/projects/schema.ts'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjects } from '@/features/projects/context/projects-context.tsx'

interface DataTableRowActionsProps {
	row: Row<Project>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
	const { setOpen, setCurrentRow } = useProjects()
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
								to: `/projects/${row.original.id_projects}`,
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
						onClick={() => {
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
