import React, { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { cn, formatDate } from '@/lib/utils.ts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select.tsx'
import LongText from '@/components/long-text.tsx'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header.tsx'
import { GenericTable } from '@/components/table/generic-table.tsx'
import { HeatmapData } from '@/features/analytics/(components)/heatmap.tsx'

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

	const trackingOptions = useMemo(() => {
		return trackings.map((tracking: any) => ({
			id: tracking.id_tracking,
			name: t('Table.trackingName', { value: tracking.id_tracking }),
		}))
	}, [t, trackings])

	// console.log("test")

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
						{formatDate(getValue(), {
							year: 'numeric',
							month: '2-digit',
							day: 'numeric',
						})}
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
						{formatDate(getValue(), {
							year: 'numeric',
							month: '2-digit',
							day: 'numeric',
						})}
					</div>
				),
				sortingFn: 'datetime',
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
	}, [columnHelper, t])

	return (
		<div className={cn('', className)}>
			<GenericTable
				facetFilters={
					<Select
						value={selectedTrackingId ? String(selectedTrackingId) : undefined}
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
				}
				perPage={20}
				data={heatmaps}
				columns={columns}
			/>
		</div>
	)
}

export default HeatmapTable
