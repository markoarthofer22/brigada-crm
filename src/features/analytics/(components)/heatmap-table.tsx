import React, { useCallback, useMemo, useState } from 'react'
import {
	differenceInSeconds,
	format,
	isDate,
	isValid,
	parseISO,
} from 'date-fns'
import { createColumnHelper } from '@tanstack/react-table'
import { IconFileExcel } from '@tabler/icons-react'
import { hr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'
import LongText from '@/components/long-text.tsx'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header.tsx'
import { GenericTable } from '@/components/table/generic-table.tsx'
import { HeatmapData } from '@/features/analytics/(components)/heatmap.tsx'
import { exportHeatmapToExcel } from '@/features/analytics/services/heatmap-export.ts'

interface Props {
	className?: string
	heatmaps: HeatmapData[]
	trackings: any[]
	selectedTrackingId: number | null
	setSelectedTrackingId: React.Dispatch<React.SetStateAction<number | null>>
}

const HeatmapTable = ({
	className,
	selectedTrackingId,
	setSelectedTrackingId,
	heatmaps,
	trackings,
}: Props) => {
	const { t } = useTranslation()
	const columnHelper = createColumnHelper<HeatmapData>()
	const [isExporting, setIsExporting] = useState<boolean>(false)

	const trackingOptions = useMemo(() => {
		return trackings.map((tracking: any) => ({
			id: tracking.id_tracking,
			name: t('Table.trackingName', { value: tracking.id_tracking }),
		}))
	}, [t, trackings])

	const toDate = (v: unknown): Date | null => {
		if (!v) return null
		if (isDate(v)) return isValid(v) ? v : null
		try {
			const d = typeof v === 'string' ? parseISO(v) : (v as Date)
			return isValid(d) ? d : null
		} catch {
			return null
		}
	}

	const formatDuration = (start: unknown, end: unknown): string | null => {
		const s = toDate(start)
		const e = toDate(end)
		if (!s || !e) return null

		// use Math.ceil to avoid "0 sec" for 1-second difference
		const totalSeconds = Math.ceil((e.getTime() - s.getTime()) / 1000)
		if (totalSeconds < 0) return null

		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60

		return `${hours} h ${minutes} min ${seconds} sec`
	}

	const diffValue = (start: unknown, end: unknown): number | null => {
		const s = toDate(start)
		const e = toDate(end)
		if (!s || !e) return null
		return differenceInSeconds(e, s) // for sorting
	}

	const columns = useMemo(() => {
		return [
			columnHelper.accessor('id_tracking', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.id_tracking'
					/>
				),
				cell: ({ getValue }) => (
					<LongText className='max-w-36'>
						{t('Table.trackingName', {
							value: getValue(),
						})}
					</LongText>
				),
			}),

			columnHelper.accessor('name', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.zoneName'
					/>
				),
				cell: ({ getValue }) => (
					<LongText className='max-w-36'>{getValue()}</LongText>
				),
			}),

			columnHelper.accessor('started_at', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.started_at'
					/>
				),
				cell: ({ getValue }) => (
					<div className='w-fit text-nowrap'>
						{format(getValue(), 'dd.MM.yyyy HH:mm:ss', { locale: hr })}
					</div>
				),
				sortingFn: 'datetime',
			}),

			columnHelper.accessor('ended_at', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.ended_at'
					/>
				),
				cell: ({ getValue }) => (
					<div className='w-fit text-nowrap'>
						{format(getValue(), 'dd.MM.yyyy HH:mm:ss', { locale: hr })}
					</div>
				),
				sortingFn: 'datetime',
			}),

			columnHelper.accessor((row) => diffValue(row.started_at, row.ended_at), {
				id: 'duration',
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.duration'
					/>
				),
				cell: ({ row }) => {
					const value = formatDuration(
						row.original.started_at,
						row.original.ended_at
					)
					return <div className='w-fit text-nowrap'>{value ?? '—'}</div>
				},
				sortingFn: (rowA, rowB, columnId) => {
					const a = rowA.getValue<number | null>(columnId)
					const b = rowB.getValue<number | null>(columnId)
					if (a == null && b == null) return 0
					if (a == null) return 1
					if (b == null) return -1
					return a - b
				},
			}),
			columnHelper.accessor('heat.value', {
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title='Table.header.heat_value'
					/>
				),
				cell: ({ row }) => {
					const val = row?.original?.heat?.value
						? parseFloat(String(row.original.heat.value))
						: 0

					return <LongText className='max-w-36'>{val.toFixed(4)}</LongText>
				},
			}),
		]
	}, [columnHelper, diffValue, formatDuration, t])

	const exportExcel = useCallback(async () => {
		setIsExporting(true)
		try {
			await exportHeatmapToExcel({
				data: heatmaps,
				title: t('Analytics.heatmap.excelTitle'),
				filename: `heatmap-export-${new Date().getTime()}.xlsx`,
				t,
			})
		} catch (error) {
			console.error('Export failed:', error)
		} finally {
			setIsExporting(false)
		}
	}, [heatmaps])

	return (
		<div className={cn('', className)}>
			<GenericTable
				facetFilters={
					<>
						<Select
							disabled={isExporting}
							value={
								selectedTrackingId ? String(selectedTrackingId) : undefined
							}
							onValueChange={(value) => {
								setSelectedTrackingId(
									value ? (value === 'none' ? null : Number(value)) : null
								)
							}}
						>
							<SelectTrigger className='h-8 w-[200px] lg:w-[380px]'>
								<SelectValue placeholder={t('Table.selectTracking')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='none'>{t('Table.allTrackings')}</SelectItem>
								{trackingOptions.map((option) => (
									<SelectItem key={option.id} value={String(option.id)}>
										{option.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							variant='outline'
							size='sm'
							disabled={isExporting}
							onClick={exportExcel}
							className='gap-2 bg-transparent'
						>
							<IconFileExcel className='h-4 w-4' />
							{t('Analytics.heatmap.excel')}
						</Button>
					</>
				}
				perPage={20}
				data={heatmaps}
				columns={columns}
			/>
		</div>
	)
}

export default HeatmapTable
