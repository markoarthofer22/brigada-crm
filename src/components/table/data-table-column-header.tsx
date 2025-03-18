import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretSortIcon,
	EyeNoneIcon,
} from '@radix-ui/react-icons'
import { Column } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>
	title: string
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	const { t } = useTranslation()

	if (!column.getCanSort()) {
		return (
			<div className={cn('text-xs font-medium', className)}>{t(title)}</div>
		)
	}

	return (
		<div className={cn('flex items-center space-x-2', className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						size='sm'
						className='-ml-3 h-8 hover:bg-transparent focus-visible:ring-0 data-[state=open]:bg-accent'
					>
						<span>{t(title)}</span>
						{column.getIsSorted() === 'desc' ? (
							<ArrowDownIcon className='ml-2 h-4 w-4' />
						) : column.getIsSorted() === 'asc' ? (
							<ArrowUpIcon className='ml-2 h-4 w-4' />
						) : (
							<CaretSortIcon className='ml-2 h-4 w-4' />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='start'>
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<ArrowUpIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
						{t('Table.header.sort.asc')}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<ArrowDownIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
						{t('Table.header.sort.desc')}
					</DropdownMenuItem>
					{column.getCanHide() && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
								<EyeNoneIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
								{t('Table.header.sort.hide')}
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
