'use client'

import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	IconDownload,
	IconMinus,
	IconPlus,
	IconRestore,
} from '@tabler/icons-react'
import * as d3 from 'd3'
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

export interface D3FlowNode {
	id: string
	value: number
	x: number
	y: number
}

export interface D3FlowLink {
	source: string
	target: string
	value: number
}

export interface D3FlowData {
	nodes: D3FlowNode[]
	links: D3FlowLink[]
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
	zonesPathsInDepthD3?: D3FlowData
}

const INITIAL_ZOOM_LEVEL = 1
const MIN_ZOOM_LEVEL = 0.15
const MAX_ZOOM_LEVEL = 2
const CHANGE_ZOOM_STEP = 0.1

const CHART_COLORS = [
	'#A02214',
	'#BC5D28',
	'#FEC87C',
	'#6E2405',
	'#6C7039',
	'#C3B49B',
	'#0A3542',
	'#507282',
	'#875A64',
	'#C49A6C',
]

const getZoneColor = (zoneId: string): string => {
	let hash = 0
	for (let i = 0; i < zoneId.length; i++) {
		hash = zoneId.charCodeAt(i) + ((hash << 5) - hash)
	}
	const index = Math.abs(hash) % CHART_COLORS.length
	return CHART_COLORS[index]
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
	zonesPathsInDepthD3,
}: HeatmapViewerProps) {
	const { t } = useTranslation()

	const containerRef = useRef<HTMLDivElement>(null)
	const imageCanvasRef = useRef<HTMLCanvasElement>(null)
	const heatmapContainerRef = useRef<HTMLDivElement>(null)
	const debugCanvasRef = useRef<HTMLCanvasElement>(null)
	const zonesCanvasRef = useRef<HTMLCanvasElement>(null)
	const d3FlowSvgRef = useRef<SVGSVGElement>(null)
	const heatmapInstanceRef = useRef<any>(null)
	const initialZoomRef = useRef<number | null>(null)
	const [zoomLevel, setZoomLevel] = useState<number>(INITIAL_ZOOM_LEVEL)
	const [heatmapMode, setHeatmapMode] = useState<'time' | 'people'>('time')
	const [showFlowData, setShowFlowData] = useState<boolean>(true)
	const [selectedFlowNode, setSelectedFlowNode] = useState<string | null>(null)
	const [hoveredLink, setHoveredLink] = useState<{
		source: string
		target: string
		value: number
		x: number
		y: number
	} | null>(null)
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

			ctx.font = '32px sans-serif'
			ctx.fillStyle = 'black'
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.fillText(zone.name, center.x, center.y)
		})
	}, [zones, width, height, zoomLevel])

	useEffect(() => {
		if (!showFlowData || !d3FlowSvgRef.current) return

		const hasD3Data =
			zonesPathsInDepthD3 && zonesPathsInDepthD3.nodes.length > 0
		const hasFlowData = flowData.length > 0

		if (!hasD3Data && !hasFlowData) return

		const svg = d3.select(d3FlowSvgRef.current)
		svg.selectAll('*').remove()

		svg.attr('width', width * zoomLevel).attr('height', height * zoomLevel)

		const g = svg.append('g').attr('transform', `scale(${zoomLevel})`)

		let nodes: D3FlowNode[] = []
		let linksArray: D3FlowLink[] = []

		if (hasD3Data) {
			nodes = zonesPathsInDepthD3.nodes
			linksArray = zonesPathsInDepthD3.links
		} else {
			const nodesMap = new Map<string, D3FlowNode>()

			flowData.forEach((flow) => {
				flow.path.forEach((zone) => {
					if (!nodesMap.has(zone.name)) {
						nodesMap.set(zone.name, {
							id: zone.name,
							x: zone.coordinates.x,
							y: zone.coordinates.y,
							value: zone.coordinates.number_of_people,
						})
					}
				})

				for (let i = 0; i < flow.path.length - 1; i++) {
					const source = flow.path[i].name
					const target = flow.path[i + 1].name
					const existingLink = linksArray.find(
						(l) => l.source === source && l.target === target
					)
					if (existingLink) {
						existingLink.value += flow.path[i].coordinates.number_of_people
					} else {
						linksArray.push({
							source,
							target,
							value: flow.path[i].coordinates.number_of_people,
						})
					}
				}
			})

			nodes = Array.from(nodesMap.values())
		}

		nodes = nodes.filter((node) => {
			const isValid =
				typeof node.x === 'number' &&
				!isNaN(node.x) &&
				typeof node.y === 'number' &&
				!isNaN(node.y) &&
				typeof node.value === 'number' &&
				!isNaN(node.value) &&
				node.value > 0

			return isValid
		})

		const validNodeIds = new Set(nodes.map((n) => n.id))
		linksArray = linksArray.filter((link) => {
			const isValid =
				validNodeIds.has(link.source) && validNodeIds.has(link.target)
			if (!isValid) {
				console.warn('[v0] Filtering out invalid link:', link)
			}
			return isValid
		})

		if (nodes.length === 0 || linksArray.length === 0) {
			console.log('[v0] No valid nodes or links to display')
			return
		}

		const nodesMap = new Map<string, D3FlowNode>()
		nodes.forEach((node) => nodesMap.set(node.id, node))

		const defs = svg.append('defs')

		// Create markers for each size and color combination
		;['small', 'medium', 'large'].forEach((size) => {
			const markerWidth = size === 'small' ? 1.3 : size === 'medium' ? 1.5 : 1.8

			// Gray (default)
			defs
				.append('marker')
				.attr('id', `arrow-${size}-gray`)
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 10)
				.attr('refY', 0)
				.attr('markerWidth', markerWidth)
				.attr('markerHeight', markerWidth)
				.attr('orient', 'auto')
				.append('path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', '#94a3b8')

			// Green (outgoing from selected node)
			defs
				.append('marker')
				.attr('id', `arrow-${size}-green`)
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 10)
				.attr('refY', 0)
				.attr('markerWidth', markerWidth)
				.attr('markerHeight', markerWidth)
				.attr('orient', 'auto')
				.append('path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', '#10b981')

			// Red (incoming to selected node)
			defs
				.append('marker')
				.attr('id', `arrow-${size}-red`)
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 10)
				.attr('refY', 0)
				.attr('markerWidth', markerWidth)
				.attr('markerHeight', markerWidth)
				.attr('orient', 'auto')
				.append('path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', '#ef4444')
		})

		// const getConnectedLinks = (nodeId: string | null) => {
		// 	if (!nodeId) return new Set()
		// 	const connected = new Set<string>()
		// 	linksArray.forEach((link) => {
		// 		if (link.source === nodeId || link.target === nodeId) {
		// 			connected.add(`${link.source}-${link.target}`)
		// 		}
		// 	})
		// 	return connected
		// }

		const getConnectedNodes = (nodeId: string | null) => {
			if (!nodeId) return new Set()
			const connected = new Set([nodeId])
			linksArray.forEach((link) => {
				if (link.source === nodeId) connected.add(link.target)
				if (link.target === nodeId) connected.add(link.source)
			})
			return connected
		}

		// const connectedLinks = getConnectedLinks(selectedFlowNode)
		const connectedNodes = getConnectedNodes(selectedFlowNode)

		g.append('g')
			.selectAll('path')
			.data(linksArray)
			.enter()
			.append('path')
			.attr('d', (d) => {
				const sourceNode = nodesMap.get(d.source)
				const targetNode = nodesMap.get(d.target)
				if (!sourceNode || !targetNode) return ''

				const dx = targetNode.x - sourceNode.x
				const dy = targetNode.y - sourceNode.y
				const distance = Math.sqrt(dx * dx + dy * dy)

				// Safety check for zero or very small distance
				if (distance < 1) {
					return '' // Don't draw if nodes are too close
				}

				// Calculate curve offset (15% of distance)
				const curveOffset = distance * 0.15

				// Calculate perpendicular offset for the control point
				const midX = (sourceNode.x + targetNode.x) / 2
				const midY = (sourceNode.y + targetNode.y) / 2
				const perpX = (-dy / distance) * curveOffset
				const perpY = (dx / distance) * curveOffset

				const angle = Math.atan2(dy, dx)
				const sourceRadius = Math.pow(sourceNode.value, 0.85) * 5
				const targetRadius = Math.pow(targetNode.value, 0.85) * 5
				const strokeWidth = 2 // Use fixed stroke width for calculation

				// Add extra gap for arrow visibility (10 pixels)
				const arrowGap = 10

				const x1 =
					sourceNode.x + (sourceRadius + strokeWidth / 2) * Math.cos(angle)
				const y1 =
					sourceNode.y + (sourceRadius + strokeWidth / 2) * Math.sin(angle)
				const x2 =
					targetNode.x -
					(targetRadius + strokeWidth / 2 + arrowGap) * Math.cos(angle)
				const y2 =
					targetNode.y -
					(targetRadius + strokeWidth / 2 + arrowGap) * Math.sin(angle)

				// Control point for quadratic curve
				const cx = midX + perpX
				const cy = midY + perpY

				// Final safety check
				if (
					isNaN(x1) ||
					isNaN(y1) ||
					isNaN(x2) ||
					isNaN(y2) ||
					isNaN(cx) ||
					isNaN(cy)
				) {
					return '' // Don't draw if any coordinate is invalid
				}

				return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`
			})
			.attr('stroke', (d) => {
				if (!selectedFlowNode) return '#94a3b8' // gray default
				// Green if outgoing from selected node, red if incoming to selected node
				if (d.source === selectedFlowNode) return '#10b981' // green for outgoing
				if (d.target === selectedFlowNode) return '#ef4444' // red for incoming
				return '#94a3b8' // gray for unrelated
			})
			.attr('stroke-width', (d) => {
				const baseWidth = Math.pow(d.value, 1.2) * 1.5 // Reduced from 3 to 1.5
				if (!selectedFlowNode) return baseWidth
				const isConnected =
					d.source === selectedFlowNode || d.target === selectedFlowNode
				return isConnected ? baseWidth * 1.5 : baseWidth // Reduced multiplier from 1.8 to 1.5
			})
			.attr('fill', 'none')
			.attr('marker-end', (d) => {
				const sizeMarker =
					d.value >= 5 ? 'large' : d.value >= 3 ? 'medium' : 'small'

				if (!selectedFlowNode) return `url(#arrow-${sizeMarker}-gray)`

				if (d.source === selectedFlowNode)
					return `url(#arrow-${sizeMarker}-green)` // outgoing
				if (d.target === selectedFlowNode)
					return `url(#arrow-${sizeMarker}-red)` // incoming

				return `url(#arrow-${sizeMarker}-gray)`
			})
			.attr('opacity', (d) => {
				if (!selectedFlowNode) return 0.7
				const isConnected =
					d.source === selectedFlowNode || d.target === selectedFlowNode
				return isConnected ? 0.95 : 0.15
			})
			.style('cursor', 'pointer')
			.on('mouseenter', function (_event, d) {
				const sourceNode = nodesMap.get(d.source)
				const targetNode = nodesMap.get(d.target)
				if (!sourceNode || !targetNode) return

				// Calculate midpoint of the curve for tooltip positioning
				const dx = targetNode.x - sourceNode.x
				const dy = targetNode.y - sourceNode.y
				const distance = Math.sqrt(dx * dx + dy * dy)
				const curveOffset = distance * 0.15
				const midX = (sourceNode.x + targetNode.x) / 2
				const midY = (sourceNode.y + targetNode.y) / 2
				const perpX = (-dy / distance) * curveOffset
				const perpY = (dx / distance) * curveOffset

				// Get screen coordinates
				const svg = d3FlowSvgRef.current
				if (!svg) return
				const pt = svg.createSVGPoint()
				pt.x = (midX + perpX) * zoomLevel
				pt.y = (midY + perpY) * zoomLevel
				const ctm = svg.getScreenCTM()
				if (!ctm) return
				const screenPt = pt.matrixTransform(ctm)

				setHoveredLink({
					source: d.source,
					target: d.target,
					value: d.value,
					x: screenPt.x,
					y: screenPt.y,
				})

				// Highlight the line
				d3.select(this)
					.transition()
					.duration(200)
					.attr('stroke-width', (d: any) => {
						const baseWidth = Math.pow(d.value, 1.2) * 1.5
						return baseWidth * 2
					})
			})
			.on('mouseleave', function (_event, _d) {
				setHoveredLink(null)

				// Restore original width
				d3.select(this)
					.transition()
					.duration(200)
					.attr('stroke-width', (d: any) => {
						const baseWidth = Math.pow(d.value, 1.2) * 1.5
						if (!selectedFlowNode) return baseWidth
						const isConnected =
							d.source === selectedFlowNode || d.target === selectedFlowNode
						return isConnected ? baseWidth * 1.5 : baseWidth
					})
			})

		g.append('g')
			.selectAll('circle')
			.data(nodes)
			.enter()
			.append('circle')
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.attr('r', (d) =>
				d.value < 2
					? 40
					: d.value < 6
						? d.value * 14
						: Math.pow(d.value, 0.85) * 5
			)
			.attr('fill', (d) => getZoneColor(d.id))
			.attr('stroke', (d) => (d.id === selectedFlowNode ? '#fbbf24' : 'white'))
			.attr('stroke-width', (d) => (d.id === selectedFlowNode ? 8 : 3))
			.attr('opacity', (d) => {
				if (!selectedFlowNode) return 0.9
				return connectedNodes.has(d.id) ? 1 : 0.4
			})
			.style('cursor', 'pointer')
			.on('click', (event, d) => {
				event.stopPropagation()
				setSelectedFlowNode((prev) => (prev === d.id ? null : d.id))
			})
			.on('mouseenter', function () {
				d3.select(this).transition().duration(200).attr('stroke-width', 8)
			})
			.on('mouseleave', function (_event, d) {
				d3.select(this)
					.transition()
					.duration(200)
					.attr('stroke-width', d.id === selectedFlowNode ? 8 : 3)
			})

		// Add node labels above circles
		g.append('g')
			.selectAll('text')
			.data(nodes)
			.enter()
			.append('text')
			.attr('x', (d) => d.x)
			.attr('y', (d) => {
				const radius =
					d.value < 2
						? 40
						: d.value < 6
							? d.value * 14
							: Math.pow(d.value, 0.85) * 5
				return d.y - radius - 20 // Position above the circle
			})
			.attr('text-anchor', 'middle')
			.attr('font-size', '48px')
			.attr('font-weight', 'bold')
			.attr('fill', (d) => (d.id === selectedFlowNode ? '#fbbf24' : 'white'))
			.attr('stroke', 'black')
			.attr('stroke-width', 3)
			.attr('paint-order', 'stroke')
			.attr('pointer-events', 'none')
			.text((d) => d.id)

		svg.on('click', () => setSelectedFlowNode(null))
	}, [
		showFlowData,
		flowData,
		zonesPathsInDepthD3,
		width,
		height,
		zoomLevel,
		selectedFlowNode,
	])

	useEffect(() => {
		if (!heatmapContainerRef.current || heatmaps.length === 0) return

		const container = heatmapContainerRef.current
		container.style.width = `${width * zoomLevel}px`
		container.style.height = `${height * zoomLevel}px`

		if (heatmapInstanceRef.current) {
			const existingCanvas = container.querySelector('canvas')
			if (existingCanvas) {
				existingCanvas.remove()
			}
			heatmapInstanceRef.current = null
		}

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
			console.error('Heatmap rendering error:', error)
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
					totalHeat: Number.parseFloat(totalHeat.toFixed(2)),
					avgHeat: Number.parseFloat(avgHeat.toFixed(2)),
					number_of_people: number_of_people,
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

						ctx.font = '32px sans-serif'
						ctx.fillStyle = 'black'
						ctx.textAlign = 'center'
						ctx.textBaseline = 'middle'
						ctx.fillText(zone.name, center.x, center.y)
					})
				}

				if (showFlowData && d3FlowSvgRef.current) {
					const svgElement = d3FlowSvgRef.current
					const serializer = new XMLSerializer()
					const svgString = serializer.serializeToString(svgElement)

					const svgBlob = new Blob([svgString], {
						type: 'image/svg+xml;charset=utf-8',
					})
					const svgUrl = URL.createObjectURL(svgBlob)

					const svgImg = new Image()
					svgImg.onload = () => {
						ctx.drawImage(svgImg, 0, 0, width, height)
						URL.revokeObjectURL(svgUrl)

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
					svgImg.src = svgUrl
				} else {
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
		}
	}, [width, height, backgroundImage, zones, exportName, showFlowData])

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
							className='flex cursor-pointer flex-col gap-y-1 text-xs font-medium'
						>
							{t('Analytics.heatmap.showFlow')}

							{selectedFlowNode && (
								<span className='bold uppercase'>({selectedFlowNode})</span>
							)}
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
					className='Xh-[550px] relative w-full overflow-auto rounded-lg border border-primary'
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
					{showFlowData && (flowData.length > 0 || zonesPathsInDepthD3) && (
						<svg
							ref={d3FlowSvgRef}
							className='pointer-events-auto absolute inset-0 z-30'
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
					{hoveredLink && (
						<div
							className='pointer-events-none absolute z-50 rounded-lg border border-white/20 bg-black/95 px-4 py-3 text-sm text-white shadow-xl'
							style={{
								left: `${hoveredLink.x}px`,
								top: `${hoveredLink.y}px`,
								transform: 'translate(-50%, -100%)',
								marginTop: '-10px',
							}}
						>
							<div className='mb-2 font-semibold text-white'>
								Transition Flow
							</div>
							<div className='space-y-1 text-xs text-gray-300'>
								<div className='flex items-center gap-2'>
									<span className='text-green-400'>From:</span>
									<span className='font-medium text-white'>
										{hoveredLink.source}
									</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='text-red-400'>To:</span>
									<span className='font-medium text-white'>
										{hoveredLink.target}
									</span>
								</div>
								<div className='mt-1 flex justify-between gap-4 border-t border-white/10 pt-1'>
									<span>People:</span>
									<span className='font-medium text-white'>
										{hoveredLink.value}
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
