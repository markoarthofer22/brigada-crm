import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
	const { t } = useTranslation()
	const [selectedMetric, setSelectedMetric] = useState('demographics')
	const [selectedTrackings, setSelectedTrackings] = useState<number[]>([])
	const [selectedDataPoints, setSelectedDataPoints] = useState<string[]>([])

	const chartOptions = [
		{ value: 'demographics', label: t('Analytics.demographics') },
		{ value: 'ageGroups', label: t('Analytics.years') },
		{ value: 'duration', label: t('Analytics.duration') },
		{ value: 'zones', label: t('Analytics.tabs.zones') },
	]

	const convertSecondsToMinutes = (seconds: number) => {
		return Math.round((seconds / 60) * 100) / 100
	}

	const filteredData = useMemo(() => {
		return data.filter((record) =>
			selectedTrackings.includes(record.id_tracking)
		)
	}, [data, selectedTrackings])

	const availableDataPoints = useMemo(() => {
		if (!data || data.length === 0) return []

		switch (selectedMetric) {
			case 'demographics':
				return [
					{ key: 'broj_muski', name: t('Analytics.males') },
					{ key: 'broj_zenski', name: t('Analytics.females') },
					{ key: 'broj_ljudi', name: t('Analytics.totalPeople') },
				]

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

	// Reset selected data points when metric changes
	useEffect(() => {
		if (availableDataPoints.length > 0) {
			setSelectedDataPoints([availableDataPoints[0].key])
		}
	}, [selectedMetric]) // Remove availableDataPoints from dependency array

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
			case 'demographics': {
				return selectedPoints.map((point: any) => {
					const dataPoint: { [key: string]: any } = { metric: point.name }
					filteredData.forEach((record) => {
						dataPoint[`${t('Analytics.tracking')} #${record.id_tracking}`] =
							record.data[point.key]
					})
					return dataPoint
				})
			}

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
	}, [filteredData, selectedMetric, selectedDataPoints, availableDataPoints])

	const getChartKeys = () => {
		if (!filteredData || filteredData.length === 0) return []
		return filteredData.map(
			(record) => `${t('Analytics.tracking')} #${record.id_tracking}`
		)
	}

	const contrastColors = [
		'#1f77b4',
		'#ff7f0e',
		'#2ca02c',
		'#d62728',
		'#9467bd',
		'#8c564b',
		'#e377c2',
		'#7f7f7f',
		'#bcbd22',
		'#17becf',
		'#aec7e8',
		'#ffbb78',
	]

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
					<CardTitle>{t('Analytics.chart')}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-center text-muted-foreground'>
						{t('Analytics.noDataAvailable')}
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Accordion
			type='single'
			collapsible
			className='w-full'
			defaultValue='analytics-chart'
		>
			<AccordionItem value='analytics-chart'>
				<AccordionTrigger className='text-lg font-semibold'>
					📊 {t('Analytics.chart')} ({selectedTrackings.length}{' '}
					{t('Analytics.selected')})
				</AccordionTrigger>
				<AccordionContent>
					<Card>
						<CardHeader>
							<div className='flex flex-col gap-4'>
								{/* Metric Selection */}
								<div className='flex items-center gap-4'>
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
								</div>

								{/* Selection Controls */}
								<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
									{/* Tracking Selection */}
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
							</div>
						</CardHeader>
						<CardContent>
							<div className='h-96'>
								<ResponsiveContainer width='100%' height='100%'>
									<LineChart data={chartData} margin={{ bottom: 20 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis
											dataKey='metric'
											tick={{ fontSize: 10 }}
											angle={-20}
											textAnchor='end'
											height={50}
										/>
										<YAxis
											label={{
												value:
													selectedMetric === 'duration' ||
													selectedMetric === 'zones'
														? 'Minutes'
														: 'Count',
												angle: -90,
												position: 'insideLeft',
											}}
											tick={{ fontSize: 10 }}
										/>
										<Tooltip
											formatter={(value: any, name: string) => [
												selectedMetric === 'duration' ||
												selectedMetric === 'zones'
													? `${value}min`
													: value,
												name,
											]}
											contentStyle={{ fontSize: '12px' }}
										/>
										<Legend wrapperStyle={{ fontSize: '12px' }} />
										{getChartKeys().map((key, index) => (
											<Line
												key={key}
												type='monotone'
												dataKey={key}
												stroke={contrastColors[index % contrastColors.length]}
												strokeWidth={2}
												activeDot={{ r: 6 }}
											/>
										))}
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}
