import { useCallback, useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { IconFileExcel } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header.tsx'
import { GenericTable } from '@/components/table/generic-table.tsx'
import { FlowData } from '@/features/analytics/(components)/heatmap.tsx'
import { exportFlowDataToExcel } from '@/features/analytics/services/flow-data-export.ts'

interface Props {
	className?: string
	flows: FlowData[]
}

const FlowTable = ({ className, flows }: Props) => {
	const { t } = useTranslation()
	const columnHelper = createColumnHelper<FlowData>()
	const [isExporting, setIsExporting] = useState<boolean>(false)

	const columns = useMemo(() => {
		return [
			columnHelper.accessor('pathstring', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.pathString'
					/>
				),
				cell: ({ getValue }) => getValue(),
			}),

			columnHelper.accessor('path', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.pathLength'
					/>
				),
				cell: ({ getValue }) => {
					const pathArray = getValue()
					return (
						<div className='w-fit text-nowrap'>
							{pathArray.length} {pathArray.length === 1 ? 'zone' : 'zones'}
						</div>
					)
				},
				sortingFn: (rowA, rowB) => {
					const a = rowA.original.path.length
					const b = rowB.original.path.length
					return a - b
				},
			}),

			columnHelper.accessor('count', {
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title='Table.header.count' />
				),
				cell: ({ getValue }) => (
					<div className='w-fit text-nowrap'>{getValue().toLocaleString()}</div>
				),
			}),

			columnHelper.accessor('percentage', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.percentage'
					/>
				),
				cell: ({ getValue }) => {
					const val = getValue()
					return <div className='w-fit text-nowrap'>{val.toFixed(2)}%</div>
				},
			}),

			columnHelper.accessor('total_people', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.totalPeople'
					/>
				),
				cell: ({ getValue }) => (
					<div className='w-fit text-nowrap'>{getValue().toLocaleString()}</div>
				),
			}),

			columnHelper.accessor('total_visits', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.totalVisits'
					/>
				),
				cell: ({ getValue }) => (
					<div className='w-fit text-nowrap'>{getValue().toLocaleString()}</div>
				),
			}),
		]
	}, [columnHelper, t])

	const exportExcel = useCallback(async () => {
		setIsExporting(true)
		try {
			// TODO: Implement flow export to Excel
			await exportFlowDataToExcel({
				data: flows,
				title: t('Analytics.flow.excelTitle'),
				filename: t('Analytics.flow.filename', {
					time: new Date().toLocaleDateString(),
				}),
				t,
			})
		} catch (error) {
			console.error('Export failed:', error)
		} finally {
			setIsExporting(false)
		}
	}, [flows])

	return (
		<div className={cn('', className)}>
			<GenericTable
				facetFilters={
					<>
						<Button
							variant='outline'
							size='sm'
							disabled={isExporting}
							onClick={exportExcel}
							className='gap-2 bg-transparent'
						>
							<IconFileExcel className='h-4 w-4' />
							{t('Analytics.flow.excel')}
						</Button>
					</>
				}
				perPage={20}
				data={flows}
				columns={columns}
			/>
		</div>
	)
}

export default FlowTable
