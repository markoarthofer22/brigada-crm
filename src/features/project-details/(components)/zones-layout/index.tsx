'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	IconArrowBack,
	IconMinus,
	IconPlus,
	IconRestore,
	IconTrashX,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ProjectDetails } from '@/api/services/projects/schema.ts'
import type { UpsertZone } from '@/api/services/zones/schema.ts'
import {
	deleteZoneForProject,
	updateZoneForProject,
} from '@/api/services/zones/zones.ts'
import { getContrastColor, hexToRgba } from '@/lib/utils.ts'
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
const MIN_ZOOM = 0.25
const MAX_ZOOM = 2
const ZOOM_STEP = 0.1

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

	// State
	const [selectedImage, setSelectedImage] = useState<number | null>(null)
	const [zoneDialogOpen, setZoneDialogOpen] = useState(false)
	const [localZone, setLocalZone] = useState<UpsertZone | null>(null)
	const [zoomLevel, setZoomLevel] = useState(1)

	// Refs
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const imageCanvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const initialZoomRef = useRef<number | null>(null)

	// Mutations
	const deleteZoneMutation = useMutation({
		mutationFn: (zoneId: number) => {
			showLoader()
			return deleteZoneForProject(zoneId).finally(() => hideLoader())
		},
		onSuccess: async () => {
			toast.success(t('ProjectDetails.zones.deleteSuccess'))
			await queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
			hideLoader()
		},
		onError: (err) => {
			hideLoader()
			handleError(err)
		},
	})

	const upsertZoneMutation = useMutation({
		mutationFn: (data: UpsertZone) => {
			showLoader()
			return updateZoneForProject(data)
		},
		onSuccess: async (res) => {
			toast.success(
				t(`ProjectDetails.zones.${res.id_zones ? 'editSuccess' : 'addSuccess'}`)
			)
			await queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
			setZoneDialogOpen(false)
			setLocalZone(null)
			hideLoader()
		},
		onError: (err) => {
			hideLoader()
			handleError(err)
		},
	})

	const onSubmit = (data: UpsertZone) => upsertZoneMutation.mutate(data)

	// Active image
	const activeImage = useMemo(
		() => allImages?.find((img) => img.id_images === selectedImage),
		[allImages, selectedImage]
	)

	// Initialize selection
	useEffect(() => {
		if (allImages?.length) setSelectedImage(allImages[0].id_images)
	}, [allImages])

	// Clear canvases and working zone on image change
	useEffect(() => {
		const imgCtx = imageCanvasRef.current?.getContext('2d')
		imgCtx?.clearRect(
			0,
			0,
			imageCanvasRef.current!.width,
			imageCanvasRef.current!.height
		)
		const ctx = canvasRef.current?.getContext('2d')
		ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
		setLocalZone(null)
	}, [selectedImage])

	// Fit-to-width on load
	useEffect(() => {
		if (!activeImage || !containerRef.current) return
		const fit = containerRef.current.clientWidth / activeImage.data.width
		if (initialZoomRef.current === null) initialZoomRef.current = fit
		setZoomLevel(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fit)))
	}, [activeImage])

	// Draw background image only on image or zoom change
	const renderImage = useCallback(() => {
		const c = imageCanvasRef.current
		const img = activeImage
		if (!c || !img) return
		const ctx = c.getContext('2d')!
		c.width = img.data.width * zoomLevel
		c.height = img.data.height * zoomLevel
		const image = new Image()
		image.src = `${path}/${img.name}`
		image.onload = () => {
			ctx.clearRect(0, 0, c.width, c.height)
			ctx.save()
			ctx.scale(zoomLevel, zoomLevel)
			ctx.drawImage(image, 0, 0, img.data.width, img.data.height)
			ctx.restore()
		}
	}, [activeImage, path, zoomLevel])

	// Draw zones + working zone on zones, zoom, or working change
	const renderZones = useCallback(
		(working?: UpsertZone) => {
			const canvas = canvasRef.current
			const img = activeImage
			if (!canvas || !img) return
			const ctx = canvas.getContext('2d')!
			canvas.width = img.data.width * zoomLevel
			canvas.height = img.data.height * zoomLevel
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.save()
			ctx.scale(zoomLevel, zoomLevel)

			// existing zones
			zones.forEach((z) => {
				if (z.id_images !== img.id_images) return
				const pts = z.coordinates.points
				// dots
				pts.forEach((p) => {
					ctx.beginPath()
					ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
					ctx.fillStyle = z.coordinates.color || DEFAULT_COLOR
					ctx.fill()
				})
				// polygon fill + stroke
				if (pts.length > 1) {
					ctx.beginPath()
					ctx.moveTo(pts[0].x, pts[0].y)
					pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
					ctx.closePath()
					ctx.fillStyle = hexToRgba(z.coordinates.color || DEFAULT_COLOR, 0.4)
					ctx.fill()
					ctx.strokeStyle = z.coordinates.color || DEFAULT_COLOR
					ctx.lineWidth = 2
					ctx.stroke()
				}
				// label
				if (pts.length) {
					const center = pts.reduce(
						(a, p) => ({ x: a.x + p.x, y: a.y + p.y }),
						{ x: 0, y: 0 }
					)
					center.x /= pts.length
					center.y /= pts.length
					ctx.font = '16px sans-serif'
					ctx.fillStyle = getContrastColor(z.coordinates.color || DEFAULT_COLOR)
					ctx.textAlign = 'center'
					ctx.textBaseline = 'middle'
					ctx.fillText(z.name, center.x, center.y)
				}
			})

			// working zone
			if (working) {
				const pts = working.coordinates.points
				pts.forEach((p) => {
					ctx.beginPath()
					ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
					ctx.fillStyle = working.coordinates.color || DEFAULT_COLOR
					ctx.fill()
				})
				if (pts.length > 1) {
					ctx.beginPath()
					ctx.moveTo(pts[0].x, pts[0].y)
					pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
					ctx.closePath()
					ctx.fillStyle = hexToRgba(
						working.coordinates.color || DEFAULT_COLOR,
						0.4
					)
					ctx.fill()
					ctx.strokeStyle = working.coordinates.color || DEFAULT_COLOR
					ctx.lineWidth = 2
					ctx.stroke()
				}
			}

			ctx.restore()
		},
		[activeImage, zones, zoomLevel]
	)

	// on click add point
	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!selectedImage || !projectId) {
			toast.error(t('ProjectDetails.selectImageFirst'))
			return
		}
		const rect = canvasRef.current!.getBoundingClientRect()
		const x = (e.clientX - rect.left) / zoomLevel
		const y = (e.clientY - rect.top) / zoomLevel
		setLocalZone((l) => ({
			name: l?.name || '',
			questions: l?.questions || [],
			id_projects: projectId,
			id_images: selectedImage,
			coordinates: {
				name: l?.coordinates.name || '',
				color: l?.coordinates.color || DEFAULT_COLOR,
				points: [...(l?.coordinates.points || []), { x, y }],
			},
		}))
	}

	// effects: separate for image and zones
	useEffect(() => renderImage(), [renderImage])
	useEffect(() => renderZones(localZone || undefined), [renderZones, localZone])

	const undoLastPoint = () =>
		setLocalZone((l) => {
			if (!l) return null
			const pts = l.coordinates.points
			// if removing this point leaves no points, clear the working zone entirely
			if (pts.length <= 1) {
				return null
			}
			return {
				...l,
				coordinates: {
					...l.coordinates,
					points: pts.slice(0, -1),
				},
			}
		})
	const resetWorking = () => setLocalZone(null)

	// zoom handlers
	const handleZoom = (dir: 'in' | 'out') =>
		setZoomLevel((z) =>
			Math.max(
				MIN_ZOOM,
				Math.min(
					MAX_ZOOM,
					Math.round((z + (dir === 'in' ? ZOOM_STEP : -ZOOM_STEP)) * 10) / 10
				)
			)
		)
	const resetZoom = () =>
		initialZoomRef.current !== null && setZoomLevel(initialZoomRef.current)

	if (hasNoActiveLayout)
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

	return (
		<>
			{/* selector + controls */}
			<div className='my-6 flex flex-col items-start space-y-6'>
				<p className='text-sm font-medium'>{t('ProjectDetails.selectImage')}</p>
				<div
					className='flex w-full items-center justify-between gap-x-2'
					style={{ maxWidth: activeImage?.data.width ?? '100%' }}
				>
					<Select
						value={selectedImage?.toString()}
						onValueChange={(v) => setSelectedImage(Number(v))}
					>
						<SelectTrigger className='w-[350px]'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent side='bottom'>
							{allImages?.map((img) => (
								<SelectItem key={img.id_images} value={`${img.id_images}`}>
									{' '}
									{img.data.file_name}{' '}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className='flex items-center gap-x-2'>
						<TooltipProvider>
							<Tooltip delayDuration={0}>
								<TooltipTrigger asChild>
									<Button
										disabled={!localZone}
										onClick={() => setZoneDialogOpen(true)}
									>
										<IconPlus className='!size-5' />
										{t('ProjectDetails.zones.add')}
									</Button>
								</TooltipTrigger>
								<TooltipContent
									side='left'
									sideOffset={10}
									className='max-w-60 text-sm'
								>
									{t('ProjectDetails.zones.addTooltip')}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<Button
							variant='outline'
							disabled={!localZone}
							onClick={undoLastPoint}
						>
							<IconArrowBack className='!size-5' /> {t('Actions.undo')}
						</Button>
						<Button
							variant='destructive'
							disabled={!localZone}
							onClick={resetWorking}
						>
							<IconTrashX className='!size-5' /> {t('Actions.reset')}
						</Button>
					</div>
				</div>
			</div>

			<div className='relative'>
				<div
					ref={containerRef}
					className='relative h-full max-h-[550px] w-full overflow-auto rounded-lg border border-primary'
					style={{
						maxWidth: activeImage?.data.width
							? activeImage.data.width * zoomLevel + 13
							: '100%',
					}}
				>
					<canvas ref={imageCanvasRef} className='absolute inset-0 z-[-1]' />
					<canvas
						ref={canvasRef}
						className='cursor-pointer rounded-lg'
						onClick={handleCanvasClick}
					/>
				</div>
				<div className='absolute bottom-4 left-4 flex flex-col items-center gap-2 rounded-md bg-black/20 p-1'>
					<Button variant='outline' size='sm' onClick={resetZoom}>
						<IconRestore className='!size-5' />
					</Button>
					<Button variant='outline' size='sm' onClick={() => handleZoom('out')}>
						<IconMinus className='!size-5' />
					</Button>
					<span className='text-sm font-medium'>
						{Math.round(zoomLevel * 100)}%
					</span>
					<Button variant='outline' size='sm' onClick={() => handleZoom('in')}>
						<IconPlus className='!size-5' />
					</Button>
				</div>
			</div>
			{/* list & dialog */}
			<ZoneList
				isLoading={deleteZoneMutation.isPending || upsertZoneMutation.isPending}
				onDelete={(id) => deleteZoneMutation.mutate(id)}
				onEdit={(data) => upsertZoneMutation.mutateAsync(data)}
				zones={zones.filter((z) => z.id_images === selectedImage)}
				id_projects={projectId}
				id_images={selectedImage || undefined}
				className='my-6 max-w-5xl'
			/>
			<ZoneDialog
				open={zoneDialogOpen}
				onOpenChange={() => setZoneDialogOpen(false)}
				onSubmit={onSubmit}
				id_projects={localZone?.id_projects}
				id_images={localZone?.id_images}
				points={localZone?.coordinates.points || []}
				isLoading={upsertZoneMutation.isPending}
			/>
		</>
	)
}

export default ZoneLayout
