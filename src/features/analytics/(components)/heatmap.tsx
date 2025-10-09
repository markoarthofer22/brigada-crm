'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconMinus, IconPlus, IconRestore } from '@tabler/icons-react'
import h337 from 'heatmap.js'
import { useTranslation } from 'react-i18next'
import type { ProjectDetails } from '@/api/services/projects/schema.ts'
import { hexToRgba } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'

export interface HeatmapData {
	id_tracking_zones: number
	id_zones: number
	id_tracking: number
	id_projects: number
	data: string
	started_at: string
	ended_at: string
	name: string
	heat: {
		x: number
		y: number
		value: number
	}
}

export interface HeatmapViewerProps {
	heatmaps: HeatmapData[]
	backgroundImage?: string
	width?: number
	height?: number
	maxValue?: number
	radius?: number
	blur?: number
	showDebugPoints?: boolean
	zones: ProjectDetails['zones']
	selectedTrackingId: number | null
	setSelectedTrackingId: React.Dispatch<React.SetStateAction<number | null>>
	trackings?: any[]
}

const INITIAL_ZOOM_LEVEL = 1
const MIN_ZOOM_LEVEL = 0.15
const MAX_ZOOM_LEVEL = 2
const CHANGE_ZOOM_STEP = 0.1

export function HeatmapViewer({
	heatmaps,
	backgroundImage,
	width = 800,
	height = 600,
	maxValue,
	radius = 25,
	blur = 0.6,
	showDebugPoints = false,
	zones = [],
	selectedTrackingId,
	setSelectedTrackingId,
	trackings = [],
}: HeatmapViewerProps) {
	const { t } = useTranslation()

	const containerRef = useRef<HTMLDivElement>(null)
	const imageCanvasRef = useRef<HTMLCanvasElement>(null)
	const heatmapContainerRef = useRef<HTMLDivElement>(null)
	const debugCanvasRef = useRef<HTMLCanvasElement>(null)
	const zonesCanvasRef = useRef<HTMLCanvasElement>(null)
	const initialZoomRef = useRef<number | null>(null)
	const [zoomLevel, setZoomLevel] = useState<number>(INITIAL_ZOOM_LEVEL)
	const [hoveredZone, setHoveredZone] = useState<{
		name: string
		x: number
		y: number
		pointCount: number
		totalHeat: number
		avgHeat: number
	} | null>(null)

	const findAllHeatMapPointsForZone = (zoneId: number) => {
		return heatmaps.filter((h) => h.id_zones === zoneId)
	}

	const trackingOptions = useMemo(() => {
		return trackings.map((tracking: any) => ({
			id: tracking.id_tracking,
			name: t('Table.trackingName', { value: tracking.id_tracking }),
		}))
	}, [t, trackings])

	useEffect(() => {
		if (!containerRef.current || width === 0) return

		const containerWidth = containerRef.current.clientWidth
		const fitZoom = containerWidth / width

		if (initialZoomRef.current === null) {
			initialZoomRef.current = fitZoom
			setZoomLevel(Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, fitZoom)))
		}
	}, [width])

	const handleImageCanvasRender = useCallback(() => {
		if (!backgroundImage || !imageCanvasRef.current) return

		const canvas = imageCanvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.width = width * zoomLevel
		canvas.height = height * zoomLevel

		const img = new Image()
		img.src = backgroundImage
		img.onload = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.scale(zoomLevel, zoomLevel)
			ctx.drawImage(img, 0, 0, width, height)
		}
	}, [backgroundImage, width, height, zoomLevel])

	useEffect(() => {
		handleImageCanvasRender()
	}, [handleImageCanvasRender])

	useEffect(() => {
		if (!showDebugPoints || !debugCanvasRef.current) return

		const canvas = debugCanvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.width = width * zoomLevel
		canvas.height = height * zoomLevel

		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.scale(zoomLevel, zoomLevel)

		heatmaps.forEach((item, index) => {
			const x = item.heat.x
			const y = item.heat.y

			ctx.beginPath()
			ctx.arc(x, y, 3, 0, 2 * Math.PI)
			ctx.fillStyle = 'rgba(255, 0, 255, 0.8)'
			ctx.fill()
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
			ctx.lineWidth = 1
			ctx.stroke()

			ctx.fillStyle = 'white'
			ctx.font = '10px sans-serif'
			ctx.fillText(`${index + 1}`, x + 5, y - 5)
		})
	}, [heatmaps, width, height, zoomLevel, showDebugPoints])

	useEffect(() => {
		if (!zones.length || !zonesCanvasRef.current) return

		const canvas = zonesCanvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.width = width * zoomLevel
		canvas.height = height * zoomLevel

		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.scale(zoomLevel, zoomLevel)

		zones.forEach((zone) => {
			const points = zone.coordinates.points
			if (points.length < 3) return

			points.forEach((point) => {
				ctx.beginPath()
				ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
				ctx.fillStyle = 'black'
				ctx.fill()
			})

			ctx.beginPath()
			ctx.moveTo(points[0].x, points[0].y)
			for (let i = 1; i < points.length; i++) {
				ctx.lineTo(points[i].x, points[i].y)
			}
			ctx.closePath()

			ctx.fillStyle = zone?.coordinates?.color
				? hexToRgba(zone?.coordinates?.color, 0.3)
				: 'rgba(180, 180, 180, 0.6)'
			ctx.fill()

			ctx.strokeStyle = 'black'
			ctx.lineWidth = 4
			ctx.stroke()

			const center = points.reduce(
				(acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
				{ x: 0, y: 0 }
			)
			center.x /= points.length
			center.y /= points.length

			ctx.font = '20px sans-serif'
			ctx.fillStyle = 'black'
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.fillText(zone.name, center.x, center.y)
		})
	}, [zones, width, height, zoomLevel])

	useEffect(() => {
		if (!heatmapContainerRef.current) return

		heatmapContainerRef.current.style.width = `${width * zoomLevel}px`
		heatmapContainerRef.current.style.height = `${height * zoomLevel}px`

		const heatmapInstance = h337.create({
			container: heatmapContainerRef.current,
			radius: radius * zoomLevel,
			maxOpacity: 0.8,
			minOpacity: 0.1,
			blur: blur,
			gradient: {
				0.0: 'rgba(0, 0, 255, 0.3)',
				0.25: 'cyan',
				0.5: 'lime',
				0.75: 'yellow',
				1.0: 'red',
			},
		})

		const max = maxValue || Math.max(...heatmaps.map((h) => h.heat.value))
		const data = heatmaps.map((item) => ({
			x: Math.round(item.heat.x * zoomLevel),
			y: Math.round(item.heat.y * zoomLevel),
			value: item.heat.value,
		}))

		heatmapInstance.setData({ min: 0, max, data })

		return () => {
			const canvas = heatmapContainerRef.current?.querySelector('canvas')
			if (canvas && canvas.parentElement) {
				canvas.remove()
			}
		}
	}, [heatmaps, maxValue, radius, blur, width, height, zoomLevel])

	const handleZoom = (direction: 'in' | 'out') => {
		setZoomLevel((prev) => {
			const initial = initialZoomRef.current
			if (!initial) return prev
			const delta = direction === 'in' ? CHANGE_ZOOM_STEP : -CHANGE_ZOOM_STEP

			if (
				(direction === 'out' &&
					prev > initial &&
					prev - initial < CHANGE_ZOOM_STEP) ||
				(direction === 'in' &&
					prev < initial &&
					initial - prev < CHANGE_ZOOM_STEP)
			) {
				return initial
			}

			const newZoom = Math.round((prev + delta) * 10) / 10
			return Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, newZoom))
		})
	}

	const resetZoom = () => {
		if (initialZoomRef.current) {
			setZoomLevel(initialZoomRef.current)
		}
	}

	const isPointInPolygon = (
		point: { x: number; y: number },
		polygon: { x: number; y: number }[]
	) => {
		let inside = false
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const xi = polygon[i].x
			const yi = polygon[i].y
			const xj = polygon[j].x
			const yj = polygon[j].y

			const intersect =
				yi > point.y !== yj > point.y &&
				point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
			if (intersect) inside = !inside
		}
		return inside
	}

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!containerRef.current || zones.length === 0) return

		const rect = containerRef.current.getBoundingClientRect()
		const scrollLeft = containerRef.current.scrollLeft
		const scrollTop = containerRef.current.scrollTop

		const mouseX = (e.clientX - rect.left + scrollLeft) / zoomLevel
		const mouseY = (e.clientY - rect.top + scrollTop) / zoomLevel

		for (const zone of zones) {
			if (isPointInPolygon({ x: mouseX, y: mouseY }, zone.coordinates.points)) {
				const zonePoints = findAllHeatMapPointsForZone(zone.id_zones)
				const totalHeat = zonePoints.reduce(
					(sum, point) => sum + point.heat.value,
					0
				)
				const avgHeat =
					zonePoints.length > 0 ? totalHeat / zonePoints.length : 0

				setHoveredZone({
					name: zone.name,
					x: e.clientX - rect.left + scrollLeft,
					y: e.clientY - rect.top + scrollTop,
					pointCount: zonePoints.length,
					totalHeat: Math.round(totalHeat),
					avgHeat: Math.round(avgHeat * 10) / 10,
				})
				return
			}
		}

		setHoveredZone(null)
	}

	const handleMouseLeave = () => {
		setHoveredZone(null)
	}

	const getTooltipPosition = () => {
		if (!hoveredZone || !containerRef.current) return { left: 0, top: 0 }

		const TOOLTIP_OFFSET = 10
		const ESTIMATED_TOOLTIP_HEIGHT = 120
		const ESTIMATED_TOOLTIP_WIDTH = 200

		const containerRect = containerRef.current.getBoundingClientRect()
		const containerHeight = containerRect.height
		const containerWidth = containerRect.width

		let left = hoveredZone.x + TOOLTIP_OFFSET
		let top = hoveredZone.y + TOOLTIP_OFFSET

		// Check if tooltip would overflow bottom - if so, position above cursor
		if (hoveredZone.y + ESTIMATED_TOOLTIP_HEIGHT > containerHeight) {
			top = hoveredZone.y - ESTIMATED_TOOLTIP_HEIGHT - TOOLTIP_OFFSET
		}

		// Check if tooltip would overflow right edge - if so, position to the left
		if (hoveredZone.x + ESTIMATED_TOOLTIP_WIDTH > containerWidth) {
			left = hoveredZone.x - ESTIMATED_TOOLTIP_WIDTH - TOOLTIP_OFFSET
		}

		return { left, top }
	}

	return (
		<div className='relative'>
			<div className='mb-6 flex items-center gap-4'>
				<Select
					value={selectedTrackingId ? String(selectedTrackingId) : undefined}
					onValueChange={(value) => {
						setSelectedTrackingId(
							value ? (value === 'none' ? null : Number(value)) : null
						)
					}}
				>
					<SelectTrigger className='h-8 w-[200px] lg:w-[380px]'>
						<SelectValue placeholder={t('Table.selectTracking')} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='none'>{t('Table.allTrackings')}</SelectItem>
						{trackingOptions.map((option) => (
							<SelectItem key={option.id} value={String(option.id)}>
								{option.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div
				ref={containerRef}
				className='relative h-[550px] w-full overflow-auto rounded-lg border border-primary'
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
			>
				{backgroundImage && (
					<canvas
						ref={imageCanvasRef}
						className='absolute inset-0 z-[-1] grayscale'
					/>
				)}
				<div
					ref={heatmapContainerRef}
					className='pointer-events-none z-20 rounded-lg'
				/>
				{zones.length > 0 && (
					<canvas
						ref={zonesCanvasRef}
						className='pointer-events-none absolute inset-0'
					/>
				)}
				{showDebugPoints && (
					<canvas
						ref={debugCanvasRef}
						className='pointer-events-none absolute inset-0 z-10'
					/>
				)}
				{hoveredZone && (
					<div
						className='pointer-events-none absolute z-50 rounded-lg border border-white/20 bg-black/95 px-4 py-3 text-sm text-white shadow-xl'
						style={{
							left: `${getTooltipPosition().left}px`,
							top: `${getTooltipPosition().top}px`,
						}}
					>
						<div className='font-semibold text-white'>{hoveredZone.name}</div>
						<div className='mt-2 space-y-1 text-xs text-gray-300'>
							<div className='flex justify-between gap-4'>
								<span>{t('Analytics.heatmap.data')}</span>
								<span className='font-medium text-white'>
									{hoveredZone.pointCount}
								</span>
							</div>
							<div className='flex justify-between gap-4'>
								<span>{t('Analytics.heatmap.totalHeat')}</span>
								<span className='font-medium text-white'>
									{hoveredZone.totalHeat}
								</span>
							</div>
							<div className='flex justify-between gap-4'>
								<span>{t('Analytics.heatmap.avgHeat')}</span>
								<span className='font-medium text-white'>
									{hoveredZone.avgHeat}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className='absolute bottom-4 left-4 z-30 flex flex-col-reverse items-center gap-2 rounded-md bg-black/20'>
				<Button
					variant='outline'
					className='shadow-3xl z-10 size-10 border-2 border-primary bg-transparent p-0 shadow-black'
					onClick={resetZoom}
					aria-label='Reset to initial'
				>
					<IconRestore className='h-5 w-5' />
				</Button>
				<Button
					className='shadow-3xl z-10 size-10 border-2 border-primary bg-transparent p-0 shadow-black'
					variant='outline'
					onClick={() => handleZoom('out')}
					aria-label='Zoom out'
				>
					<IconMinus className='size-6' />
				</Button>
				<span className='text-base font-semibold'>
					{Math.round(zoomLevel * 100)}%
				</span>
				<Button
					variant='outline'
					className='shadow-3xl z-10 size-10 border-2 border-primary bg-transparent p-0 shadow-black'
					onClick={() => handleZoom('in')}
					aria-label='Zoom in'
				>
					<IconPlus className='size-6' />
				</Button>
			</div>
		</div>
	)
}
