import { createColumnHelper } from '@tanstack/react-table'
import { Project } from '@/api/services/projects/schema.ts'
import { cn, formatDate } from '@/lib/utils.ts'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header.tsx'
import { DataTableRowActions } from './data-table-row-actions'

const columnHelper = createColumnHelper<Project>()

export const columns = [
	columnHelper.display({
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
				className='translate-y-[2px]'
			/>
		),
		meta: {
			className: cn(
				'sticky md:table-cell left-0 z-10 rounded-tl',
				'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
			),
		},
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
				className='translate-y-[2px]'
			/>
		),
		enableSorting: false,
		enableHiding: false,
	}),

	columnHelper.accessor('name', {
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Table.header.name' />
		),
		cell: ({ getValue }) => (
			<LongText className='max-w-36'>{getValue()}</LongText>
		),
	}),

	columnHelper.accessor('created_at', {
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Table.header.created_at' />
		),
		cell: ({ getValue }) => (
			<div className='w-fit text-nowrap'>
				{formatDate(getValue(), {
					year: 'numeric',
					month: '2-digit',
					day: 'numeric',
				})}
			</div>
		),
		sortingFn: 'datetime',
	}),

	columnHelper.display({
		id: 'actions',
		cell: ({ row }) => <DataTableRowActions row={row} />,
	}),
]
