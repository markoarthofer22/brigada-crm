'use client'

import type React from 'react'
import { IconPlus } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { Trackings } from '@/api/services/trackings/schema.ts'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button'
import Stopwatch from '@/components/stopwatch.tsx'

interface TrackingButtonListProps {
	trackings: Trackings[]
	activeTracking: number
	onSelect: (id: number) => void
	onCloseTracking: (id: number) => void
	addNewTrackingCallback: () => void
	isMinimized?: boolean
}

export default function TrackingButtonList({
	trackings,
	activeTracking,
	onSelect,
	onCloseTracking,
	addNewTrackingCallback,
	isMinimized = false,
}: TrackingButtonListProps) {
	const { t } = useTranslation()

	const handleSelectTracking = (
		e: React.MouseEvent<HTMLDivElement, MouseEvent>,
		id: number
	) => {
		e.stopPropagation()
		onSelect(id)
	}

	const getColorStyles = (
		hex: string,
		isActive: boolean
	): { backgroundColor: string; borderColor: string } => {
		const clean = hex.replace(/^#/, '')
		const num = Number.parseInt(clean, 16)
		const r = (num >> 16) & 0xff
		const g = (num >> 8) & 0xff
		const b = num & 0xff
		const rgba35 = `rgba(${r},${g},${b},0.35)`
		const rgba80 = `rgba(${r},${g},${b},0.8)`
		const fullHex = hex.startsWith('#') ? hex : `#${clean}`
		return isActive
			? { backgroundColor: fullHex, borderColor: fullHex }
			: { backgroundColor: rgba35, borderColor: rgba80 }
	}

	return (
		<div className='flex flex-1 gap-2 overflow-x-auto whitespace-nowrap px-2 py-1'>
			{trackings.map((tracking) => {
				const isActive = tracking.id_tracking === activeTracking

				const { backgroundColor, borderColor } = getColorStyles(
					tracking.color!,
					isActive
				)
				return (
					<div
						key={tracking.id_tracking}
						onClick={(e) => handleSelectTracking(e, tracking.id_tracking)}
						style={{ backgroundColor, borderColor }}
						className={cn(
							'flex min-w-[160px] cursor-pointer flex-col justify-center gap-1 rounded-sm border-2 p-2 text-center transition-all duration-300',
							{
								'h-10 min-w-[auto] overflow-hidden': isMinimized,
							}
						)}
					>
						<div className='flex flex-col items-center gap-1'>
							<div className='text-sm font-medium'>
								{t('TrackingCard.tracking')} {tracking.id_tracking_count}
							</div>
							<Stopwatch
								startDate={tracking.started_at}
								className='font-mono text-xs'
							/>
						</div>
						{isActive && !isMinimized && (
							<Button
								variant='destructive'
								className='mt-1 w-full text-xs'
								onClick={() => onCloseTracking(tracking.id_tracking)}
							>
								{t('TrackingCard.finishTrackingTitle')}
							</Button>
						)}
					</div>
				)
			})}
			<div
				onClick={addNewTrackingCallback}
				className={cn(
					'flex min-w-[160px] cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed p-2 text-center transition-all duration-300 hover:bg-muted',
					{
						'h-10': isMinimized,
					}
				)}
			>
				<div className='flex flex-wrap items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground'>
					<IconPlus className='size-4' />{' '}
					{!isMinimized && (
						<span className='whitespace-break-spaces break-words'>
							{t('ProjectDetailsRegularUser.addNewTracking')}
						</span>
					)}
				</div>
			</div>
		</div>
	)
}
