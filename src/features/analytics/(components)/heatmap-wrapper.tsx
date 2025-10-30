import { useMemo, useState } from 'react'
import { Flame, Table2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button'
import HeatmapTable from '@/features/analytics/(components)/heatmap-table.tsx'
import {
	HeatmapViewer,
	type HeatmapViewerProps,
} from '@/features/analytics/(components)/heatmap.tsx'

interface Props
	extends Omit<
		HeatmapViewerProps,
		'selectedTrackingId' | 'setSelectedTrackingId'
	> {
	className?: string
	trackings?: any[]
	exportName?: string
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
}: Props) => {
	const { t } = useTranslation()

	const [selectedTrackingId, setSelectedTrackingId] = useState<number | null>(
		null
	)
	const [view, setView] = useState<'table' | 'heatmap'>('table')

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

			{view === 'table' ? (
				<HeatmapTable
					selectedTrackingId={selectedTrackingId}
					setSelectedTrackingId={setSelectedTrackingId}
					trackings={trackings}
					heatmaps={filteredHeatmaps}
				/>
			) : (
				<HeatmapViewer
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
