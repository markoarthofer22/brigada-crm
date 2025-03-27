import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconArrowBack, IconPlus, IconTrashX } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ProjectDetails } from '@/api/services/projects/schema.ts'
import { UpsertZone } from '@/api/services/zones/schema.ts'
import {
	deleteZoneForProject,
	updateZoneForProject,
} from '@/api/services/zones/zones.ts'
import { cn, getContrastColor, hexToRgba } from '@/lib/utils.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import { ZoneDialog } from '@/features/project-details/(components)/zones-action-dialog'
import { ZoneList } from '@/features/project-details/(components)/zones-list'

const DEFAULT_COLOR = '#ff0000'

interface ZoneLayoutProps {
	zones: ProjectDetails['zones']
	allImages: ProjectDetails['images']
	projectId: number
	path: string
	hasNoActiveLayout: boolean
	hasNoActiveLayoutCallback?: () => void
}

const ZoneLayout = ({
	zones,
	allImages,
	path,
	hasNoActiveLayout,
	projectId,
	hasNoActiveLayoutCallback,
}: ZoneLayoutProps) => {
	const { t } = useTranslation()
	const { showLoader, hideLoader } = useLoader()
	const { handleError } = useHandleGenericError()
	const queryClient = useQueryClient()
	const [selectedImage, setSelectedImage] = useState<number | null>(null)
	const [zoneDialogOpen, setZoneDialogOpen] = useState<boolean>(false)
	const [localZone, setLocalZone] = useState<UpsertZone | null>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const imageCanvasRef = useRef<HTMLCanvasElement>(null)

	const onSubmit = (data: UpsertZone) => {
		upsertZoneMutation.mutate(data)
	}

	const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!selectedImage || !projectId) {
			toast.error(t('ProjectDetails.selectImageFirst'))
			return
		}

		if (!canvasRef.current) return
		const rect = canvasRef.current.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top

		const currentData = {
			name: localZone?.name ?? '',
			questions: localZone?.questions ?? [],
			id_projects: projectId,
			id_images: selectedImage,
			coordinates: {
				name: localZone?.coordinates.name ?? '',
				color: localZone?.coordinates.color ?? '',
				points: [...(localZone?.coordinates.points ?? []), { x, y }],
			},
		}

		const canvas = canvasRef.current
		const context = canvas.getContext('2d')
		if (!context) return

		currentData?.coordinates.points.forEach((point) => {
			context.beginPath()
			context.arc(point.x, point.y, 5, 0, 2 * Math.PI)
			context.fillStyle = currentData?.coordinates.color ?? DEFAULT_COLOR
			context.fill()
		})

		setLocalZone(currentData)
	}

	const activeImage = useMemo(() => {
		return allImages?.find((image) => image.id_images === selectedImage)
	}, [allImages, selectedImage])

	const handleCanvasLineDraw = useCallback(
		(zone?: ProjectDetails['zones'][number]) => {
			const zones = zone ?? localZone

			if (zones?.coordinates.points && zones?.coordinates?.points.length > 1) {
				const canvas = canvasRef.current
				const context = canvas?.getContext('2d')
				if (!context) return

				const points = zones.coordinates.points

				if (points.length > 1) {
					context.beginPath()
					context.moveTo(points[0].x, points[0].y)
					for (let i = 1; i < points.length; i++) {
						context.lineTo(points[i].x, points[i].y)
					}
					if (zone) {
						context.lineTo(points[0].x, points[0].y)
						context.closePath()
						context.fillStyle = hexToRgba(
							zones.coordinates.color ?? DEFAULT_COLOR,
							0.4
						)
						context.fill()
					}
					context.strokeStyle = zones.coordinates.color ?? DEFAULT_COLOR
					context.lineWidth = 2
					context.stroke()
				}

				context.strokeStyle = DEFAULT_COLOR
			}
		},
		[localZone]
	)

	const handleResetCanvas = () => {
		setLocalZone(null)

		handleCanvasRender()
	}

	const handleCanvasRender = useCallback(
		(additionalZone?: UpsertZone) => {
			if (!activeImage || !canvasRef.current) return

			const canvas = canvasRef.current
			const context = canvas.getContext('2d')
			if (!context) return

			canvas.width = activeImage.data.width
			canvas.height = activeImage.data.height

			context.clearRect(0, 0, canvas.width, canvas.height)
			zones.forEach((zone) => {
				if (zone.id_images !== activeImage.id_images) return

				zone.coordinates.points.forEach((point) => {
					context.beginPath()
					context.arc(point.x, point.y, 5, 0, 2 * Math.PI)
					context.fillStyle = zone.coordinates?.color ?? DEFAULT_COLOR
					context.fill()
				})

				context.fillStyle = DEFAULT_COLOR
				handleCanvasLineDraw(zone)

				const points = zone.coordinates.points
				if (points.length > 0) {
					const center = points.reduce(
						(acc, point) => ({
							x: acc.x + point.x,
							y: acc.y + point.y,
						}),
						{ x: 0, y: 0 }
					)
					center.x /= points.length
					center.y /= points.length

					context.font = '16px sans-serif'
					context.fillStyle = getContrastColor(
						zone.coordinates?.color ?? DEFAULT_COLOR
					)
					context.textAlign = 'center'
					context.textBaseline = 'middle'
					context.fillText(zone.name, center.x, center.y)
				}
			})

			if (additionalZone) {
				additionalZone.coordinates.points.forEach((point) => {
					context.beginPath()
					context.arc(point.x, point.y, 5, 0, 2 * Math.PI)
					context.fillStyle = additionalZone.coordinates?.color ?? DEFAULT_COLOR
					context.fill()
				})

				context.fillStyle = DEFAULT_COLOR
				handleCanvasLineDraw()
			}
		},
		[activeImage, zones]
	)

	const handleImageCanvasRender = useCallback(() => {
		if (!activeImage || !imageCanvasRef.current) return

		const canvas = imageCanvasRef.current
		const context = canvas.getContext('2d')
		if (!context) return

		canvas.width = activeImage.data.width
		canvas.height = activeImage.data.height

		context.clearRect(0, 0, canvas.width, canvas.height)

		const img = new Image()
		img.src = `${path}/${activeImage.name}`
		img.onload = () => {
			context.clearRect(0, 0, canvas.width, canvas.height)
			context.drawImage(
				img,
				0,
				0,
				activeImage.data.width,
				activeImage.data.height
			)
		}
	}, [activeImage, path])

	const undoLastPoint = () => {
		if (!localZone || localZone.coordinates.points.length === 0) return
		const newPoints = localZone.coordinates.points.slice(0, -1)
		const updatedZone: UpsertZone = {
			...localZone,
			coordinates: {
				...localZone.coordinates,
				points: newPoints,
			},
		}
		setLocalZone(updatedZone)
		handleCanvasRender(updatedZone)
	}

	const deleteZoneMutation = useMutation({
		mutationFn: (zoneId: number) => {
			showLoader()
			return deleteZoneForProject(zoneId).finally(() => hideLoader())
		},
		onSuccess: async () => {
			toast.success(t('ProjectDetails.zones.deleteSuccess'))
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			})
			hideLoader()
		},
		onError: (error) => {
			hideLoader()
			handleError(error)
		},
	})

	const upsertZoneMutation = useMutation({
		mutationFn: (model: UpsertZone) => {
			showLoader()
			return updateZoneForProject(model)
		},
		onSuccess: async (req) => {
			toast.success(
				t(`ProjectDetails.zones.${req.id_zones ? 'editSuccess' : 'addSuccess'}`)
			)
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			})
			setZoneDialogOpen(false)
			setLocalZone(null)
			hideLoader()
		},
		onError: (error) => {
			hideLoader()
			handleError(error)
		},
	})

	useEffect(() => {
		if (allImages && allImages.length !== 0) {
			setSelectedImage(allImages[0].id_images)
		}
	}, [allImages])

	useEffect(() => {
		if (imageCanvasRef.current) {
			const context = imageCanvasRef.current.getContext('2d')
			if (context) {
				context.clearRect(
					0,
					0,
					imageCanvasRef.current.width,
					imageCanvasRef.current.height
				)
			}
		}

		if (canvasRef.current) {
			const context = canvasRef.current.getContext('2d')
			if (context) {
				context.clearRect(
					0,
					0,
					canvasRef.current.width,
					canvasRef.current.height
				)
			}
		}
	}, [selectedImage])

	useEffect(() => {
		handleCanvasRender()
	}, [handleCanvasRender])

	useEffect(() => {
		handleImageCanvasRender()
	}, [handleImageCanvasRender])

	useEffect(() => {
		handleCanvasLineDraw()
	}, [handleCanvasLineDraw])

	if (hasNoActiveLayout) {
		return (
			<Card className='mt-6 w-fit'>
				<CardContent className='flex items-center justify-center gap-x-2 p-6 text-muted-foreground'>
					{t('ProjectDetails.zones.noLayouts')}
					<Button onClick={hasNoActiveLayoutCallback}>
						{t('ProjectDetails.zones.createLayout')}
					</Button>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			<div>
				<div className='my-6 flex flex-col items-start space-y-6'>
					<p className='text-sm font-medium'>
						{t('ProjectDetails.selectImage')}
					</p>
					<div
						className='flex w-full flex-row items-center justify-between gap-x-2'
						style={{
							maxWidth: activeImage?.data?.width ?? '100%',
						}}
					>
						<Select
							value={selectedImage?.toString() ?? undefined}
							onValueChange={(value) => setSelectedImage(Number(value))}
						>
							<SelectTrigger className='w-[350px]'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent side='bottom'>
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

						<div className='flex flex-row items-center gap-x-2 pr-2'>
							<TooltipProvider>
								<Tooltip delayDuration={0}>
									<TooltipTrigger asChild>
										<Button
											disabled={!localZone}
											className={cn({
												'!pointer-events-auto cursor-context-menu hover:!bg-primary hover:!opacity-50':
													!localZone,
											})}
											onClick={() => setZoneDialogOpen(true)}
										>
											<IconPlus className='!size-5' />
											{t('ProjectDetails.zones.add')}
										</Button>
									</TooltipTrigger>
									<TooltipContent
										side='left'
										sideOffset={10}
										className='max-w-60 text-sm leading-5'
									>
										<p>{t('ProjectDetails.zones.addTooltip')}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<Button
								variant='outline'
								disabled={!localZone}
								onClick={undoLastPoint}
							>
								<IconArrowBack className='!size-5' />
								{t('Actions.undo')}
							</Button>

							<Button
								disabled={!localZone}
								variant='destructive'
								onClick={handleResetCanvas}
							>
								<IconTrashX className='!size-5' />
								{t('Actions.reset')}
							</Button>
						</div>
					</div>
				</div>
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
						className='absolute bottom-0 left-0 right-0 top-0 z-[-1]'
					/>
					<canvas
						onClick={handleCanvasClick}
						className='cursor-pointer rounded-lg'
						ref={canvasRef}
					/>
				</div>
			</div>

			<ZoneList
				isLoading={deleteZoneMutation.isPending || upsertZoneMutation.isPending}
				onDelete={(id) => deleteZoneMutation.mutate(id)}
				onEdit={(data) => upsertZoneMutation.mutateAsync(data)}
				zones={zones.filter((x) => x.id_images === selectedImage) ?? []}
				id_projects={projectId}
				id_images={selectedImage ?? undefined}
				className='my-6 max-w-5xl'
			/>

			<ZoneDialog
				isLoading={false}
				onSubmit={onSubmit}
				id_projects={localZone?.id_projects}
				id_images={localZone?.id_images}
				open={zoneDialogOpen}
				onOpenChange={() => setZoneDialogOpen(false)}
				points={localZone?.coordinates?.points ?? []}
			/>
		</>
	)
}

export default ZoneLayout
