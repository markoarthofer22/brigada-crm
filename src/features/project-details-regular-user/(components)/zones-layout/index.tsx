import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ProjectDetails } from '@/api/services/projects/schema.ts'
import { getZonesForTracking } from '@/api/services/trackings/options.ts'
import { StartZonePayload } from '@/api/services/trackings/schema.ts'
import {
	closeZoneTracking,
	startNewZoneTracking,
} from '@/api/services/trackings/trackings.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'
import Stopwatch from '@/components/stopwatch.tsx'
import { TrackingExam } from '@/features/project-details-regular-user/(components)/tracking-exam'

interface ZoneLayoutProps {
	zones: ProjectDetails['zones']
	allImages: ProjectDetails['images']
	projectId: number
	path: string
	hideDropdown?: boolean
	className?: string
	trackingId: number
}

const ZonesLayoutRegularUser = ({
	zones,
	allImages,
	path,
	projectId,
	hideDropdown = true,
	className,
	trackingId,
}: ZoneLayoutProps) => {
	const { t } = useTranslation()
	const [selectedImage, setSelectedImage] = useState<number | null>(null)
	const [confirmZoneId, setConfirmZoneId] = useState<number | null>(null)
	const [isZoneValid, setIsZoneValid] = useState<boolean>(true)
	const [activeZoneQuestions, setActiveZoneQuestions] = useState<
		ProjectDetails['questions']
	>([])
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const imageCanvasRef = useRef<HTMLCanvasElement>(null)
	const { handleError } = useHandleGenericError()
	const queryClient = useQueryClient()

	const allTrackingZonesQuery = useQuery(getZonesForTracking(trackingId))

	const activeZone = useMemo(() => {
		const allTrackingZones = allTrackingZonesQuery.data?.results ?? []
		return allTrackingZones.find((z) => z.ended_at === null)
	}, [allTrackingZonesQuery.data?.results])

	const stopZoneTrackingMutation = useMutation({
		mutationFn: ({ zoneId }: { zoneId: number }) => closeZoneTracking(zoneId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['trackings', 'zones', trackingId],
			})
			toast.success(t('ProjectDetailsRegularUser.closeTrackingSuccess'))
		},
		onError: handleError,
	})

	const startNewZoneTrackingMutation = useMutation({
		mutationFn: (data: StartZonePayload) => startNewZoneTracking(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['trackings', 'zones', trackingId],
			})
			toast.success(t('ProjectDetailsRegularUser.startZoneSuccess'))
		},
		onError: handleError,
	})

	const getZoneCenter = (points: { x: number; y: number }[]) => {
		if (points.length === 0) return { x: 0, y: 0 }
		const total = points.reduce(
			(acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
			{ x: 0, y: 0 }
		)
		return {
			x: total.x / points.length,
			y: total.y / points.length,
		}
	}

	const activeImage = useMemo(() => {
		return allImages?.find((image) => image.id_images === selectedImage)
	}, [allImages, selectedImage])

	const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!selectedImage || !projectId) {
			alert(t('ProjectDetails.selectImageFirst'))
			return
		}

		if (!canvasRef.current) return
		const rect = canvasRef.current.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top

		const ctx = canvasRef.current.getContext('2d')
		if (!ctx) return

		for (const zone of zones) {
			if (zone.id_images !== selectedImage) continue

			const points = zone.coordinates.points
			if (points.length < 3) continue

			ctx.beginPath()
			ctx.moveTo(points[0].x, points[0].y)
			for (let i = 1; i < points.length; i++) {
				ctx.lineTo(points[i].x, points[i].y)
			}
			ctx.closePath()

			if (ctx.isPointInPath(x, y)) {
				if (!isZoneValid) {
					toast.info(t('ProjectDetailsRegularUser.zoneQuestionsNotValid'))
					mapZoneQuestions()
					return
				}

				if (!activeZone) {
					startNewZoneTrackingMutation.mutate({
						id_projects: projectId,
						id_tracking: trackingId,
						id_zones: zone.id_zones,
					})
					return
				}

				if (activeZone && activeZone.id_zones !== zone.id_zones) {
					setConfirmZoneId(zone.id_zones)
				} else {
					mapZoneQuestions()
				}
				break
			}
		}
	}

	const handleCanvasLineDraw = useCallback(
		(zone?: ProjectDetails['zones'][number], isActive?: boolean) => {
			if (!zone?.coordinates?.points || zone.coordinates.points.length <= 1)
				return

			const canvas = canvasRef.current
			const ctx = canvas?.getContext('2d')
			if (!ctx) return

			const points = zone.coordinates.points

			ctx.beginPath()
			ctx.moveTo(points[0].x, points[0].y)
			for (let i = 1; i < points.length; i++) {
				ctx.lineTo(points[i].x, points[i].y)
			}
			ctx.lineTo(points[0].x, points[0].y)
			ctx.closePath()

			ctx.fillStyle = isActive
				? 'rgba(0, 200, 100, 0.4)'
				: 'rgba(180, 180, 180, 0.6)'
			ctx.fill()

			ctx.strokeStyle = 'black'
			ctx.lineWidth = 2
			ctx.stroke()
		},
		[]
	)

	const handleCanvasRender = useCallback(() => {
		if (!activeImage || !canvasRef.current) return

		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.width = activeImage.data.width
		canvas.height = activeImage.data.height

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		zones.forEach((zone) => {
			if (zone.id_images !== activeImage.id_images) return

			const isZoneActive = activeZone?.id_zones === zone.id_zones

			zone.coordinates.points.forEach((point) => {
				ctx.beginPath()
				ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
				ctx.fillStyle = 'black'
				ctx.fill()
			})

			handleCanvasLineDraw(zone, isZoneActive)

			const points = zone.coordinates.points
			if (points.length > 0) {
				const center = points.reduce(
					(acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
					{ x: 0, y: 0 }
				)
				center.x /= points.length
				center.y /= points.length

				ctx.font = '16px sans-serif'
				ctx.fillStyle = 'black'
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				ctx.fillText(zone.name, center.x, center.y)
			}
		})
	}, [activeImage, zones, handleCanvasLineDraw, activeZone])

	const handleImageCanvasRender = useCallback(() => {
		if (!activeImage || !imageCanvasRef.current) return

		const canvas = imageCanvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.width = activeImage.data.width
		canvas.height = activeImage.data.height

		const img = new Image()
		img.src = `${path}/${activeImage.name}`
		img.onload = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(img, 0, 0, activeImage.data.width, activeImage.data.height)
		}
	}, [activeImage, path])

	const mapZoneQuestions = useCallback(() => {
		if (activeZone && zones.length > 0) {
			const zone = zones.find((z) => z.id_zones === activeZone.id_zones)
			setActiveZoneQuestions(zone?.questions ?? [])
		}
	}, [activeZone, zones])

	const stopTrackingZoneHandler = () => {
		if (!activeZone) return

		if (!isZoneValid) {
			toast.info(t('ProjectDetailsRegularUser.zoneQuestionsNotValid'))
			mapZoneQuestions()
			return
		}

		stopZoneTrackingMutation.mutate({
			zoneId: activeZone.id_tracking_zones,
		})
	}

	useEffect(() => {
		if (allImages?.length) {
			setSelectedImage(allImages[0].id_images)
		}
	}, [allImages])

	useEffect(() => {
		canvasRef.current
			?.getContext('2d')
			?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
		imageCanvasRef.current
			?.getContext('2d')
			?.clearRect(
				0,
				0,
				imageCanvasRef.current.width,
				imageCanvasRef.current.height
			)
	}, [selectedImage])

	useEffect(() => {
		handleCanvasRender()
	}, [handleCanvasRender])

	useEffect(() => {
		handleImageCanvasRender()
	}, [handleImageCanvasRender])

	return (
		<>
			<div className={className}>
				{!hideDropdown && (
					<div className='mb-4 flex w-full max-w-[500px] items-center gap-x-2'>
						<Select
							value={selectedImage?.toString()}
							onValueChange={(val) => setSelectedImage(Number(val))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{allImages?.map((image) => (
									<SelectItem
										key={image.id_images}
										value={`${image.id_images}`}
									>
										{image.data.file_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div
					className='relative h-full max-h-[550px] w-full overflow-auto rounded-lg border border-primary'
					style={{
						maxWidth: activeImage?.data?.width
							? activeImage.data.width + 13
							: '100%',
					}}
				>
					<canvas
						ref={imageCanvasRef}
						className='absolute inset-0 z-[-1] grayscale'
					/>
					<canvas
						ref={canvasRef}
						onClick={handleCanvasClick}
						className='cursor-pointer rounded-lg'
					/>

					{zones.map((zone) => {
						if (zone.id_images !== activeImage?.id_images) return null
						const center = getZoneCenter(zone.coordinates.points)
						const isActive = activeZone?.id_zones === zone.id_zones

						if (!isActive) return null

						return (
							<div
								key={zone.id_zones}
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									if (isActive) {
										mapZoneQuestions()
										return
									}
								}}
								className='absolute z-10 flex flex-col items-center justify-center gap-2 rounded-md bg-muted p-2 shadow transition-all'
								style={{
									left: center.x,
									top: center.y,
									transform: 'translate(-50%, -50%)',
								}}
							>
								<div className='text-sm font-semibold'>{zone.name}</div>
								<Stopwatch
									startDate={activeZone?.started_at}
									className='font-mono text-xs'
								/>
								<Button
									variant='destructive'
									size='sm'
									onClick={(e) => {
										e.stopPropagation()
										stopTrackingZoneHandler()
									}}
								>
									{t('Actions.close')}
								</Button>
							</div>
						)
					})}
				</div>

				<AlertDialog
					open={!!confirmZoneId}
					onOpenChange={(open) => !open && setConfirmZoneId(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								{t('ProjectDetailsRegularUser.confirmCloseZoneTitle')}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{t('ProjectDetailsRegularUser.confirmCloseZone') ??
									'Another zone is active. Starting a new one will close it. Continue?'}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>{t('Actions.cancel')}</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									if (confirmZoneId) {
										startNewZoneTrackingMutation.mutate({
											id_projects: projectId,
											id_tracking: trackingId,
											id_zones: confirmZoneId,
										})
									}
									setConfirmZoneId(null)
								}}
							>
								{t('Actions.continue')}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			{activeZoneQuestions.length > 0 && (
				<Dialog
					open={activeZoneQuestions.length > 0}
					onOpenChange={(open) => !open && setActiveZoneQuestions([])}
				>
					<DialogContent
						onInteractOutside={(e) => {
							e.preventDefault()
						}}
						onEscapeKeyDown={(e) => {
							e.preventDefault()
						}}
					>
						<DialogHeader>
							<DialogTitle>
								{t('ProjectDetailsRegularUser.zoneQuestions', {
									value: zones.find(
										(zone) => zone.id_zones === activeZone?.id_zones
									)?.name,
								})}
							</DialogTitle>
						</DialogHeader>

						<TrackingExam
							trackingId={trackingId}
							projectId={projectId}
							questions={activeZoneQuestions}
							onValidityChange={(isValid) => {
								setIsZoneValid(isValid)
							}}
						/>

						<DialogFooter>
							<Button
								type='button'
								variant='outline'
								onClick={() => setActiveZoneQuestions([])}
							>
								{t('Actions.close')}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	)
}

export default ZonesLayoutRegularUser
