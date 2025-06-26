import { createColumnHelper } from '@tanstack/react-table'
import { Project } from '@/api/services/projects/schema.ts'
import { formatDate } from '@/lib/utils.ts'
import LongText from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header.tsx'
import { DataTableRowActions } from './data-table-row-actions'

const columnHelper = createColumnHelper<Project>()

export const columns = [
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
