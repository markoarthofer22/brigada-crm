import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProjectDetails } from '@/api/services/projects/schema.ts'
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
	hasNoActiveLayout: boolean
}

const ZoneLayout = ({
	zones,
	allImages,
	path,
	hasNoActiveLayout,
	projectId,
}: ZoneLayoutProps) => {
	const { t } = useTranslation()
	const [selectedImage, setSelectedImage] = useState<number | null>(null)

	interface Zone {
		x: number
		y: number
	}
	const [localZones, setLocalZones] = useState<Zone[]>([])
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!canvasRef.current) return
		const rect = canvasRef.current.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top
		alert(`Coordinates: (${x}, ${y})`)
		// open modal. Add name, add color and coordis
		setLocalZones((prevZones) => [...prevZones, { x, y }])
	}

	useEffect(() => {
		if (allImages && allImages.length !== 0) {
			setSelectedImage(allImages[0].id_images)
		}
	}, [allImages])

	const activeImage = useMemo(() => {
		return allImages?.find((image) => image.id_images === selectedImage)
	}, [allImages, selectedImage])

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

	// Update the canvas when the active image changes.
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
				// Clear canvas and draw the image at its original size.
				context.clearRect(0, 0, canvas.width, canvas.height)
				context.drawImage(
					img,
					0,
					0,
					activeImage.data.width,
					activeImage.data.height
				)

				localZones.forEach((zone) => {
					context.beginPath()
					context.arc(zone.x, zone.y, 5, 0, 2 * Math.PI)
					context.fillStyle = 'red'
					context.fill()
				})
			}
		}
	}, [activeImage, localZones, path])

	return (
		<div>
			<div className='mb-4 mt-6 flex flex-col items-start space-y-2'>
				<p className='text-sm font-medium'>{t('ProjectDetails.selectImage')}</p>
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
								<SelectItem key={image.id_images} value={`${image.id_images}`}>
									{image.data.file_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			{/* Canvas container with overflow settings */}
			<div className='h-full max-h-[400px] w-full overflow-auto border border-primary'>
				<canvas
					onClick={handleCanvasClick}
					className='cursor-pointer'
					ref={canvasRef}
				/>
			</div>
		</div>
	)
}

export default ZoneLayout
