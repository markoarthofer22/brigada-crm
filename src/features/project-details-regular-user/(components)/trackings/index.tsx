import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Trackings } from '@/api/services/trackings/schema.ts'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import Stopwatch from '@/components/stopwatch.tsx'

interface TrackingButtonListProps {
	trackings: Trackings[]
	activeTracking: number
	onSelect: (id: number) => void
	onCloseTracking: (id: number) => void
	addNewTrackingCallback: () => void
}

export default function TrackingButtonList({
	trackings,
	activeTracking,
	onSelect,
	onCloseTracking,
	addNewTrackingCallback,
}: TrackingButtonListProps) {
	const { t } = useTranslation()
	const [showModalFor, setShowModalFor] = useState<number | null>(null)

	const handleSelectTracking = (
		e: React.MouseEvent<HTMLDivElement, MouseEvent>,
		id: number
	) => {
		e.stopPropagation()
		onSelect(id)
	}

	return (
		<div className='flex gap-2 overflow-x-auto whitespace-nowrap px-2 py-1'>
			{trackings.map((tracking, index) => {
				const isActive = tracking.id_tracking === activeTracking

				return (
					<div
						key={tracking.id_tracking}
						onClick={(e) => handleSelectTracking(e, tracking.id_tracking)}
						className={clsx(
							'flex min-w-[160px] cursor-pointer flex-col justify-center gap-1 rounded-sm border p-2 text-center',
							isActive &&
								'boring-destructive bg-destructive/20 ring-1 ring-destructive'
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

						{isActive && (
							<AlertDialog
								open={showModalFor === tracking.id_tracking}
								onOpenChange={(open) =>
									setShowModalFor(open ? tracking.id_tracking : null)
								}
							>
								<AlertDialogTrigger asChild>
									<Button variant='destructive' className='mt-1 w-full text-xs'>
										{t('TrackingCard.finishTrackingTitle')}
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											{t('TrackingCard.finishTrackingTitle')}
										</AlertDialogTitle>
										<AlertDialogDescription>
											{t('TrackingCard.finishTrackingDescription')}
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>{t('Actions.cancel')}</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => {
												onCloseTracking(tracking.id_tracking)
												setShowModalFor(null)
											}}
										>
											{t('Actions.close')}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				)
			})}
			<div
				onClick={addNewTrackingCallback}
				className='flex min-w-[160px] cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed p-2 text-center transition-colors hover:bg-muted'
			>
				<div className='flex items-center gap-x-1.5 text-sm font-medium text-muted-foreground'>
					<IconPlus className='size-4' />{' '}
					{t('ProjectDetailsRegularUser.addNewTracking')}
				</div>
			</div>
		</div>
	)
}
