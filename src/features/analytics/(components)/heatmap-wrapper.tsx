import { useMemo, useState } from 'react'
import {
	IconTableDown,
	IconTableImport,
	IconTablePlus,
	IconTableSpark,
} from '@tabler/icons-react'
import { Flame, Route, Table2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button'
import FlowTable from '@/features/analytics/(components)/flowdata-table.tsx'
import HeatmapTable from '@/features/analytics/(components)/heatmap-table.tsx'
import EntryPointsTable from '@/features/analytics/(components)/heatmap-tables/entry-points.tsx'
import ExitPointsTable from '@/features/analytics/(components)/heatmap-tables/exit-points.tsx'
import MostCommonTable from '@/features/analytics/(components)/heatmap-tables/most-common.tsx'
import MostVisitedTable from '@/features/analytics/(components)/heatmap-tables/most-visited.tsx'
import {
	HeatmapViewer,
	type HeatmapViewerProps,
} from '@/features/analytics/(components)/heatmap.tsx'

export interface Props
	extends Omit<
		HeatmapViewerProps,
		'selectedTrackingId' | 'setSelectedTrackingId'
	> {
	className?: string
	trackings?: any[]
	exportName?: string
	zonePathsTable: {
		entry_points: {
			count: number
			zone: string
		}[]
		exit_points: {
			count: number
			zone: string
		}[]
		most_common_transitions: {
			count: number
			people: number
			transition: string
			visits: number
		}[]
		most_visited_zones: {
			zone: string
			people: number
			visits: number
		}[]
	}
}

const HeatmapWrapper = ({
	trackings = [],
	className,
	heatmaps,
	backgroundImage,
	width = 800,
	height = 600,
	radius = 25,
	blur = 0.6,
	zones = [],
	exportName,
	flowData = [],
	zonePathsTable,
	zonesPathsInDepthD3,
}: Props) => {
	const { t } = useTranslation()

	const [selectedTrackingId, setSelectedTrackingId] = useState<number | null>(
		null
	)
	const [view, setView] = useState<
		| 'table'
		| 'heatmap'
		| 'flowData'
		| 'entry-point'
		| 'exit-points'
		| 'most-common'
		| 'most-visited'
	>('table')

	const filteredHeatmaps = useMemo(() => {
		if (!heatmaps) return []

		if (selectedTrackingId === null) return heatmaps
		return heatmaps?.filter(
			(heatmap) => heatmap.id_tracking === selectedTrackingId
		)
	}, [heatmaps, selectedTrackingId])

	return (
		<div className={cn('mt-6', className)}>
			<div className='mb-6 inline-flex items-center rounded-lg border bg-muted p-1'>
				<Button
					variant={view === 'table' ? 'default' : 'ghost'}
					size='sm'
					onClick={() => setView('table')}
					className={cn(
						'gap-2',
						view === 'table' ? '' : 'hover:bg-transparent'
					)}
				>
					<Table2 className='h-4 w-4' />
					{t('Analytics.heatmap.table')}
				</Button>
				<Button
					variant={view === 'entry-point' ? 'default' : 'ghost'}
					size='sm'
					onClick={() => setView('entry-point')}
					className={cn(
						'gap-2',
						view === 'entry-point' ? '' : 'hover:bg-transparent'
					)}
				>
					<IconTableImport className='h-4 w-4' />
					{t('Analytics.heatmap.entryPoint')}
				</Button>
				<Button
					variant={view === 'exit-points' ? 'default' : 'ghost'}
					size='sm'
					onClick={() => setView('exit-points')}
					className={cn(
						'gap-2',
						view === 'exit-points' ? '' : 'hover:bg-transparent'
					)}
				>
					<IconTableDown className='h-4 w-4' />
					{t('Analytics.heatmap.exitPoints')}
				</Button>
				<Button
					variant={view === 'most-common' ? 'default' : 'ghost'}
					size='sm'
					onClick={() => setView('most-common')}
					className={cn(
						'gap-2',
						view === 'most-common' ? '' : 'hover:bg-transparent'
					)}
				>
					<IconTableSpark className='h-4 w-4' />
					{t('Analytics.heatmap.mostCommon')}
				</Button>
				<Button
					variant={view === 'most-visited' ? 'default' : 'ghost'}
					size='sm'
					onClick={() => setView('most-visited')}
					className={cn(
						'gap-2',
						view === 'most-visited' ? '' : 'hover:bg-transparent'
					)}
				>
					<IconTablePlus className='h-4 w-4' />
					{t('Analytics.heatmap.mostVisited')}
				</Button>
				<Button
					variant={view === 'flowData' ? 'default' : 'ghost'}
					size='sm'
					onClick={() => setView('flowData')}
					className={cn(
						'gap-2',
						view === 'flowData' ? '' : 'hover:bg-transparent'
					)}
				>
					<Route className='h-4 w-4' />
					{t('Analytics.heatmap.flowData')}
				</Button>
				<Button
					variant={view === 'heatmap' ? 'default' : 'ghost'}
					size='sm'
					onClick={() => setView('heatmap')}
					className={cn(
						'gap-2',
						view === 'heatmap' ? '' : 'hover:bg-transparent'
					)}
				>
					<Flame className='h-4 w-4' />
					{t('Analytics.heatmap.heatmap')}
				</Button>
			</div>

			{view === 'table' && (
				<HeatmapTable
					selectedTrackingId={selectedTrackingId}
					setSelectedTrackingId={setSelectedTrackingId}
					trackings={trackings}
					heatmaps={filteredHeatmaps}
				/>
			)}

			{view === 'entry-point' && (
				<EntryPointsTable data={zonePathsTable.entry_points} />
			)}

			{view === 'exit-points' && (
				<ExitPointsTable data={zonePathsTable.exit_points} />
			)}

			{view === 'most-common' && (
				<MostCommonTable data={zonePathsTable.most_common_transitions} />
			)}

			{view === 'most-visited' && (
				<MostVisitedTable data={zonePathsTable.most_visited_zones} />
			)}

			{view === 'flowData' && <FlowTable flows={flowData} />}

			{view === 'heatmap' && (
				<HeatmapViewer
					zonesPathsInDepthD3={zonesPathsInDepthD3}
					exportName={exportName}
					zones={zones}
					selectedTrackingId={selectedTrackingId}
					setSelectedTrackingId={setSelectedTrackingId}
					trackings={trackings}
					heatmaps={filteredHeatmaps}
					backgroundImage={backgroundImage}
					width={width}
					height={height}
					radius={radius}
					blur={blur}
					flowData={flowData}
				/>
			)}
		</div>
	)
}

export default HeatmapWrapper
