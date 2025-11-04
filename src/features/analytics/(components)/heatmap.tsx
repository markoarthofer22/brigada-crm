'use client'

import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	IconDownload,
	IconMinus,
	IconPlus,
	IconRestore,
} from '@tabler/icons-react'
import h337 from 'heatmap.js'
import { useTranslation } from 'react-i18next'
import { hexToRgba } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

export interface Zone {
	id_zones: number
	name: string
	coordinates: {
		points: Array<{ x: number; y: number }>
		color?: string
	}
}

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
		number_of_people: number
	}
}

export interface FlowData {
	pathstring: string
	pathcsv: string
	path: Array<{
		name: string
		coordinates: {
			x: number
			y: number
			number_of_people: number
		}
	}>
	count: number
	percentage: number
	total_people: number
	total_visits: number
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
	zones: Zone[]
	selectedTrackingId: number | null
	setSelectedTrackingId: React.Dispatch<React.SetStateAction<number | null>>
	trackings?: any[]
	exportName?: string
	flowData?: FlowData[]
}

const INITIAL_ZOOM_LEVEL = 1
const MIN_ZOOM_LEVEL = 0.15
const MAX_ZOOM_LEVEL = 2
const CHANGE_ZOOM_STEP = 0.1

const ZONE_COLORS: Record<string, string> = {
	'Gondola 1': '#3b82f6', // bright blue
	'Gondola 2': '#a855f7', // bright purple
	'Gondola 3': '#ec4899', // bright pink
	'nova zona': '#10b981', // bright green
	Postament: '#f59e0b', // bright amber
	Izlog: '#ef4444', // bright red
	default: '#6366f1', // bright indigo
}

