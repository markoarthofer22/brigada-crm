'use client'

import { useState } from 'react'
import { CHART_COLORS } from '@/consts'
import { Clock, MapPin, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { handleScreenshot } from '@/lib/utils.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import AnswersDetailsAccordions from '@/features/analytics/(components)/answers-details-accordions.tsx'

interface TotalDataProps {
	data: any
	projectName: string
}

export default function TotalData({ data, projectName }: TotalDataProps) {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()

	const [isZoneImageDownloading, setIsZoneImageDownloading] =
		useState<boolean>(false)

	const [viewStates, setViewStates] = useState<{
		[key: string]: 'table' | 'chart'
	}>({})

	const toggleView = (key: string) => {
		setViewStates((prev) => ({
			...prev,
			[key]: prev[key] === 'chart' ? 'table' : 'chart',
		}))
	}

	const handleScreenshotDownload = async (
		id: string,
		name: string,
		buttonId: string
	) => {
		setIsZoneImageDownloading(true)
		try {
			const translatedName = t('Analytics.downloadName', {
				projectName,
				name,
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

	const formatSeconds = (sec: number) => {
		if (!isFinite(sec) || sec <= 0) return '-'

		const totalSeconds = Math.round(sec)
		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60

		if (hours && minutes) return `${hours}h ${minutes} min`
		if (hours && !minutes) return `${hours}h`
		return `${minutes ? `${minutes} min` : ''} ${seconds} sec`.trim()
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
						<div className='text-2xl font-bold'>{data.gender.broj_ljudi}</div>
						<p className='text-xs text-muted-foreground'>
							{data.gender.data.map((item: any, index: number) => (
								<span key={index}>
									{item.count} {item.label}
									{index < data.gender.data.length - 1 && ', '}
								</span>
							))}
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
								{data?.trackings?.average_people?.total?.toFixed(1) || '0'}
							</p>
							<div className='grid grid-cols-2 gap-2 text-xs'>
								{data?.trackings?.average_people?.per_gender?.map(
									(item: any, index: number) => (
										<div key={index} className='rounded bg-blue-50 p-2'>
											<span className='font-medium text-blue-700'>
												{item.label}
											</span>
											<div className='font-semibold text-blue-900'>
												{item.avg ? item.avg.toFixed(3) : '0'}
											</div>
										</div>
									)
								)}

								{/* <div className='rounded bg-blue-50 p-2'>
									<span className='font-medium text-blue-700'>
										{t('Analytics.males')}
									</span>
									<div className='font-semibold text-blue-900'>
										{(() => {
											// debugger // 👈 this pauses execution when DevTools are open
											return (
												data?.trackings?.average_people?.per_gender?.[0].avg?.toFixed(
													3
												) || '0'
											)
										})()}
									</div>
								</div>
								<div className='rounded bg-pink-50 p-2'>
									<span className='font-medium text-pink-700'>
										{t('Analytics.females')}
									</span>
									<div className='font-semibold text-pink-900'>
										{data?.trackings?.average_people?.per_gender?.[1].avg?.toFixed(
											3
										) || '0'}
									</div>
								</div> */}
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
								{data?.trackings?.average_lasted?.per_gender?.map(
									(item: any, index: number) => (
										<div key={index} className='rounded bg-blue-50 p-2'>
											<span className='font-medium text-blue-700'>
												{item.label}
											</span>
											<div className='font-semibold text-blue-900'>
												{formatSeconds(item.avg)}
											</div>
										</div>
									)
								)}
								{/* <div className='rounded bg-blue-50 p-2'>
									<span className='font-medium text-blue-700'>
										{t('Analytics.males')}
									</span>
									<div className='font-semibold text-blue-900'>
										{formatSeconds(data.trackings?.average_lasted?.per_males)}
									</div>
								</div> */}
								{/* <div className='rounded bg-pink-50 p-2'>
									<span className='font-medium text-pink-700'>
										{t('Analytics.females')}
									</span>
									<div className='font-semibold text-pink-900'>
										{formatSeconds(data.trackings?.average_lasted?.per_females)}
									</div>
								</div> */}
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

			{data?.questions_answers && data?.questions_answers.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>{t('Analytics.questionsAnswersAnalysis')}</CardTitle>
						<CardDescription>
							{t('Analytics.questionsAnswersDesc')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<AnswersDetailsAccordions data={data} projectName={projectName} />
					</CardContent>
				</Card>
			)}

			<Card id='age-groups-chart'>
				<CardHeader className='flex flex-row items-center justify-between'>
					<div>
						<CardTitle>{t('Analytics.ageGroups')}</CardTitle>
						<CardDescription>{t('Analytics.ageGroupsDesc')}</CardDescription>
					</div>

					<div
						id='age-groups-download-button'
						className='flex items-center gap-2'
					>
						{viewStates['age-groups'] === 'chart' && (
							<Button
								disabled={isZoneImageDownloading}
								onClick={async () => {
									await handleScreenshotDownload(
										'age-groups-chart',
										t('Analytics.ageGroups'),
										'age-groups-download-button'
									)
								}}
								variant='default'
							>
								{t('Analytics.downloadImage')}
							</Button>
						)}

						<Button variant='outline' onClick={() => toggleView('age-groups')}>
							{viewStates['age-groups'] === 'chart'
								? t('Analytics.showTable')
								: t('Analytics.showGraphic')}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{viewStates['age-groups'] === 'chart' ? (
						<ChartContainer
							config={{
								count: { label: t('Analytics.count'), color: CHART_COLORS[0] },
							}}
							className='h-[400px] w-full'
						>
							<BarChart
								data={data.dobna_skupina.data}
								margin={{ bottom: 40, left: 20, right: 20 }}
							>
								<XAxis dataKey='label' />
								<YAxis />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey='count' fill={CHART_COLORS[0]} />
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

			<Card id='profile-groups-chart'>
				<CardHeader className='flex flex-row items-center justify-between'>
					<div>
						<CardTitle>{t('Analytics.profileGroups')}</CardTitle>
						<CardDescription>
							{t('Analytics.profileGroupsDesc')}
						</CardDescription>
					</div>

					<div
						id='profile-groups-download-button'
						className='flex items-center gap-2'
					>
						{viewStates['profile-groups'] === 'chart' && (
							<Button
								disabled={isZoneImageDownloading}
								onClick={async () => {
									await handleScreenshotDownload(
										'profile-groups-chart',
										t('Analytics.profileGroups'),
										'profile-groups-download-button'
									)
								}}
								variant='default'
							>
								{t('Analytics.downloadImage')}
							</Button>
						)}
						<Button
							variant='outline'
							onClick={() => toggleView('profile-groups')}
						>
							{viewStates['profile-groups'] === 'chart'
								? t('Analytics.showTable')
								: t('Analytics.showGraphic')}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{viewStates['profile-groups'] === 'chart' ? (
						<ChartContainer
							config={{
								count: { label: t('Analytics.count'), color: CHART_COLORS[0] },
							}}
							className='h-[400px] w-full'
						>
							<BarChart
								data={data.profile.data}
								margin={{ bottom: 40, left: 20, right: 20 }}
							>
								<XAxis dataKey='label' />
								<YAxis />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey='count' fill={CHART_COLORS[0]} />
							</BarChart>
						</ChartContainer>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('Analytics.profileGroup')}</TableHead>
									<TableHead>{t('Analytics.count')}</TableHead>
									<TableHead>{t('Analytics.percentage')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.profile.data.map((item: any) => (
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
											{data.trackings?.average_people?.total?.toFixed(2) || '0'}
										</span>
									</div>
								</div>
								{data.trackings?.average_people?.per_gender?.map(
									(item: any, index: number) => (
										<div
											key={index}
											className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'
										>
											<div className='flex items-center justify-between'>
												<span className='text-sm font-medium text-blue-700'>
													{item.label}
												</span>
												<span className='text-lg font-bold text-blue-900'>
													{item.avg?.toFixed(2) || '0'}
												</span>
											</div>
										</div>
									)
								)}

								{/* <div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'>
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
								</div> */}
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
								{data.trackings?.average_lasted?.per_gender?.map(
									(item: any, index: number) => (
										<div
											key={index}
											className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'
										>
											<div className='flex items-center justify-between'>
												<span className='text-sm font-medium text-blue-700'>
													{item.label}
												</span>
												<span className='text-lg font-bold text-blue-900'>
													{formatSeconds(item.avg)}
												</span>
											</div>
										</div>
									)
								)}

								{/* <div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'>
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
								</div> */}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
