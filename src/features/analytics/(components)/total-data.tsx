'use client'

import { useState } from 'react'
import { intervalToDuration } from 'date-fns'
import { Clock, MapPin, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'

interface TotalDataProps {
	data: any
}

export default function TotalData({ data }: TotalDataProps) {
	const { t } = useTranslation()
	const [viewStates, setViewStates] = useState<{
		[key: string]: 'table' | 'chart'
	}>({})

	const toggleView = (key: string) => {
		setViewStates((prev) => ({
			...prev,
			[key]: prev[key] === 'chart' ? 'table' : 'chart',
		}))
	}

	const formatSeconds = (sec: number) => {
		if (!sec || sec <= 0) return '-'

		const duration = intervalToDuration({ start: 0, end: sec * 1000 })
		const { hours, minutes } = duration

		if (hours && minutes) return `${hours}h ${minutes} min`
		if (hours && !minutes) return `${hours}h`
		return `${minutes} min`
	}

	if (!data || Object.keys(data).length === 0) {
		return (
			<div className='p-4 text-center'>
				<p className='text-lg text-muted-foreground'>
					{t('Analytics.noDataAvailable')}
				</p>
			</div>
		)
	}

	return (
		<div className='mt-8 space-y-8'>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('Analytics.totalPeople')}
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{data.broj_ljudi}</div>
						<p className='text-xs text-muted-foreground'>
							{data.broj_muski} {t('Analytics.males')}, {data.broj_zenski}{' '}
							{t('Analytics.females')}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('Analytics.totalTrackings')}
						</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{data.trackings?.count || 0}
						</div>
						<div className='mt-2 space-y-2'>
							<p className='text-xs text-muted-foreground'>
								{t('Analytics.avgPeoplePerTracking')}{' '}
								{data.trackings?.average_people?.per_tracking?.toFixed(1) ||
									'0'}
							</p>
							<div className='grid grid-cols-2 gap-2 text-xs'>
								<div className='rounded bg-blue-50 p-2'>
									<span className='font-medium text-blue-700'>
										{t('Analytics.males')}
									</span>
									<div className='font-semibold text-blue-900'>
										{data.trackings?.average_people?.per_tracking_males?.toFixed(
											3
										) || '0'}
									</div>
								</div>
								<div className='rounded bg-pink-50 p-2'>
									<span className='font-medium text-pink-700'>
										{t('Analytics.females')}
									</span>
									<div className='font-semibold text-pink-900'>
										{data.trackings?.average_people?.per_tracking_females?.toFixed(
											3
										) || '0'}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('Analytics.totalDuration')}
						</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{formatSeconds(data.trackings?.total_lasted)}
						</div>
						<div className='mt-2 space-y-2'>
							<p className='text-xs text-muted-foreground'>
								{t('Analytics.avgPerPerson')}{' '}
								{formatSeconds(data.trackings?.average_lasted?.per_people)}
							</p>
							<div className='grid grid-cols-2 gap-2 text-xs'>
								<div className='rounded bg-blue-50 p-2'>
									<span className='font-medium text-blue-700'>
										{t('Analytics.males')}
									</span>
									<div className='font-semibold text-blue-900'>
										{formatSeconds(data.trackings?.average_lasted?.per_males)}
									</div>
								</div>
								<div className='rounded bg-pink-50 p-2'>
									<span className='font-medium text-pink-700'>
										{t('Analytics.females')}
									</span>
									<div className='font-semibold text-pink-900'>
										{formatSeconds(data.trackings?.average_lasted?.per_females)}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							{t('Analytics.activeZones')}
						</CardTitle>
						<MapPin className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{data.zones.per_zone.length}
						</div>
						<p className='text-xs text-muted-foreground'>
							{t('Analytics.monitoringAreas')}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t('Analytics.genderDistribution')}</CardTitle>
					<CardDescription>
						{t('Analytics.genderDistributionDesc')}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer
						config={{
							males: { label: t('Analytics.males'), color: '#0088FE' },
							females: { label: t('Analytics.females'), color: '#00C49F' },
						}}
						className='h-[400px]'
					>
						<PieChart>
							<Pie
								data={[
									{
										name: t('Analytics.males'),
										value: data.broj_muski,
										fill: '#0088FE',
									},
									{
										name: t('Analytics.females'),
										value: data.broj_zenski,
										fill: '#00C49F',
									},
								]}
								cx='50%'
								cy='50%'
								outerRadius={120}
								dataKey='value'
								label={({ name, value, percent }) =>
									`${name}: ${value} (${(percent * 100).toFixed(0)}%)`
								}
							/>
							<ChartTooltip content={<ChartTooltipContent />} />
						</PieChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{/* Age Groups */}
			<Card>
				<CardHeader className='flex flex-row items-center justify-between'>
					<div>
						<CardTitle>{t('Analytics.ageGroups')}</CardTitle>
						<CardDescription>{t('Analytics.ageGroupsDesc')}</CardDescription>
					</div>
					<Button variant='outline' onClick={() => toggleView('age-groups')}>
						{viewStates['age-groups'] === 'chart'
							? t('Analytics.showTable')
							: t('Analytics.showGraphic')}
					</Button>
				</CardHeader>
				<CardContent>
					{viewStates['age-groups'] === 'chart' ? (
						<ChartContainer
							config={{
								count: { label: t('Analytics.count'), color: '#8884D8' },
							}}
							className='h-[400px]'
						>
							<BarChart data={data.dobna_skupina.data}>
								<XAxis dataKey='label' />
								<YAxis />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey='count' fill='#8884D8' />
							</BarChart>
						</ChartContainer>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('Analytics.ageGroup')}</TableHead>
									<TableHead>{t('Analytics.count')}</TableHead>
									<TableHead>{t('Analytics.percentage')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.dobna_skupina.data.map((item: any) => (
									<TableRow key={item.label}>
										<TableCell className='font-medium'>{item.label}</TableCell>
										<TableCell>{item.count}</TableCell>
										<TableCell>{item.percentage.toFixed(2)}%</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t('Analytics.trackingStatistics')}</CardTitle>
					<CardDescription>
						{t('Analytics.detailedTrackingBreakdown')}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
						<div className='space-y-4'>
							<h4 className='text-lg font-semibold text-gray-900'>
								{t('Analytics.averagePeoplePerTracking')}
							</h4>
							<div className='space-y-3'>
								<div className='rounded-lg bg-gray-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-gray-700'>
											{t('Analytics.total')}
										</span>
										<span className='text-lg font-bold text-gray-900'>
											{data.trackings?.average_people?.per_tracking?.toFixed(
												2
											) || '0'}
										</span>
									</div>
								</div>
								<div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-blue-700'>
											{t('Analytics.males')}
										</span>
										<span className='text-lg font-bold text-blue-900'>
											{data.trackings?.average_people?.per_tracking_males?.toFixed(
												2
											) || '0'}
										</span>
									</div>
								</div>
								<div className='rounded-lg border-l-4 border-pink-500 bg-pink-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-pink-700'>
											{t('Analytics.females')}
										</span>
										<span className='text-lg font-bold text-pink-900'>
											{data.trackings?.average_people?.per_tracking_females?.toFixed(
												2
											) || '0'}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							<h4 className='text-lg font-semibold text-gray-900'>
								{t('Analytics.averageDurationPerPerson')}
							</h4>
							<div className='space-y-3'>
								<div className='rounded-lg bg-gray-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-gray-700'>
											{t('Analytics.overall')}
										</span>
										<span className='text-lg font-bold text-gray-900'>
											{formatSeconds(
												data.trackings?.average_lasted?.per_people
											)}
										</span>
									</div>
								</div>
								<div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-blue-700'>
											{t('Analytics.males')}
										</span>
										<span className='text-lg font-bold text-blue-900'>
											{formatSeconds(data.trackings?.average_lasted?.per_males)}
										</span>
									</div>
								</div>
								<div className='rounded-lg border-l-4 border-pink-500 bg-pink-50 p-3'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium text-pink-700'>
											{t('Analytics.females')}
										</span>
										<span className='text-lg font-bold text-pink-900'>
											{formatSeconds(
												data.trackings?.average_lasted?.per_females
											)}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
