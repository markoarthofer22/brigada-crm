import React from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { DataTableViewOptions } from './data-table-view-options.tsx'

interface DataTableToolbarProps<TData> {
	table: Table<TData>
	facetFilters?: React.ReactNode
	tableViewTranslationKey?: string
}

export function DataTableToolbar<TData>({
	table,
	facetFilters,
	tableViewTranslationKey,
}: DataTableToolbarProps<TData>) {
	const { t } = useTranslation()
	const isFiltered = table.getState().columnFilters.length > 0

	return (
		<div className='flex items-center justify-between'>
			<div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
				<Input
					placeholder={t('Table.filter')}
					value={table.getState().globalFilter ?? ''}
					onChange={(e) => table.setGlobalFilter(String(e.target.value))}
					className='h-8 w-[150px] lg:w-[250px]'
				/>
				<div className='flex gap-x-2'>{facetFilters}</div>
				{isFiltered && (
					<Button
						variant='ghost'
						onClick={() => table.resetColumnFilters()}
						className='h-8 px-2 lg:px-3'
					>
						{t('Actions.clearFilters')}
						<Cross2Icon className='ml-2 h-4 w-4' />
					</Button>
				)}
			</div>
			<DataTableViewOptions
				table={table}
				tableViewTranslationKey={tableViewTranslationKey}
			/>
		</div>
	)
}
