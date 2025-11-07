'use client'

import { useEffect, useMemo, useState } from 'react'
import { CHART_COLORS } from '@/consts'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { handleScreenshot } from '@/lib/utils.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface AnalyticsChartProps {
	data: any[]
	projectName: string
}

export default function AnalyticsChart({
	data,
	projectName,
}: AnalyticsChartProps) {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()
	const [selectedMetric, setSelectedMetric] = useState('ageGroups')
	const [selectedTrackings, setSelectedTrackings] = useState<number[]>([])
	const [selectedDataPoints, setSelectedDataPoints] = useState<string[]>([])
	const [isZoneImageDownloading, setIsZoneImageDownloading] =
		useState<boolean>(false)

	const chartOptions = [
		{ value: 'ageGroups', label: t('Analytics.years') },
		{ value: 'duration', label: t('Analytics.duration') },
		{ value: 'zones', label: t('Analytics.tabs.zones') },
	]

	const convertSecondsToMinutes = (seconds: number) => {
		return Math.round((seconds / 60) * 100) / 100
	}

	// Initialize selected trackings on mount
	useEffect(() => {
		if (data && data.length > 0 && selectedTrackings.length === 0) {
			setSelectedTrackings([data[0].id_tracking])
		}
	}, [data, selectedTrackings.length])

	const filteredData = useMemo(() => {
		return data.filter((record) =>
			selectedTrackings.includes(record.id_tracking)
		)
	}, [data, selectedTrackings])

	const availableDataPoints = useMemo(() => {
		if (!data || data.length === 0) return []
		switch (selectedMetric) {
			case 'ageGroups':
				return data[0].data.dobna_skupina.data.map((age: any) => ({
					key: age.label,
					name: age.label,
				}))
			case 'duration':
				return [
					{ key: 'total', name: t('Analytics.duration') },
					...data[0].zones.map((zone: any) => ({
						key: zone.name,
						name: zone.name,
					})),
				]
			case 'zones':
				return data[0].zones.map((zone: any) => ({
					key: zone.name,
					name: zone.name,
				}))
			default:
				return []
		}
	}, [data, selectedMetric, t])

	useEffect(() => {
		if (availableDataPoints.length > 0) {
			setSelectedDataPoints(availableDataPoints.map((point: any) => point.key))
		}
	}, [selectedMetric])

	const chartData = useMemo(() => {
		if (
			!filteredData ||
			filteredData.length === 0 ||
			selectedDataPoints.length === 0
		)
			return []

		const selectedPoints = availableDataPoints.filter((point: any) =>
			selectedDataPoints.includes(point.key)
		)

		switch (selectedMetric) {
			case 'ageGroups': {
				return selectedPoints.map((point: any) => {
					const dataPoint: { [key: string]: any } = { metric: point.name }
					filteredData.forEach((record) => {
						const ageGroup = record.data.dobna_skupina.data.find(
							(ag: any) => ag.label === point.key
						)
						dataPoint[`${t('Analytics.tracking')} #${record.id_tracking}`] =
							ageGroup ? ageGroup.count : 0
					})
					return dataPoint
				})
			}
			case 'duration': {
				return selectedPoints.map((point: any) => {
					const dataPoint: { [key: string]: any } = { metric: point.name }
					filteredData.forEach((record) => {
						if (point.key === 'total') {
							dataPoint[`${t('Analytics.tracking')} #${record.id_tracking}`] =
								convertSecondsToMinutes(record.lasted.seconds)
						} else {
							const zone = record.zones.find((z: any) => z.name === point.key)
							dataPoint[`${t('Analytics.tracking')} #${record.id_tracking}`] =
								zone ? convertSecondsToMinutes(zone.lasted.seconds) : 0
						}
					})
					return dataPoint
				})
			}
			case 'zones': {
				return selectedPoints.map((point: any) => {
					const dataPoint: { [key: string]: any } = { metric: point.name }
					filteredData.forEach((record) => {
						const zone = record.zones.find((z: any) => z.name === point.key)
						dataPoint[`${t('Analytics.tracking')} #${record.id_tracking}`] =
							zone ? convertSecondsToMinutes(zone.lasted.seconds) : 0
					})
					return dataPoint
				})
			}
			default:
				return []
		}
	}, [filteredData, selectedDataPoints, availableDataPoints, selectedMetric, t])

	const getChartKeys = () => {
		if (!filteredData || filteredData.length === 0) return []
		return filteredData.map(
			(record) => `${t('Analytics.tracking')} #${record.id_tracking}`
		)
	}

	const handleScreenshotDownload = async (
		id: string,
		name: string,
		buttonId: string
	) => {
		setIsZoneImageDownloading(true)

		const findSelectedMetricLabel = chartOptions.find(
			(option) => option.value === name
		)?.label

		try {
			const translatedName = t('Analytics.downloadName', {
				projectName,
				name: findSelectedMetricLabel,
			})

			await handleScreenshot(
				document.getElementById(id),
				translatedName,
				buttonId
			)
		} catch (error: unknown) {
			console.error(error)
			handleError(error)
		} finally {
			setIsZoneImageDownloading(false)
		}
	}

	// Create chart config dynamically
	const chartConfig = useMemo(() => {
		const config: ChartConfig = {}
		getChartKeys().forEach((key, index) => {
			config[key] = {
				label: key,
				color: CHART_COLORS[index % CHART_COLORS.length],
			}
		})
		return config
	}, [CHART_COLORS, getChartKeys])

	const handleTrackingToggle = (trackingId: number) => {
		setSelectedTrackings((prev) =>
			prev.includes(trackingId)
				? prev.filter((id) => id !== trackingId)
				: [...prev, trackingId]
		)
	}

	const handleDataPointToggle = (dataPointKey: string) => {
		setSelectedDataPoints((prev) =>
			prev.includes(dataPointKey)
				? prev.filter((key) => key !== dataPointKey)
				: [...prev, dataPointKey]
		)
	}

	const handleSelectAll = () => {
		setSelectedTrackings(data.map((record) => record.id_tracking))
	}

	const handleDeselectAll = () => {
		setSelectedTrackings([])
	}

	const handleSelectAllDataPoints = () => {
		setSelectedDataPoints(availableDataPoints.map((point: any) => point.key))
	}

	const handleDeselectAllDataPoints = () => {
		setSelectedDataPoints([])
	}

	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<p className='text-center text-muted-foreground'>
						{t('Analytics.noDataAvailable')}
					</p>
				</CardHeader>
			</Card>
		)
	}

	return (
		<Accordion type='single' collapsible className='w-full'>
			<AccordionItem value='analytics-chart'>
				<AccordionTrigger className='text-lg font-semibold'>
					📊 {t('Analytics.chart')} ({selectedTrackings.length}{' '}
					{t('Analytics.selected')})
				</AccordionTrigger>
				<AccordionContent>
					<Card>
						<CardHeader>
							<div className='flex flex-col gap-4'>
								<div className='flex items-center justify-between gap-4'>
									<Select
										value={selectedMetric}
										onValueChange={setSelectedMetric}
									>
										<SelectTrigger className='w-48'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{chartOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<div id='general-data-buttons'>
										<Button
											disabled={isZoneImageDownloading}
											onClick={async () => {
												await handleScreenshotDownload(
													'general-data-chart',
													selectedMetric,
													'general-data-buttons'
												)
											}}
											variant='default'
										>
											{t('Analytics.downloadImage')}
										</Button>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent id='general-data-chart'>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div className='flex flex-col gap-2'>
									<div className='flex gap-2'>
										<button
											onClick={handleSelectAll}
											className='text-xs text-blue-600 hover:text-blue-800'
										>
											{t('Analytics.selectAll')}
										</button>
										<button
											onClick={handleDeselectAll}
											className='text-xs text-red-600 hover:text-red-800'
										>
											{t('Analytics.deselectAll')}
										</button>
									</div>
									<ScrollArea className='h-32 w-full rounded border p-2'>
										<div className='space-y-2'>
											{data.map((record) => (
												<div
													key={record.id_tracking}
													className='flex items-center space-x-2'
												>
													<Checkbox
														id={`tracking-${record.id_tracking}`}
														checked={selectedTrackings.includes(
															record.id_tracking
														)}
														onCheckedChange={() =>
															handleTrackingToggle(record.id_tracking)
														}
													/>
													<label
														htmlFor={`tracking-${record.id_tracking}`}
														className='text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
													>
														{t('Analytics.tracking')} #{record.id_tracking}
													</label>
												</div>
											))}
										</div>
									</ScrollArea>
								</div>
								<div className='flex flex-col gap-2'>
									<div className='flex gap-2'>
										<button
											onClick={handleSelectAllDataPoints}
											className='text-xs text-blue-600 hover:text-blue-800'
										>
											{t('Analytics.selectAll')}
										</button>
										<button
											onClick={handleDeselectAllDataPoints}
											className='text-xs text-red-600 hover:text-red-800'
										>
											{t('Analytics.deselectAll')}
										</button>
									</div>
									<ScrollArea className='h-32 w-full rounded border p-2'>
										<div className='space-y-2'>
											{availableDataPoints.map((point: any) => (
												<div
													key={point.key}
													className='flex items-center space-x-2'
												>
													<Checkbox
														id={`datapoint-${point.key}`}
														checked={selectedDataPoints.includes(point.key)}
														onCheckedChange={() =>
															handleDataPointToggle(point.key)
														}
													/>
													<label
														htmlFor={`datapoint-${point.key}`}
														className='text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
													>
														{point.name}
													</label>
												</div>
											))}
										</div>
									</ScrollArea>
								</div>
							</div>
							<ChartContainer config={chartConfig} className='h-96 w-full'>
								<AreaChart
									stackOffset='expand'
									data={chartData}
									margin={{ top: 20, right: 20, bottom: 5, left: 20 }}
								>
									<defs>
										{getChartKeys().map((key, index) => (
											<linearGradient
												key={key}
												id={`fill${key.replace(/\s+/g, '').replace(/#/g, '')}`}
												x1='0'
												y1='0'
												x2='0'
												y2='1'
											>
												<stop
													offset='5%'
													stopColor={CHART_COLORS[index % CHART_COLORS.length]}
													stopOpacity={0.8}
												/>
												<stop
													offset='95%'
													stopColor={CHART_COLORS[index % CHART_COLORS.length]}
													stopOpacity={0.1}
												/>
											</linearGradient>
										))}
									</defs>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis
										dataKey='metric'
										tick={{ fontSize: 10 }}
										angle={0}
										textAnchor='end'
										height={40}
										tickLine={false}
										axisLine={false}
									/>
									<YAxis
										tick={{ fontSize: 10 }}
										tickLine={false}
										axisLine={false}
										domain={[0, 'dataMax + 0.15']}
										label={{
											value:
												selectedMetric === 'duration' ||
												selectedMetric === 'zones'
													? 'Minutes'
													: 'Count',
											angle: -90,
											position: 'insideLeft',
										}}
									/>
									<ChartTooltip
										content={<ChartTooltipContent indicator='dot' />}
									/>
									{getChartKeys().map((key, index) => (
										<Area
											key={key}
											dataKey={key}
											type='natural'
											fill={`url(#fill${key.replace(/\s+/g, '').replace(/#/g, '')})`}
											stroke={CHART_COLORS[index % CHART_COLORS.length]}
											strokeWidth={2}
											stackId='a'
										/>
									))}
									<ChartLegend content={<ChartLegendContent />} />
								</AreaChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}
