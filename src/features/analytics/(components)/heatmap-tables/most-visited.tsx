import { useCallback, useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { IconFileExcel } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header.tsx'
import { GenericTable } from '@/components/table/generic-table.tsx'
import { Props as HeatmapWrapperProps } from '@/features/analytics/(components)/heatmap-wrapper.tsx'
import { exportMostVisitedData } from '@/features/analytics/services/most-visited-data-export.ts'

export type Data =
	HeatmapWrapperProps['zonePathsTable']['most_visited_zones'][number]

interface Props {
	className?: string
	data: Data[]
}
const MostVisitedTable = ({ className, data }: Props) => {
	const { t } = useTranslation()
	const columnHelper = createColumnHelper<Data>()
	const [isExporting, setIsExporting] = useState<boolean>(false)

	const columns = useMemo(() => {
		return [
			columnHelper.accessor('zone', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Analytics.heatmap.zone'
					/>
				),
				cell: ({ getValue }) => getValue(),
			}),

			columnHelper.accessor('people', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Analytics.heatmap.people'
					/>
				),
				cell: ({ getValue }) => getValue(),
			}),

			columnHelper.accessor('visits', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Analytics.heatmap.visits'
					/>
				),
				cell: ({ getValue }) => getValue(),
			}),
		]
	}, [columnHelper, t])

	const exportExcel = useCallback(async () => {
		setIsExporting(true)
		try {
			await exportMostVisitedData({
				data: data,
				title: t('Analytics.heatmap.mostVisitedExcelTitle'),
				filename: t('Analytics.heatmap.mostVisitedFilename', {
					time: new Date().toLocaleDateString(),
				}),
				t,
			})
		} catch (error) {
			console.error('Export failed:', error)
		} finally {
			setIsExporting(false)
		}
	}, [data, t])

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
							{t('Analytics.heatmap.exportToExcel')}
						</Button>
					</>
				}
				perPage={20}
				data={data}
				columns={columns}
				tableViewTranslationKey='Analytics.heatmap'
			/>
		</div>
	)
}

export default MostVisitedTable
