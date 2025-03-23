import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ProjectDetails, UpsertZone } from '@/api/services/projects/schema.ts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'
import { ZoneDialog } from '@/features/project-details/(components)/zones-action-dialog'
import { ZoneList } from '@/features/project-details/(components)/zones-layout/zones-list'

const DEFAULT_COLOR = '#FF5733'

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
	const [selectedImage, setSelectedImage] = useState<number | null>(null)
	const [zoneDialogOpen, setZoneDialogOpen] = useState<boolean>(false)
	const [localZone, setLocalZone] = useState<UpsertZone | null>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const onSubmit = (data: UpsertZone) => {
		console.log('data', data)

		setZoneDialogOpen(false)
		setLocalZone(null)

		const canvas = canvasRef?.current?.getContext('2d')
		if (!canvas) return
		canvas.beginPath()
		canvas.arc(
			data.coordinates.points[0].x,
			data.coordinates.points[0].y,
			data.coordinates.radius ?? 5,
			0,
			2 * Math.PI
		)
		canvas.fillStyle = localZone?.coordinates?.color ?? DEFAULT_COLOR
		canvas.fill()
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
		setLocalZone((prev) => ({
			name: prev?.name ?? '',
			id_projects: projectId,
			id_images: selectedImage,
			coordinates: {
				name: prev?.coordinates.name ?? '',
				color: prev?.coordinates.color ?? '',
				points: [{ x, y }],
			},
		}))

		setZoneDialogOpen(true)
	}

	const activeImage = useMemo(() => {
		return allImages?.find((image) => image.id_images === selectedImage)
	}, [allImages, selectedImage])

	const handleDelete = (zoneId: number) => {
		console.log('delete', zoneId)
	}

	const handleEdit = (zone: UpsertZone) => {
		console.log('edit', zone)
	}

	useEffect(() => {
		if (allImages && allImages.length !== 0) {
			setSelectedImage(allImages[0].id_images)
		}
	}, [allImages])

	useEffect(() => {
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
		if (activeImage && canvasRef.current) {
			const canvas = canvasRef.current
			const context = canvas.getContext('2d')
			if (!context) return

			canvas.width = activeImage.data.width
			canvas.height = activeImage.data.height

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

				zones.forEach((zone) => {
					if (zone.id_images !== selectedImage) return

					zone.coordinates.points.forEach((point) => {
						context.beginPath()
						context.arc(point.x, point.y, 5, 0, 2 * Math.PI)
						context.fillStyle = zone.coordinates?.color ?? DEFAULT_COLOR
						context.fill()
					})
				})
			}
		}
	}, [activeImage, path, selectedImage, zones])

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
					<div className='flex flex-row items-center gap-x-2'>
						<Select
							value={selectedImage?.toString() ?? undefined}
							onValueChange={(value) => setSelectedImage(Number(value))}
						>
							<SelectTrigger className='w-80'>
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
					</div>
				</div>
				{/* Canvas container with overflow settings */}
				<div
					className='h-full max-h-[550px] w-full overflow-auto rounded-lg border border-primary p-1.5'
					style={{
						maxWidth: activeImage?.data?.width ?? '100%',
					}}
				>
					<canvas
						onClick={handleCanvasClick}
						className='cursor-pointer'
						ref={canvasRef}
					/>
				</div>
			</div>

			<ZoneList
				onDelete={handleDelete}
				onEdit={handleEdit}
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