const getZoneColor = (zoneName: string): string => {
	return ZONE_COLORS[zoneName] || ZONE_COLORS.default
}

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
	exportName,
	flowData = [],
}: HeatmapViewerProps) {
	const { t } = useTranslation()

	const containerRef = useRef<HTMLDivElement>(null)
	const imageCanvasRef = useRef<HTMLCanvasElement>(null)
	const heatmapContainerRef = useRef<HTMLDivElement>(null)
	const debugCanvasRef = useRef<HTMLCanvasElement>(null)
	const zonesCanvasRef = useRef<HTMLCanvasElement>(null)
	const flowCanvasRef = useRef<HTMLCanvasElement>(null)
	const heatmapInstanceRef = useRef<any>(null) // Store heatmap instance in ref to reuse
	const initialZoomRef = useRef<number | null>(null)
	const [zoomLevel, setZoomLevel] = useState<number>(INITIAL_ZOOM_LEVEL)
	const [heatmapMode, setHeatmapMode] = useState<'time' | 'people'>('time')
	const [showFlowData, setShowFlowData] = useState<boolean>(true)
	const [hoveredZone, setHoveredZone] = useState<{
		name: string
		x: number
		y: number
		pointCount: number
		totalHeat: number
		avgHeat: number
		number_of_people: number
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
				: getZoneColor(zone.name)
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

	const drawFlowArrows = useCallback(
		(ctx: CanvasRenderingContext2D, scale = 1) => {
			const drawCurvedArrow = (
				fromX: number,
				fromY: number,
				toX: number,
				toY: number,
				curvature: number,
				color: string,
				label: string
			) => {
				const midX = (fromX + toX) / 2
				const midY = (fromY + toY) / 2

				const dx = toX - fromX
				const dy = toY - fromY
				const dist = Math.sqrt(dx * dx + dy * dy)
				const perpX = -dy / dist
				const perpY = dx / dist

				const controlX = midX + perpX * curvature
				const controlY = midY + perpY * curvature

				// Draw curved line
				ctx.beginPath()
				ctx.moveTo(fromX, fromY)
				ctx.quadraticCurveTo(controlX, controlY, toX, toY)
				ctx.strokeStyle = color
				ctx.lineWidth = 16 * scale
				ctx.setLineDash([20 * scale, 10 * scale])
				ctx.stroke()
				ctx.setLineDash([])

				const arrowSize = 36 * scale
				const angle = Math.atan2(toY - controlY, toX - controlX)

				ctx.beginPath()
				ctx.moveTo(toX, toY)
				ctx.lineTo(
					toX - arrowSize * Math.cos(angle - Math.PI / 6),
					toY - arrowSize * Math.sin(angle - Math.PI / 6)
				)
				ctx.lineTo(
					toX - arrowSize * Math.cos(angle + Math.PI / 6),
					toY - arrowSize * Math.sin(angle + Math.PI / 6)
				)
				ctx.closePath()
				ctx.fillStyle = color
				ctx.fill()

				// Calculate actual midpoint of quadratic bezier curve at t=0.5
				const t = 0.5
				const labelX =
					(1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * controlX + t * t * toX
				const labelY =
					(1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * controlY + t * t * toY

				// Draw label with better readability
				ctx.font = `bold ${32 * scale}px sans-serif`
				const textMetrics = ctx.measureText(label)
				const padding = 16 * scale
				const bgWidth = textMetrics.width + padding * 2
				const bgHeight = 48 * scale

				// Fully opaque white background
				ctx.fillStyle = 'rgba(255, 255, 255, 1)'
				ctx.fillRect(
					labelX - bgWidth / 2,
					labelY - bgHeight / 2,
					bgWidth,
					bgHeight
				)

				// Thick colored border
				ctx.strokeStyle = color
				ctx.lineWidth = 5 * scale
				ctx.strokeRect(
					labelX - bgWidth / 2,
					labelY - bgHeight / 2,
					bgWidth,
					bgHeight
				)

				// Black text with white outline for maximum contrast
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'

				// White outline
				ctx.strokeStyle = 'white'
				ctx.lineWidth = 6 * scale
				ctx.strokeText(label, labelX, labelY)

				// Black text
				ctx.fillStyle = 'black'
				ctx.fillText(label, labelX, labelY)
			}

			const flowMap = new Map<string, FlowData[]>()
			flowData.forEach((flow) => {
				if (flow.path.length < 2) return
				for (let i = 0; i < flow.path.length - 1; i++) {
					const from = flow.path[i]
					const to = flow.path[i + 1]
					const key = `${from.name}→${to.name}`
					if (!flowMap.has(key)) {
						flowMap.set(key, [])
					}
					flowMap.get(key)!.push(flow)
				}
			})

			const drawnConnections = new Set<string>()

			// Draw forward directions
			flowData.forEach((flow) => {
				if (flow.path.length < 2) return

				for (let i = 0; i < flow.path.length - 1; i++) {
					const from = flow.path[i]
					const to = flow.path[i + 1]

					const forwardKey = `${from.name}→${to.name}`
					const reverseKey = `${to.name}→${from.name}`

					if (drawnConnections.has(forwardKey)) continue
					drawnConnections.add(forwardKey)

					const hasReverse = flowMap.has(reverseKey)
					const curvature = hasReverse ? 120 : 100
					const color = getZoneColor(from.name)
					const label = t('Analytics.flow.totalPeopleLabel', {
						value: flow.total_people,
					})

					drawCurvedArrow(
						from.coordinates.x,
						from.coordinates.y,
						to.coordinates.x,
						to.coordinates.y,
						curvature,
						color,
						label
					)
				}
			})

			// Draw reverse directions
			flowData.forEach((flow) => {
				if (flow.path.length < 2) return

				for (let i = 0; i < flow.path.length - 1; i++) {
					const from = flow.path[i]
					const to = flow.path[i + 1]

					const forwardKey = `${from.name}→${to.name}`
					const reverseKey = `${to.name}→${from.name}`

					if (drawnConnections.has(reverseKey) || !flowMap.has(reverseKey))
						continue

					const hasForward = flowMap.has(forwardKey)
					if (!hasForward) continue

					drawnConnections.add(reverseKey)

					const curvature = -120
					const color = getZoneColor(from.name)
					const reverseFlows = flowMap.get(reverseKey)!
					const totalPeople = reverseFlows.reduce(
						(sum, f) => sum + f.total_people,
						0
					)
					const label = t('Analytics.flow.totalPeopleLabel', {
						value: totalPeople,
					})

					drawCurvedArrow(
						from.coordinates.x,
						from.coordinates.y,
						to.coordinates.x,
						to.coordinates.y,
						curvature,
						color,
						label
					)
				}
			})
		},
		[flowData, t]
	)

	useEffect(() => {
		if (!heatmapContainerRef.current || heatmaps.length === 0) return

		const container = heatmapContainerRef.current
		container.style.width = `${width * zoomLevel}px`
		container.style.height = `${height * zoomLevel}px`

		// Clean up existing heatmap instance
		if (heatmapInstanceRef.current) {
			const existingCanvas = container.querySelector('canvas')
			if (existingCanvas) {
				existingCanvas.remove()
			}
			heatmapInstanceRef.current = null
		}

		// Create new heatmap instance
		try {
			heatmapInstanceRef.current = h337.create({
				container: container,
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

			const max =
				maxValue ||
				Math.max(
					...heatmaps.map((h) =>
						heatmapMode === 'people' ? h.heat.number_of_people : h.heat.value
					),
					1
				)
			const data = heatmaps.map((item) => ({
				x: Math.round(item.heat.x * zoomLevel),
				y: Math.round(item.heat.y * zoomLevel),
				value:
					heatmapMode === 'people'
						? item.heat.number_of_people
						: item.heat.value,
			}))

			if (data.length > 0) {
				heatmapInstanceRef.current.setData({ min: 0, max, data })
			}
		} catch (error) {
			console.error('[v0] Heatmap rendering error:', error)
		}

		return () => {
			if (heatmapInstanceRef.current) {
				const canvas = container.querySelector('canvas')
				if (canvas) {
					canvas.remove()
				}
				heatmapInstanceRef.current = null
			}
		}
	}, [heatmaps, maxValue, radius, blur, width, height, zoomLevel, heatmapMode])

	useEffect(() => {
		if (!showFlowData || !flowData.length || !flowCanvasRef.current) return

		const canvas = flowCanvasRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.width = width * zoomLevel
		canvas.height = height * zoomLevel

		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.save()
		ctx.scale(zoomLevel, zoomLevel)
		drawFlowArrows(ctx, 1)
		ctx.restore()
	}, [showFlowData, flowData, width, height, zoomLevel, drawFlowArrows])

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
				const number_of_people = zonePoints.reduce(
					(sum, point) => sum + point.heat.number_of_people,
					0
				)
				const avgHeat =
					zonePoints.length > 0 ? totalHeat / zonePoints.length : 0

				setHoveredZone({
					name: zone.name,
					x: e.clientX - rect.left + scrollLeft,
					y: e.clientY - rect.top + scrollTop,
					pointCount: zonePoints.length,
					totalHeat: parseFloat(totalHeat.toFixed(2)),
					avgHeat: parseFloat(avgHeat.toFixed(2)),
					number_of_people: number_of_people,
					// avgHeat: Math.round(avgHeat * 10) / 10,
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

		if (hoveredZone.y + ESTIMATED_TOOLTIP_HEIGHT > containerHeight) {
			top = hoveredZone.y - ESTIMATED_TOOLTIP_HEIGHT - TOOLTIP_OFFSET
		}

		if (hoveredZone.x + ESTIMATED_TOOLTIP_WIDTH > containerWidth) {
			left = hoveredZone.x - ESTIMATED_TOOLTIP_WIDTH - TOOLTIP_OFFSET
		}

		return { left, top }
	}

	const exportAsImage = useCallback(() => {
		const exportCanvas = document.createElement('canvas')
		exportCanvas.width = width
		exportCanvas.height = height
		const ctx = exportCanvas.getContext('2d')
		if (!ctx) return

		if (backgroundImage) {
			const img = new Image()
			img.src = backgroundImage
			img.onload = () => {
				ctx.filter = 'grayscale(100%)'
				ctx.drawImage(img, 0, 0, width, height)
				ctx.filter = 'none'

				const heatmapCanvas =
					heatmapContainerRef.current?.querySelector('canvas')
				if (heatmapCanvas) {
					ctx.drawImage(heatmapCanvas, 0, 0, width, height)
				}

				if (zones.length > 0) {
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
							: getZoneColor(zone.name)
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
				}

				if (showFlowData && flowData.length > 0) {
					drawFlowArrows(ctx, 1)
				}

				exportCanvas.toBlob((blob) => {
					if (!blob) return
					const url = URL.createObjectURL(blob)
					const link = document.createElement('a')
					link.href = url
					link.download = exportName ?? `heatmap-${exportName}.png`
					link.click()
					URL.revokeObjectURL(url)
				}, 'image/png')
			}
		}
	}, [
		width,
		height,
		backgroundImage,
		zones,
		exportName,
		flowData,
		drawFlowArrows,
		showFlowData,
	])

	return (
		<>
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
						<SelectTrigger className='h-8 w-[200px] text-xs font-medium lg:w-[380px]'>
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
					<Select
						value={heatmapMode}
						onValueChange={(value: 'time' | 'people') => setHeatmapMode(value)}
					>
						<SelectTrigger className='h-8 w-[150px] text-xs font-medium'>
							<SelectValue placeholder={t('Analytics.heatmap.showBy')} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='time'>
								{t('Analytics.heatmap.time')}
							</SelectItem>
							<SelectItem value='people'>
								{t('Analytics.heatmap.people')}
							</SelectItem>
						</SelectContent>
					</Select>
					<div className='flex items-center gap-2'>
						<Checkbox
							id='show-flow'
							checked={showFlowData}
							onCheckedChange={(checked) => setShowFlowData(checked === true)}
						/>
						<Label
							htmlFor='show-flow'
							className='cursor-pointer text-xs font-medium'
						>
							{t('Analytics.heatmap.showFlow')}
						</Label>
					</div>
					<Button
						variant='outline'
						size='sm'
						onClick={exportAsImage}
						className='gap-2 bg-transparent'
					>
						<IconDownload className='h-4 w-4' />
						{t('Analytics.heatmap.export')}
					</Button>
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
					{showFlowData && flowData.length > 0 && (
						<canvas
							ref={flowCanvasRef}
							className='pointer-events-none absolute inset-0 z-30'
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
									<span>{t('Analytics.heatmap.people2')}</span>
									<span className='font-medium text-white'>
										{hoveredZone.number_of_people}
									</span>
								</div>
								<div className='flex justify-between gap-4'>
									<span>{t('Analytics.heatmap.time2')}</span>
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

			{showFlowData && flowData.length > 0 && (
				<div className='mt-8'>
					<h3 className='mb-4 text-xl font-semibold'>
						{t('Analytics.flow.title')}
					</h3>
					<div className='space-y-4'>
						{flowData.map((flow, index) => (
							<div
								key={index}
								className='rounded-lg border border-border bg-card p-4 shadow-sm'
							>
								<div className='mb-2 flex items-center justify-between'>
									<h4
										className='text-lg font-semibold'
										style={{ color: getZoneColor(flow.path[0]?.name || '') }}
									>
										{flow.pathstring}
									</h4>
								</div>
								<div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
									<div>
										<span className='text-muted-foreground'>
											{t('Analytics.total')}:
										</span>
										<span className='ml-2 font-semibold'>{flow.count}</span>
									</div>
									<div>
										<span className='text-muted-foreground'>
											{t('Analytics.totalPeople')}:
										</span>
										<span className='ml-2 font-semibold'>
											{flow.total_people}
										</span>
									</div>
									<div>
										<span className='text-muted-foreground'>
											{t('Analytics.people')}:
										</span>
										<span className='ml-2 font-semibold'>
											{flow.total_visits}
										</span>
									</div>
									<div>
										<span className='text-muted-foreground'>
											{t('Analytics.percentage')}:
										</span>
										<span className='ml-2 font-semibold'>
											{flow.percentage}%
										</span>
									</div>
								</div>
								<div className='mt-3 flex flex-wrap gap-2'>
									{flow.path.map((zone, zoneIndex) => (
										<div
											key={zoneIndex}
											className='flex items-center gap-2 rounded-md border px-3 py-1 text-sm'
											style={{ borderColor: getZoneColor(zone.name) }}
										>
											<span className='font-medium'>{zone.name}</span>
											<span className='text-muted-foreground'>
												(
												{t('Analytics.flow.totalPeopleLabel', {
													value: zone.coordinates.number_of_people,
												})}
												)
											</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</>
	)
}
