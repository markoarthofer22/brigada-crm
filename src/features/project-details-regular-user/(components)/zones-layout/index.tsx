import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ProjectDetails } from '@/api/services/projects/schema.ts'
import { getContrastColor, hexToRgba } from '@/lib/utils.ts'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'

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
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const imageCanvasRef = useRef<HTMLCanvasElement>(null)

	const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!selectedImage || !projectId) {
			toast.error(t('ProjectDetails.selectImageFirst'))
			return
		}

		if (!canvasRef.current) return
		const rect = canvasRef.current.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top

		// eslint-disable-next-line
		console.log('x,y', x, y, trackingId)
	}

	const activeImage = useMemo(() => {
		return allImages?.find((image) => image.id_images === selectedImage)
	}, [allImages, selectedImage])

	const handleCanvasLineDraw = useCallback(
		(zone?: ProjectDetails['zones'][number]) => {
			const zones = zone

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
						context.fillStyle = hexToRgba(zones.coordinates.color, 0.4)
						context.fill()
					}
					context.strokeStyle = zones.coordinates.color
					context.lineWidth = 2
					context.stroke()
				}
			}
		},
		[]
	)

	const handleCanvasRender = useCallback(() => {
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
				context.fillStyle = zone.coordinates?.color
				context.fill()
			})

			// context.fillStyle = DEFAULT_COLOR
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
				context.fillStyle = getContrastColor(zone.coordinates?.color)
				context.textAlign = 'center'
				context.textBaseline = 'middle'
				context.fillText(zone.name, center.x, center.y)
			}
		})
	}, [activeImage, zones])

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

	return (
		<div className={className}>
			<div className='flex flex-col items-start space-y-6'>
				{!hideDropdown && (
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
							<SelectTrigger className='w-full max-w-[500px]'>
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
				)}
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
	)
}

export default ZonesLayoutRegularUser
