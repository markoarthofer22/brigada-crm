import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { userTypes } from '@/api/services/user/const.ts'
import { User } from '@/api/services/user/schema.ts'
import { cn } from '@/lib/utils.ts'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header.tsx'
import { DataTableRowActions } from './data-table-row-actions'

const columnHelper = createColumnHelper<User>()

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

	columnHelper.accessor('firstname', {
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Table.header.firstname' />
		),
		cell: ({ getValue }) => (
			<LongText className='max-w-36'>{getValue()}</LongText>
		),
	}),
	columnHelper.accessor('lastname', {
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Table.header.lastname' />
		),
		cell: ({ getValue }) => (
			<LongText className='max-w-36'>{getValue()}</LongText>
		),
	}),

	columnHelper.accessor('email', {
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Table.header.email' />
		),
		cell: ({ getValue }) => (
			<div className='w-fit text-nowrap'>{getValue()}</div>
		),
	}),

	columnHelper.accessor('admin', {
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Table.header.admin' />
		),
		cell: ({ row, getValue }) => {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			const { t } = useTranslation()
			const { admin } = row.original
			const userType = userTypes.find(({ value }) => value === String(admin))
			if (!userType) return null

			return (
				<div className='flex items-center gap-x-2'>
					{userType.icon && (
						<userType.icon size={16} className='text-muted-foreground' />
					)}
					<span className='text-sm capitalize'>
						{t(`Users.admin.${getValue()}`)}
					</span>
				</div>
			)
		},
		filterFn: (row, id, value) => value.includes(row.getValue(id)),
	}),

	// Display column for row actions
	columnHelper.display({
		id: 'actions',
		cell: ({ row }) => <DataTableRowActions row={row} />,
	}),
]
